const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf-8');

const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4]; // 组别

if (arg1 === '--update-version') {
    let currentVersion = 3;
    // 寻找 const STORAGE_KEY = 'vocabulary_tester_data_vX'; 并将 X 加 1
    content = content.replace(/const STORAGE_KEY = 'vocabulary_tester_data_v(\d+)';/, (match, p1) => {
        currentVersion = parseInt(p1) + 1;
        return `const STORAGE_KEY = 'vocabulary_tester_data_v${currentVersion}';`;
    });
    fs.writeFileSync(appJsPath, content, 'utf-8');
    console.log(`[成功] 强制刷新用户缓存，本地存储版本号已自动更新至 v${currentVersion}`);
} else if (arg1 && arg2) {
    const newWord = arg1;
    const newMeaning = arg2;
    const groupName = arg3 ? `'${arg3}'` : "'最新添加'"; // 默认放到"最新添加"组，如果是数字也会被处理成字符串形式，显示没问题

    // 定位到 defaultWords 数组的最后一个大括号，然后在它后面插入新单词
    content = content.replace(/(isCorrect:\s*null\s*\}\s*)\n\s*\];/, `$1,\n        { id: generateId(), group: ${groupName}, word: '${newWord.replace(/'/g, "\\'")}', expectedAnswer: '${newMeaning.replace(/'/g, "\\'")}', userAnswer: '', isCorrect: null }\n    ];`);

    fs.writeFileSync(appJsPath, content, 'utf-8');
    console.log(`[成功] 已将单词加入底层代码词库: [${arg3 || '最新添加'}] ${newWord} -> ${newMeaning}`);
}