const fs = require('fs');
const path = require('path');

// 1. 读取相似单词集.txt
const txtPath = path.join(__dirname, '.trae', 'specs', 'vocabulary-tester', '相似单词集.txt');
const appJsPath = path.join(__dirname, 'app.js');

try {
    const txtContent = fs.readFileSync(txtPath, 'utf8');

    // 2. 解析 txt 内容为 JavaScript 对象格式
    let newWordsCode = '';
    let currentGroup = 1;
    const lines = txtContent.split(/\r?\n/);

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // 如果是空行，且上一行不是空行，组号加 1
        if (trimmedLine === '') {
             // 简单的逻辑：只要遇到空行，就认为下面的是新的一组（即使连续多个空行也会增加，这里可以稍微优化）
             // 为了严谨，我们在生成代码时如果这组没有单词，就不应该生成空组，但这里保持简单，直接组号递增。
            currentGroup++;
            return;
        }

        // 跳过表头 "相似单词集" 或类似的标题行（如果只有中文没有英文空格）
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2) {
            const word = parts[0];
            const meaning = parts.slice(1).join(' '); // 剩下的部分全部作为释义
            
            // 生成对应的代码字符串
            newWordsCode += `        { id: generateId(), group: ${currentGroup}, word: '${word}', expectedAnswer: '${meaning}', userAnswer: '', isCorrect: null },\n`;
        }
    });

    if (newWordsCode === '') {
         console.log("[ERROR] No valid words were parsed from txt. Check that each line uses: word meaning");
         process.exit(1);
    }


    // 3. 读取 app.js 并进行替换
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');

    // 使用正则表达式匹配并替换 defaultWords 数组的内容
    // 匹配 `const defaultWords = [\n` 到 `    ];\n` 之间的所有内容
    const regexWords = /(const\s+defaultWords\s*=\s*\[\s*\n)[\s\S]*?(\s*\];)/;
    
    if (regexWords.test(appJsContent)) {
        appJsContent = appJsContent.replace(regexWords, `$1${newWordsCode}$2`);
        console.log("[OK] Replaced defaultWords in app.js.");
    } else {
        console.log("[ERROR] Could not find defaultWords array in app.js.");
        process.exit(1);
    }

    // 4. 自动更新 STORAGE_KEY 的版本号 (如 _v18 变成 _v19)
    const regexVersion = /(const\s+STORAGE_KEY\s*=\s*'vocabulary_tester_data_v)(\d+)(';)/;
    appJsContent = appJsContent.replace(regexVersion, (match, p1, p2, p3) => {
        const newVersion = parseInt(p2, 10) + 1;
        console.log(`[OK] Updated storage version: v${p2} -> v${newVersion}`);
        return `${p1}${newVersion}${p3}`;
    });

    // 写回 app.js
    fs.writeFileSync(appJsPath, appJsContent, 'utf8');
    console.log("[DONE] Full word set replacement completed.");

} catch (error) {
    console.error("[ERROR]", error);
}
