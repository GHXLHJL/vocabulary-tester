const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');
const appJsPath = path.join(projectRoot, 'app.js');
let content = fs.readFileSync(appJsPath, 'utf-8');

function getNextVersion(currentVersion) {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1);

    const match = /^v(\d{2})\.(\d{1,2})\.(\d+)$/.exec(currentVersion);
    if (!match) {
        return `v${year}.${month}.1`;
    }

    const [, currentYear, currentMonth, currentCount] = match;
    if (currentYear === year && currentMonth === month) {
        return `v${year}.${month}.${parseInt(currentCount, 10) + 1}`;
    }

    return `v${year}.${month}.1`;
}

const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4]; // 组别

if (arg1 === '--update-version') {
    let oldVersion = 'v0.0.0';
    let newVersion = 'v0.0.0';
    // 寻找 const STORAGE_KEY = 'vocabulary_tester_data_vYY.M.N'; 并按规则更新
    content = content.replace(/const STORAGE_KEY = 'vocabulary_tester_data_(v[^']+)';/, (match, p1) => {
        oldVersion = p1;
        newVersion = getNextVersion(p1);
        return `const STORAGE_KEY = 'vocabulary_tester_data_${newVersion}';`;
    });
    fs.writeFileSync(appJsPath, content, 'utf-8');
    console.log(`[OK] Updated storage version: ${oldVersion} -> ${newVersion}`);
} else if (arg1 && arg2) {
    const newWord = arg1;
    const newMeaning = arg2;
    const groupName = arg3 ? `'${arg3}'` : "'最新添加'"; // 默认放到"最新添加"组，如果是数字也会被处理成字符串形式，显示没问题

    // 定位到 defaultWords 数组的最后一个大括号，然后在它后面插入新单词
    content = content.replace(/(isCorrect:\s*null\s*\}\s*)\n\s*\];/, `$1,\n        { id: generateId(), group: ${groupName}, word: '${newWord.replace(/'/g, "\\'")}', expectedAnswer: '${newMeaning.replace(/'/g, "\\'")}', userAnswer: '', isCorrect: null }\n    ];`);

    fs.writeFileSync(appJsPath, content, 'utf-8');
    console.log(`[OK] Added word to app.js: [${arg3 || 'latest'}] ${newWord} -> ${newMeaning}`);
}
