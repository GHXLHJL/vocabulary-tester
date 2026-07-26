const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const RAW_DICT_PATH = path.join(PROJECT_ROOT, 'kaoyan_dict_raw.json');
const SOURCE_PATH = path.join(PROJECT_ROOT, '墨墨单词本6755_单词表.md');
const REPORT_PATH = path.join(PROJECT_ROOT, 'cache', 'momo_wordlist_import_report.json');

function parseArgs(argv) {
    const options = {
        targetCount: 6007,
        importAllMissing: false
    };

    for (let index = 0; index < argv.length; index++) {
        const current = argv[index];
        if (current === '--target' && argv[index + 1]) {
            options.targetCount = Number(argv[index + 1]);
            index++;
        } else if (current === '--all-missing') {
            options.importAllMissing = true;
        }
    }

    if (!options.importAllMissing && (!Number.isInteger(options.targetCount) || options.targetCount <= 0)) {
        throw new Error('targetCount 必须是正整数');
    }

    return options;
}

function parseMarkdownEntries(markdownText) {
    const entries = [];
    const entryPattern = /^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/;

    markdownText.split(/\r?\n/).forEach(line => {
        const match = entryPattern.exec(line);
        if (!match) {
            return;
        }

        const index = Number(match[1]);
        const word = match[2].trim().toLowerCase();
        const meaning = match[3].trim();

        if (!Number.isInteger(index) || !/^[a-z][a-z\-']*$/i.test(word) || !meaning) {
            return;
        }

        entries.push({ index, word, meaning });
    });

    return entries;
}

function main() {
    const { targetCount, importAllMissing } = parseArgs(process.argv.slice(2));
    const rawDict = JSON.parse(fs.readFileSync(RAW_DICT_PATH, 'utf8'));
    const sourceText = fs.readFileSync(SOURCE_PATH, 'utf8');

    const existingWords = new Set(Object.keys(rawDict).map(word => word.toLowerCase()));
    const existingCount = existingWords.size;

    const parsedEntries = parseMarkdownEntries(sourceText);
    const sourceEntries = [];
    const seenWords = new Set();

    parsedEntries.forEach(entry => {
        if (seenWords.has(entry.word)) {
            return;
        }

        seenWords.add(entry.word);
        sourceEntries.push(entry);
    });

    const missingEntries = sourceEntries.filter(entry => !existingWords.has(entry.word));
    const neededCount = importAllMissing ? missingEntries.length : Math.max(targetCount - existingCount, 0);
    const selectedEntries = missingEntries.slice(0, neededCount);

    selectedEntries.forEach(entry => {
        rawDict[entry.word] = {
            translations: [entry.meaning],
            synonyms: []
        };
    });

    fs.writeFileSync(RAW_DICT_PATH, `${JSON.stringify(rawDict, null, 2)}\n`, 'utf8');

    const report = {
        source: path.basename(SOURCE_PATH),
        targetCount: importAllMissing ? null : targetCount,
        importAllMissing,
        existingCount,
        sourceUniqueCount: sourceEntries.length,
        missingCountBeforeImport: missingEntries.length,
        addedCount: selectedEntries.length,
        newCount: existingCount + selectedEntries.length,
        remainingMissingCount: Math.max(missingEntries.length - selectedEntries.length, 0),
        firstAddedIndex: selectedEntries[0]?.index ?? null,
        lastAddedIndex: selectedEntries[selectedEntries.length - 1]?.index ?? null,
        sampleAddedWords: selectedEntries.slice(0, 50).map(entry => entry.word)
    };

    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
}

main();
