const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP_JS_PATH = path.join(__dirname, '..', 'app.js');
const COMPATIBILITY_CHAR_MAP = {
    '⺠': '民', '⻓': '长', '⻋': '车', '⻅': '见', '⻉': '贝', '⻔': '门',
    '⻆': '角', '⻛': '风', '⻝': '食', '⻢': '马', '⻜': '飞', '⻩': '黄',
    '⻥': '鱼', '⻦': '鸟', '⻬': '齐', '⻤': '鬼', '⻚': '页', '⻣': '骨',
    '⻘': '青', '⻰': '龙', '⻮': '齿', '⺓': '纟', '⻨': '麦'
};

function extractGlobalSynDict() {
    const source = fs.readFileSync(APP_JS_PATH, 'utf8');
    const match = source.match(/const GLOBAL_SYN_DICT = (\[[\s\S]*?\n\s*\]);/);

    if (!match) {
        throw new Error('未找到 GLOBAL_SYN_DICT 定义');
    }

    return vm.runInNewContext(`${match[0]}\nGLOBAL_SYN_DICT;`);
}

function normalizeAnswerString(str) {
    if (!str) return '';
    return [...str.normalize('NFKC')]
        .map(char => COMPATIBILITY_CHAR_MAP[char] || char)
        .join('')
        .replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, '');
}

function createSynonymMap(groups) {
    return groups.reduce((accumulator, group) => {
        group.forEach(item => {
            accumulator[item] = group;
        });
        return accumulator;
    }, {});
}

function findDuplicateTerms(groups) {
    const indexMap = new Map();
    const duplicates = [];

    groups.forEach((group, groupIndex) => {
        group.forEach(item => {
            if (indexMap.has(item)) {
                duplicates.push({
                    term: item,
                    previousGroupIndex: indexMap.get(item) + 1,
                    currentGroupIndex: groupIndex + 1
                });
                return;
            }

            indexMap.set(item, groupIndex);
        });
    });

    return duplicates;
}

function inspectGroupShape(groups) {
    const issues = [];

    groups.forEach((group, groupIndex) => {
        if (!Array.isArray(group) || group.length < 2) {
            issues.push(`第${groupIndex + 1}组成员数量不足 2 个`);
            return;
        }

        if (group.length > 5) {
            issues.push(`第${groupIndex + 1}组成员数量超过 5 个`);
        }

        const rawTerms = new Set();
        const normalizedTerms = new Set();

        group.forEach(item => {
            const normalized = normalizeAnswerString(item);

            if (!normalized) {
                issues.push(`第${groupIndex + 1}组存在空白或无效词项`);
                return;
            }

            if (rawTerms.has(item)) {
                issues.push(`第${groupIndex + 1}组存在重复原词项：${item}`);
            } else {
                rawTerms.add(item);
            }

            if (normalizedTerms.has(normalized)) {
                issues.push(`第${groupIndex + 1}组存在归一化后重复词项：${item}`);
            } else {
                normalizedTerms.add(normalized);
            }
        });
    });

    return issues;
}

function expandNearSynonymVariants(str, synonymMap, options = {}) {
    const { useGlobalSynonyms = true } = options;
    const normalized = normalizeAnswerString(str);
    if (!normalized) return [];

    const queue = [normalized];
    const variants = new Set();

    while (queue.length > 0) {
        const current = queue.pop();
        if (!current || variants.has(current)) {
            continue;
        }

        variants.add(current);

        const withoutLeadingMarker = current.replace(/^(将|把|使|令)/, '');
        if (withoutLeadingMarker && withoutLeadingMarker !== current) {
            queue.push(withoutLeadingMarker);
        }

        if (current.endsWith('的')) {
            queue.push(current.slice(0, -1));
        }

        const synonymGroup = synonymMap[current];
        if (useGlobalSynonyms && synonymGroup) {
            synonymGroup.forEach(item => queue.push(item));
        }
    }

    return [...variants];
}

function expandOptionalAnswerVariants(str) {
    const optionalPattern = /([（(])([^（）()]+)([）)])/;
    const match = str.match(optionalPattern);

    if (!match) {
        return [normalizeAnswerString(str)];
    }

    const [fullMatch, , optionalText] = match;
    const withoutOptional = str.replace(fullMatch, '');
    const withOptional = str.replace(fullMatch, optionalText);

    return [
        ...expandOptionalAnswerVariants(withoutOptional),
        ...expandOptionalAnswerVariants(withOptional)
    ];
}

function expandMeaningVariants(str, synonymMap, options = {}) {
    return expandOptionalAnswerVariants(str)
        .flatMap(answer => expandNearSynonymVariants(answer, synonymMap, options))
        .filter(Boolean);
}

function expandGlobalCandidateAnswers(candidateAnswers, synonymMap) {
    return [...new Set(
        candidateAnswers.flatMap(answer =>
            expandNearSynonymVariants(answer, synonymMap, { useGlobalSynonyms: true })
        )
    )];
}

function isMeaningMatch(userAnswer, candidateAnswers, synonymMap, options = {}) {
    const { useGlobalSynonyms = false } = options;
    const userVariants = new Set(expandMeaningVariants(userAnswer, synonymMap, { useGlobalSynonyms }));
    const targetAnswers = useGlobalSynonyms
        ? expandGlobalCandidateAnswers(candidateAnswers, synonymMap)
        : candidateAnswers;
    return targetAnswers.some(answer => userVariants.has(answer));
}

function main() {
    const groups = extractGlobalSynDict();
    const duplicateTerms = findDuplicateTerms(groups);
    const groupShapeIssues = inspectGroupShape(groups);
    const synonymMap = createSynonymMap(groups);
    const shouldPass = [
        ['办法', ['方法']],
        ['显示', ['表明']],
        ['造成', ['导致']],
        ['涵盖', ['包括']],
        ['维持', ['保持']],
        ['提升', ['提高']],
        ['协助', ['帮助']],
        ['得到', ['获得']],
        ['挑选', ['选择']],
        ['类似', ['相似']],
        ['显著', ['明显']],
        ['适当', ['合适']],
        ['证实', ['证明']],
        ['着重', ['强调']],
        ['遵循', ['遵守']],
        ['参与', ['参加']],
        ['目的', ['目标']],
        ['长处', ['优点']],
        ['机遇', ['机会']],
        ['依赖', ['依靠']],
        ['发觉', ['发现']],
        ['运用', ['使用']],
        ['给予', ['提供']],
        ['改进', ['改善']],
        ['缩减', ['减少']],
        ['体现', ['反映']],
        ['明白', ['理解']],
        ['实质', ['本质']],
        ['差别', ['区别']],
        ['失误', ['错误']],
        ['设立', ['建立']],
        ['准许', ['允许']],
        ['许可', ['允许']],
        ['回绝', ['拒绝']],
        ['忧虑', ['担心']],
        ['展现', ['展示']],
        ['扩展', ['扩大']],
        ['减小', ['缩小']],
        ['终止', ['结束']],
        ['持续', ['继续']],
        ['适宜', ['适合']],
        ['必需', ['必要']],
        ['答复', ['回答']],
        ['立刻', ['立即']],
        ['常常', ['经常']],
        ['相同', ['一致']],
        ['所有', ['全部']],
        ['预备', ['准备']],
        ['转变', ['改变']],
        ['组成', ['构成']],
        ['修建', ['建造']],
        ['毁坏', ['破坏']],
        ['搜集', ['收集']],
        ['取得', ['获得']]
    ];
    const shouldFail = [
        ['等级', ['水平']],
        ['巧妙', ['聪明']],
        ['利用', ['使用']],
        ['成果', ['结果']],
        ['职业', ['工作']],
        ['完全', ['明显']],
        ['维护', ['保护']],
        ['需求', ['需要']],
        ['价值', ['意义']],
        ['支持', ['帮助']],
        ['拓宽', ['扩大']],
        ['保存', ['保留']],
        ['实现', ['完成']],
        ['完全', ['全部']],
        ['合并', ['结合']],
        ['确保', ['保证']],
        ['修补', ['修建']],
        ['采集', ['收集']],
        ['编造', ['构成']]
    ];

    const passFailures = shouldPass.filter(([user, answers]) =>
        !isMeaningMatch(user, answers, synonymMap, { useGlobalSynonyms: true })
    );
    const failFailures = shouldFail.filter(([user, answers]) =>
        isMeaningMatch(user, answers, synonymMap, { useGlobalSynonyms: true })
    );

    console.log(`当前同义词组数量: ${groups.length}`);
    console.log(`应命中样例: ${shouldPass.length}`);
    console.log(`应拦截样例: ${shouldFail.length}`);
    console.log(`重复词冲突数: ${duplicateTerms.length}`);
    console.log(`结构问题数: ${groupShapeIssues.length}`);

    if (groupShapeIssues.length === 0 && duplicateTerms.length === 0 && passFailures.length === 0 && failFailures.length === 0) {
        console.log('验证通过：未发现误放宽或意外漏判。');
        return;
    }

    if (groupShapeIssues.length > 0) {
        console.log('结构问题:');
        groupShapeIssues.forEach(issue => {
            console.log(`- ${issue}`);
        });
    }

    if (duplicateTerms.length > 0) {
        console.log('重复词冲突:');
        duplicateTerms.forEach(({ term, previousGroupIndex, currentGroupIndex }) => {
            console.log(`- ${term}: 第${previousGroupIndex}组 / 第${currentGroupIndex}组`);
        });
    }

    if (passFailures.length > 0) {
        console.log('未命中样例:');
        passFailures.forEach(([user, answers]) => {
            console.log(`- ${user} <- ${answers.join('/')}`);
        });
    }

    if (failFailures.length > 0) {
        console.log('误命中样例:');
        failFailures.forEach(([user, answers]) => {
            console.log(`- ${user} <- ${answers.join('/')}`);
        });
    }

    process.exitCode = 1;
}

main();
