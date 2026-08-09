const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');

// 1. 读取相似单词集.txt
const txtPath = path.join(projectRoot, '.trae', 'specs', 'vocabulary-tester', '相似单词集.txt');
const appJsPath = path.join(projectRoot, 'app.js');
const indexHtmlPath = path.join(projectRoot, 'index.html');

function escapeJsString(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'");
}

function normalizeWord(word) {
    return String(word || '').trim().toLowerCase();
}

function getWordListSignature(words) {
    return words
        .map(item => normalizeWord(item.word))
        .filter(Boolean)
        .sort()
        .join('||');
}

function parseExistingGroups(appJsContent) {
    const regexWordsBlock = /const\s+defaultWords\s*=\s*\[\s*\n([\s\S]*?)\s*\];/;
    const blockMatch = appJsContent.match(regexWordsBlock);
    if (!blockMatch) {
        throw new Error('Could not find defaultWords array in app.js.');
    }

    const entryRegex = /group:\s*(\d+),\s*word:\s*'((?:\\'|[^'])*)',\s*expectedAnswer:\s*'((?:\\'|[^'])*)'/g;
    const groups = new Map();

    for (const match of blockMatch[1].matchAll(entryRegex)) {
        const groupId = Number(match[1]);
        const word = match[2].replace(/\\'/g, "'");
        const expectedAnswer = match[3].replace(/\\'/g, "'");
        if (!groups.has(groupId)) {
            groups.set(groupId, {
                groupId,
                words: []
            });
        }
        groups.get(groupId).words.push({ word, expectedAnswer });
    }

    return [...groups.values()].sort((a, b) => a.groupId - b.groupId);
}

function parseTxtGroups(txtContent) {
    const groups = [];
    let currentWords = [];

    txtContent.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            if (currentWords.length > 0) {
                groups.push(currentWords);
                currentWords = [];
            }
            return;
        }

        const parts = trimmedLine.split(/\s+/);
        if (parts.length < 2) {
            return;
        }

        currentWords.push({
            word: parts[0],
            expectedAnswer: parts.slice(1).join(' ')
        });
    });

    if (currentWords.length > 0) {
        groups.push(currentWords);
    }

    return groups;
}

function scoreGroupOverlap(newGroupWords, existingGroupWords) {
    const newSet = new Set(newGroupWords.map(item => normalizeWord(item.word)));
    const existingSet = new Set(existingGroupWords.map(item => normalizeWord(item.word)));
    let overlapCount = 0;
    existingSet.forEach(word => {
        if (newSet.has(word)) {
            overlapCount += 1;
        }
    });
    return overlapCount;
}

function assignStableGroupIds(newGroups, existingGroups) {
    const remainingExistingGroups = [...existingGroups];
    const assignedIds = new Set(existingGroups.map(group => group.groupId));
    let nextGroupId = existingGroups.reduce((maxId, group) => Math.max(maxId, group.groupId), 0) + 1;

    function takeExistingGroup(predicate) {
        const index = remainingExistingGroups.findIndex(predicate);
        if (index === -1) {
            return null;
        }
        return remainingExistingGroups.splice(index, 1)[0];
    }

    return newGroups.map(words => {
        const wordSignature = getWordListSignature(words);
        const exactGroup = takeExistingGroup(group => getWordListSignature(group.words) === wordSignature);
        if (exactGroup) {
            return { groupId: exactGroup.groupId, words };
        }

        let bestIndex = -1;
        let bestOverlap = 0;

        remainingExistingGroups.forEach((group, index) => {
            const overlap = scoreGroupOverlap(words, group.words);
            if (overlap > bestOverlap) {
                bestOverlap = overlap;
                bestIndex = index;
                return;
            }

            if (overlap === bestOverlap && overlap > 0 && bestIndex !== -1) {
                const bestGroup = remainingExistingGroups[bestIndex];
                if (group.groupId < bestGroup.groupId) {
                    bestIndex = index;
                }
            }
        });

        if (bestIndex !== -1 && bestOverlap > 0) {
            const matchedGroup = remainingExistingGroups.splice(bestIndex, 1)[0];
            return { groupId: matchedGroup.groupId, words };
        }

        while (assignedIds.has(nextGroupId)) {
            nextGroupId += 1;
        }
        const groupId = nextGroupId;
        assignedIds.add(groupId);
        nextGroupId += 1;
        return { groupId, words };
    });
}

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

try {
    const txtContent = fs.readFileSync(txtPath, 'utf8');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const existingGroups = parseExistingGroups(appJsContent);
    const parsedTxtGroups = parseTxtGroups(txtContent);
    const resolvedGroups = assignStableGroupIds(parsedTxtGroups, existingGroups);

    // 2. 解析 txt 内容为 JavaScript 对象格式
    let newWordsCode = '';
    resolvedGroups.forEach(group => {
        group.words.forEach(({ word, expectedAnswer }) => {
            newWordsCode += `        { id: generateId(), group: ${group.groupId}, word: '${escapeJsString(word)}', expectedAnswer: '${escapeJsString(expectedAnswer)}', userAnswer: '', isCorrect: null },\n`;
        });
    });

    if (newWordsCode === '') {
         console.log("[ERROR] No valid words were parsed from txt. Check that each line uses: word meaning");
         process.exit(1);
    }


    // 3. 读取 app.js 并进行替换
    let nextAppJsContent = appJsContent;

    // 使用正则表达式匹配并替换 defaultWords 数组的内容
    // 匹配 `const defaultWords = [\n` 到 `    ];\n` 之间的所有内容
    const regexWords = /(const\s+defaultWords\s*=\s*\[\s*\n)[\s\S]*?(\s*\];)/;
    
    if (regexWords.test(nextAppJsContent)) {
        nextAppJsContent = nextAppJsContent.replace(regexWords, `$1${newWordsCode}$2`);
        console.log("[OK] Replaced defaultWords in app.js.");
    } else {
        console.log("[ERROR] Could not find defaultWords array in app.js.");
        process.exit(1);
    }

    // 4. 自动更新 APP_VERSION 的版本号，格式为 v年.月.序号
    let updatedVersion = null;
    const regexVersion = /(const\s+APP_VERSION\s*=\s*')(v[^']+)(';)/;
    nextAppJsContent = nextAppJsContent.replace(regexVersion, (match, p1, p2, p3) => {
        const newVersion = getNextVersion(p2);
        updatedVersion = newVersion;
        console.log(`[OK] Updated app version: ${p2} -> ${newVersion}`);
        return `${p1}${newVersion}${p3}`;
    });

    // 写回 app.js
    fs.writeFileSync(appJsPath, nextAppJsContent, 'utf8');

    // 5. 同步更新前端资源的缓存版本号
    if (updatedVersion && fs.existsSync(indexHtmlPath)) {
        let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
        const assetVersion = updatedVersion.replace(/^v/, '');

        indexHtmlContent = indexHtmlContent.replace(
            /(<link\s+rel="stylesheet"\s+href="style\.css\?v=)[^"]+(")/,
            `$1${assetVersion}$2`
        );

        indexHtmlContent = indexHtmlContent.replace(
            /(<script\s+src="app\.js\?v=)[^"]+("><\/script>)/,
            `$1${assetVersion}$2`
        );

        fs.writeFileSync(indexHtmlPath, indexHtmlContent, 'utf8');
        console.log(`[OK] Synced asset version in index.html to ${assetVersion}`);
    }

    console.log("[DONE] Full word set replacement completed.");

} catch (error) {
    console.error("[ERROR]", error);
}
