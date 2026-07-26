const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RAW_PATH = path.join(ROOT_DIR, 'kaoyan_dict_raw.json');
const OUTPUT_PATH = path.join(ROOT_DIR, 'kaoyan_dict.json');
const REPORT_PATH = path.join(ROOT_DIR, 'report.txt');
const COLLOCATION_REPORT_PATH = path.join(ROOT_DIR, 'collocation_report.txt');
const EXCEPTION_PATH = path.join(ROOT_DIR, 'exception_report.txt');
const MAX_OUTPUT_BYTES = Math.floor(1.5 * 1024 * 1024);

const POS_REGEX = /(vi|vt|adj|adv|prep|conj|pron|num|art|int|ad|a|v|n)\./g;
const POS_ALIAS = {
    vi: 'v',
    vt: 'v',
    v: 'v',
    n: 'n',
    adj: 'adj',
    a: 'adj',
    adv: 'adv',
    ad: 'adv',
    prep: 'prep',
    conj: 'conj',
    pron: 'pron',
    num: 'num',
    art: 'art',
    int: 'int'
};
const LEADING_ENGLISH_NOTE_REGEX = /^\(([A-Za-z,\s/-]+)\)(.+)$/;
const OPTIONAL_CHINESE_PAREN_REGEX = /([（(])([\u4e00-\u9fa5]{1,3})([）)])/;
const PREPOSITION_TOKENS = new Set([
    'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around',
    'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
    'by', 'down', 'for', 'from', 'in', 'into', 'of', 'off', 'on', 'onto',
    'over', 'through', 'to', 'toward', 'under', 'up', 'with', 'within', 'without'
]);

const stats = {
    wordCount: 0,
    originalMeaningCount: 0,
    cleanedMeaningCount: 0,
    splitByPosCount: 0,
    bracketCleanupCount: 0,
    symbolCleanupCount: 0,
    collocationHintCount: 0,
    collocationSavedCount: 0,
    spellingVariantCount: 0,
    properNounNoteCount: 0,
    optionalExpansionCount: 0,
    emptyMeaningRemovedCount: 0,
    dedupedMeaningCount: 0
};

const collocationLogs = [];
const exceptions = [];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeText(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

function normalizePos(posToken) {
    return POS_ALIAS[posToken.toLowerCase()] || posToken.toLowerCase();
}

function addException(word, reason, detail) {
    exceptions.push({ word, reason, detail });
}

function addCollocationLog(word, note, simplified) {
    collocationLogs.push({
        word,
        note,
        simplified
    });
}

function isBrokenLeadingNoteStart(text) {
    return /^\([A-Za-z,\s/-]+$/.test((text || '').trim());
}

function isBrokenLeadingNoteEnd(text) {
    return /^[A-Za-z,\s/-]+\).+/.test((text || '').trim());
}

function mergeBrokenLeadingNotes(items) {
    const merged = [];

    for (let index = 0; index < items.length; index += 1) {
        const current = items[index];
        const next = items[index + 1];

        if (isBrokenLeadingNoteStart(current) && next && isBrokenLeadingNoteEnd(next)) {
            const left = current.trim().slice(1).trim();
            const rightMatch = next.trim().match(/^([A-Za-z,\s/-]+)\)(.+)$/);
            if (rightMatch) {
                const mergedText = `(${left}, ${rightMatch[1].trim()})${rightMatch[2]}`;
                merged.push(mergedText);
                index += 1;
                continue;
            }
        }

        merged.push(current);
    }

    return merged;
}

function classifyLeadingEnglishNote(tokenText) {
    const token = tokenText.trim();
    const normalized = token.toLowerCase();
    const pieces = normalized.split(/[\/,\s-]+/).filter(Boolean);

    if (pieces.length > 0 && pieces.every(piece => PREPOSITION_TOKENS.has(piece))) {
        return 'collocation';
    }

    if (/^[A-Z][a-z]+$/.test(token)) {
        return 'properNoun';
    }

    if (/^[a-z][a-z-]{1,20}$/.test(normalized)) {
        return 'variant';
    }

    return 'other';
}

function removeKnownMarkers(text) {
    let value = (text || '').trim();
    const before = value;

    value = value.replace(/\[[^\]]*]/g, '');
    value = value.replace(/[<>]/g, '');
    value = value.replace(/&/g, '');
    value = value.replace(/^\//g, '');
    value = value.replace(/\s+/g, '');

    if (value !== before) {
        if (/\[[^\]]*]/.test(before)) {
            stats.bracketCleanupCount += 1;
        }
        if (/[<>&]|\s|^\//.test(before)) {
            stats.symbolCleanupCount += 1;
        }
    }

    return value.trim();
}

function normalizeMalformedPosMarkers(text) {
    return (text || '')
        .replace(/\s+(vi|vt|adj|adv|prep|conj|pron|num|art|int|ad|a|v|n)(?=[\u4e00-\u9fa5])/g, '$1.')
        .replace(/(vi|vt|adj|adv|prep|conj|pron|num|art|int|ad|a|v|n)(?=[\u4e00-\u9fa5])/g, '$1.');
}

function extractLeadingEnglishNotes(text) {
    let rest = text;
    const notes = [];

    while (true) {
        const match = rest.match(/^\(([A-Za-z,\s/-]+)\)(.+)$/);
        if (!match) {
            break;
        }
        notes.push(match[1].trim());
        rest = match[2].trim();
    }

    return { notes, rest };
}

function splitByPosMarkers(text) {
    const matches = [...text.matchAll(POS_REGEX)];
    if (matches.length === 0) {
        return [{ pos: null, text }];
    }

    const segments = [];
    const firstMatch = matches[0];
    if (firstMatch.index > 0) {
        segments.push({ pos: null, text: text.slice(0, firstMatch.index) });
    }

    matches.forEach((match, index) => {
        const nextMatch = matches[index + 1];
        const pos = normalizePos(match[1]);
        const start = match.index + match[0].length;
        const end = nextMatch ? nextMatch.index : text.length;
        const segmentText = text.slice(start, end);
        segments.push({ pos, text: segmentText });
    });

    if (segments.length > 1) {
        stats.splitByPosCount += 1;
    }

    return segments;
}

function expandOptionalChineseParentheses(text) {
    const match = text.match(OPTIONAL_CHINESE_PAREN_REGEX);
    if (!match) {
        return [text];
    }

    const [fullMatch, , optionalText] = match;
    const withoutOptional = text.replace(fullMatch, '');
    const withOptional = text.replace(fullMatch, optionalText);

    stats.optionalExpansionCount += 1;

    return [
        ...expandOptionalChineseParentheses(withoutOptional),
        ...expandOptionalChineseParentheses(withOptional)
    ];
}

function finalizeMeaning(word, rawText, pos, translationsByPos, collocations) {
    let value = normalizeMalformedPosMarkers(removeKnownMarkers(rawText));
    if (!value) {
        stats.emptyMeaningRemovedCount += 1;
        return [];
    }

    const extracted = extractLeadingEnglishNotes(value);
    if (extracted.notes.length > 0) {
        extracted.notes.forEach(note => {
            const noteType = classifyLeadingEnglishNote(note);
            if (noteType === 'collocation') {
                stats.collocationHintCount += 1;
                stats.collocationSavedCount += 1;
                collocations.push(note.toLowerCase());
                addCollocationLog(word, note, extracted.rest);
            } else if (noteType === 'variant') {
                stats.spellingVariantCount += 1;
            } else if (noteType === 'properNoun') {
                stats.properNounNoteCount += 1;
            }
        });
        value = extracted.rest;
    }

    const expandedVariants = expandOptionalChineseParentheses(value)
        .map(item => item.replace(/\([^()]*\)/g, '').replace(/（[^（）]*）/g, '').trim())
        .filter(Boolean);
    const variants = [...new Set(expandedVariants)];
    if (variants.length === 0) {
        stats.emptyMeaningRemovedCount += 1;
        return [];
    }

    if (pos) {
        translationsByPos[pos] = translationsByPos[pos] || [];
        variants.forEach(item => translationsByPos[pos].push(item));
    }

    return variants;
}

function dedupeMeanings(items) {
    const seen = new Map();
    const results = [];

    items.forEach(item => {
        const normalized = item.endsWith('的') ? item.slice(0, -1) : item;
        if (seen.has(item) || seen.has(normalized) || seen.has(`${normalized}的`)) {
            stats.dedupedMeaningCount += 1;
            return;
        }
        seen.set(item, true);
        results.push(item);
    });

    return results;
}

function cleanEntry(word, rawEntry) {
    const entry = Array.isArray(rawEntry)
        ? { translations: rawEntry, synonyms: [] }
        : {
            translations: Array.isArray(rawEntry?.translations) ? rawEntry.translations : [],
            synonyms: Array.isArray(rawEntry?.synonyms) ? rawEntry.synonyms : []
        };

    stats.originalMeaningCount += entry.translations.length + entry.synonyms.length;

    const translationsByPos = {};
    const collocations = [];
    const cleanedTranslations = [];
    const cleanedSynonyms = [];

    mergeBrokenLeadingNotes(entry.translations).forEach(rawText => {
        const prepared = normalizeMalformedPosMarkers(removeKnownMarkers(rawText));
        splitByPosMarkers(prepared).forEach(segment => {
            finalizeMeaning(word, segment.text, segment.pos, translationsByPos, collocations).forEach(item => cleanedTranslations.push(item));
        });
    });

    entry.synonyms.forEach(rawText => {
        finalizeMeaning(word, rawText, null, {}, []).forEach(item => cleanedSynonyms.push(item));
    });

    const dedupedTranslations = dedupeMeanings(cleanedTranslations);
    const dedupedSynonyms = dedupeMeanings(cleanedSynonyms.filter(item => !dedupedTranslations.includes(item)));

    stats.cleanedMeaningCount += dedupedTranslations.length + dedupedSynonyms.length;

    const result = {
        translations: dedupedTranslations,
        synonyms: dedupedSynonyms
    };

    if (Object.keys(translationsByPos).length > 0) {
        result.translationsByPos = Object.fromEntries(
            Object.entries(translationsByPos)
                .map(([pos, values]) => [pos, dedupeMeanings(values)])
                .filter(([, values]) => values.length > 0)
        );
    }

    const dedupedCollocations = [...new Set(collocations.filter(Boolean))];
    if (dedupedCollocations.length > 0) {
        result.collocations = dedupedCollocations;
    }

    if (result.translations.length === 0 && result.synonyms.length === 0) {
        addException(word, '清洗后词条无有效释义', JSON.stringify(rawEntry));
    }

    return result;
}

function main() {
    const rawDict = readJson(RAW_PATH);
    const cleanedWithPos = {};

    Object.entries(rawDict).forEach(([word, entry]) => {
        cleanedWithPos[word] = cleanEntry(word, entry);
    });

    stats.wordCount = Object.keys(cleanedWithPos).length;

    const withPosJson = JSON.stringify(cleanedWithPos, null, 2);
    const withPosBytes = Buffer.byteLength(withPosJson, 'utf8');
    const includeTranslationsByPos = withPosBytes <= MAX_OUTPUT_BYTES;

    const finalDict = includeTranslationsByPos
        ? cleanedWithPos
        : Object.fromEntries(
            Object.entries(cleanedWithPos).map(([word, entry]) => [
                word,
                {
                    translations: entry.translations,
                    synonyms: entry.synonyms
                }
            ])
        );

    const finalJson = JSON.stringify(finalDict, null, 2);
    const finalBytes = Buffer.byteLength(finalJson, 'utf8');

    writeText(OUTPUT_PATH, `${finalJson}\n`);

    const reportLines = [
        'kaoyan_dict 清洗报告',
        '====================',
        `单词总数: ${stats.wordCount}`,
        `原始义项总数: ${stats.originalMeaningCount}`,
        `清洗后义项总数: ${stats.cleanedMeaningCount}`,
        `词性切分命中数: ${stats.splitByPosCount}`,
        `方括号/标签清洗数: ${stats.bracketCleanupCount}`,
        `特殊符号清洗数: ${stats.symbolCleanupCount}`,
        `介词搭配提示记录数: ${stats.collocationHintCount}`,
        `结构化保存的搭配提示数: ${stats.collocationSavedCount}`,
        `英美拼写/缩写说明清理数: ${stats.spellingVariantCount}`,
        `专有名词说明清理数: ${stats.properNounNoteCount}`,
        `中文可选括号展开数: ${stats.optionalExpansionCount}`,
        `空义项移除数: ${stats.emptyMeaningRemovedCount}`,
        `去重移除数: ${stats.dedupedMeaningCount}`,
        `输出包含 translationsByPos: ${includeTranslationsByPos ? '是' : '否'}`,
        `带词性输出大小: ${withPosBytes} bytes`,
        `最终输出大小: ${finalBytes} bytes`,
        `性能红线: ${MAX_OUTPUT_BYTES} bytes`
    ];
    writeText(REPORT_PATH, `${reportLines.join('\n')}\n`);

    const collocationLines = [
        'kaoyan_dict 搭配提示保留清单',
        '=============================',
        `总条数: ${collocationLogs.length}`,
        ''
    ];
    collocationLogs.forEach((item, index) => {
        collocationLines.push(`${index + 1}. [${item.word}] (${item.note}) -> ${item.simplified}`);
    });
    writeText(COLLOCATION_REPORT_PATH, `${collocationLines.join('\n')}\n`);

    const exceptionLines = [
        'kaoyan_dict 异常与人工复核清单',
        '==============================',
        `总条数: ${exceptions.length}`,
        ''
    ];
    exceptions.forEach((item, index) => {
        exceptionLines.push(`${index + 1}. [${item.word}] ${item.reason}`);
        exceptionLines.push(`   ${item.detail}`);
    });
    writeText(EXCEPTION_PATH, `${exceptionLines.join('\n')}\n`);

    console.log(reportLines.join('\n'));
    console.log(`异常报告条数: ${exceptions.length}`);
}

main();
