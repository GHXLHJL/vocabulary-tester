const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(projectRoot, 'app.js');

function normalizeWord(word) {
    return String(word || '').trim().toLowerCase();
}

function normalizeAnswer(answer) {
    return String(answer || '')
        .split('/')
        .map(item => item.trim())
        .filter(Boolean)
        .sort()
        .join('/');
}

function getWordListSignature(words) {
    return words
        .map(item => normalizeWord(item.word))
        .filter(Boolean)
        .sort()
        .join('||');
}

function isGroupSeparatorLine(line) {
    const trimmedLine = String(line || '').trim();
    return /^[-—=]{2,}$/u.test(trimmedLine);
}

function getGroupWordSignature(group) {
    return (group?.words || [])
        .map(word => `${normalizeWord(word.word)}::${normalizeAnswer(word.expectedAnswer)}`)
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

        if (trimmedLine === '' || isGroupSeparatorLine(trimmedLine)) {
            if (currentWords.length > 0) {
                groups.push(currentWords);
                currentWords = [];
            }
            return;
        }

        if (trimmedLine === '相似单词集') {
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

function cloneGroupStateFromExisting(sourceGroup, existingGroup) {
    const existingWordsByKey = new Map(
        (existingGroup?.words || []).map(word => [
            normalizeWord(word.word),
            word
        ])
    );

    return {
        ...existingGroup,
        groupId: sourceGroup.groupId,
        words: sourceGroup.words.map(sourceWord => {
            const existingWord = existingWordsByKey.get(normalizeWord(sourceWord.word));
            return existingWord ? {
                ...sourceWord,
                id: existingWord.id || sourceWord.id,
                userAnswer: existingWord.userAnswer || '',
                isCorrect: typeof existingWord.isCorrect === 'boolean' ? existingWord.isCorrect : null,
                errorCount: existingWord.errorCount || 0
            } : sourceWord;
        })
    };
}

function resetGroupFromSource(sourceGroup) {
    return {
        ...sourceGroup,
        pool: 'main',
        tier: 'new',
        correctRatesHistory: [],
        consecutiveQualified: 0,
        lastTestDate: null,
        enteredAPoolDate: null
    };
}

function syncWithCodeSourceLikeApp(existingWordGroups, sourceGroups) {
    const remainingTargets = [...existingWordGroups];
    const syncedGroups = [];

    function takeRemainingGroupBySignature(signature) {
        if (!signature) return null;
        const matchIndex = remainingTargets.findIndex(group => getGroupWordSignature(group) === signature);
        if (matchIndex === -1) return null;
        return remainingTargets.splice(matchIndex, 1)[0];
    }

    function takeRemainingGroupByWordListSignature(signature) {
        if (!signature) return null;
        const matchIndex = remainingTargets.findIndex(group => getWordListSignature(group.words) === signature);
        if (matchIndex === -1) return null;
        return remainingTargets.splice(matchIndex, 1)[0];
    }

    sourceGroups.forEach(srcG => {
        const sourceSignature = getGroupWordSignature(srcG);
        const sourceWordListSignature = getWordListSignature(srcG.words);

        const sameIdIndex = remainingTargets.findIndex(group => group.groupId === srcG.groupId);
        const sameIdGroup = sameIdIndex === -1 ? null : remainingTargets[sameIdIndex];
        const sameIdSignature = sameIdGroup ? getGroupWordSignature(sameIdGroup) : '';

        if (sameIdGroup && sameIdSignature === sourceSignature) {
            remainingTargets.splice(sameIdIndex, 1);
            syncedGroups.push(cloneGroupStateFromExisting(srcG, sameIdGroup));
            return;
        }

        const sameContentGroup = takeRemainingGroupBySignature(sourceSignature);
        if (sameContentGroup) {
            syncedGroups.push(cloneGroupStateFromExisting(srcG, sameContentGroup));
            return;
        }

        const sameWordListGroup = takeRemainingGroupByWordListSignature(sourceWordListSignature);
        if (sameWordListGroup) {
            syncedGroups.push(resetGroupFromSource(srcG));
            return;
        }

        if (sameIdGroup) {
            remainingTargets.splice(sameIdIndex, 1);
            syncedGroups.push(resetGroupFromSource(srcG));
            return;
        }

        syncedGroups.push(resetGroupFromSource(srcG));
    });

    return syncedGroups;
}

function buildMockProgressState(groups) {
    return groups.map(group => ({
        groupId: group.groupId,
        pool: 'a',
        tier: 'fuzzy',
        correctRatesHistory: [1, 1, 1],
        consecutiveQualified: 3,
        lastTestDate: `2026-08-${String((group.groupId % 28) + 1).padStart(2, '0')}T08:00:00.000Z`,
        enteredAPoolDate: `2026-07-${String((group.groupId % 28) + 1).padStart(2, '0')}T08:00:00.000Z`,
        words: group.words.map((word, index) => ({
            id: `gid-${group.groupId}-word-${index + 1}`,
            word: word.word,
            expectedAnswer: word.expectedAnswer,
            userAnswer: `answer-${group.groupId}-${index + 1}`,
            isCorrect: index % 2 === 0,
            errorCount: group.groupId % 3
        }))
    }));
}

function assert(condition, message, details) {
    if (!condition) {
        const error = new Error(message);
        error.details = details;
        throw error;
    }
}

function main() {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const txtContent = fs.readFileSync(path.join(projectRoot, '.trae', 'specs', 'vocabulary-tester', '相似单词集.txt'), 'utf8');
    const existingGroups = parseExistingGroups(appJsContent);
    const parsedTxtGroups = parseTxtGroups(txtContent);
    assert(existingGroups.length >= 8, '当前词组数量过少，无法执行回归场景');
    assert(parsedTxtGroups.length >= 8, '当前 txt 分组数量异常', { groupCount: parsedTxtGroups.length });

    const parsedGroup55Words = parsedTxtGroups[54]?.map(item => item.word) || [];
    assert(
        JSON.stringify(parsedGroup55Words) === JSON.stringify(['climb', 'climate', 'climax']),
        'txt 第55组解析结果异常',
        { group55Words: parsedGroup55Words }
    );

    const mergeAndMeaningScenario = existingGroups.map(group => ({
        groupId: group.groupId,
        words: group.words.map(word => ({ ...word }))
    }));

    const mergeTargetA = mergeAndMeaningScenario[1];
    const mergeTargetB = mergeAndMeaningScenario[2];
    const changedMeaningA = mergeAndMeaningScenario[4];
    const changedMeaningB = mergeAndMeaningScenario[6];

    mergeTargetA.words = [...mergeTargetA.words, ...mergeTargetB.words];
    mergeAndMeaningScenario.splice(2, 1);
    changedMeaningA.words[0].expectedAnswer = `${changedMeaningA.words[0].expectedAnswer}/测试改义A`;
    changedMeaningB.words[0].expectedAnswer = `${changedMeaningB.words[0].expectedAnswer}/测试改义B`;

    const mergeMeaningResolvedGroups = assignStableGroupIds(
        mergeAndMeaningScenario.map(group => group.words.map(word => ({ ...word }))),
        existingGroups
    );
    const mockWordGroups = buildMockProgressState(existingGroups);
    const mergeMeaningSyncedGroups = syncWithCodeSourceLikeApp(mockWordGroups, mergeMeaningResolvedGroups);

    const mergedGroupId = mergeTargetA.groupId;
    const removedGroupId = mergeTargetB.groupId;
    const changedMeaningGroupIds = [changedMeaningA.groupId, changedMeaningB.groupId];
    const changedGroupIds = new Set([mergedGroupId, ...changedMeaningGroupIds]);
    const syncedById = new Map(mergeMeaningSyncedGroups.map(group => [group.groupId, group]));
    const oldById = new Map(mockWordGroups.map(group => [group.groupId, group]));

    assert(!syncedById.has(removedGroupId), '被合并掉的旧组不应继续存在', { removedGroupId });

    const mergedGroup = syncedById.get(mergedGroupId);
    assert(mergedGroup, '合并后的目标组不存在', { mergedGroupId });
    assert(mergedGroup.pool === 'main', '合并后的词组应被重置到总池', mergedGroup);
    assert(mergedGroup.tier === 'new', '合并后的词组 tier 应重置为 new', mergedGroup);
    assert(mergedGroup.correctRatesHistory.length === 0, '合并后的词组历史应被清空', mergedGroup);

    changedMeaningGroupIds.forEach(groupId => {
        const group = syncedById.get(groupId);
        assert(group, '改义后的词组不存在', { groupId });
        assert(group.pool === 'main', '改义后的词组应被重置到总池', group);
        assert(group.tier === 'new', '改义后的词组 tier 应重置为 new', group);
        assert(group.correctRatesHistory.length === 0, '改义后的词组历史应被清空', group);
    });

    const unaffectedMergeMeaningGroups = mergeMeaningSyncedGroups.filter(group => !changedGroupIds.has(group.groupId));
    unaffectedMergeMeaningGroups.forEach(group => {
        const oldGroup = oldById.get(group.groupId);
        assert(!!oldGroup, '未改动词组必须能在旧数据中找到', { groupId: group.groupId });
        assert(group.pool === oldGroup.pool, '未改动词组的池状态不应变化', { groupId: group.groupId, oldPool: oldGroup.pool, newPool: group.pool });
        assert(group.tier === oldGroup.tier, '未改动词组的 tier 不应变化', { groupId: group.groupId, oldTier: oldGroup.tier, newTier: group.tier });
        assert(group.enteredAPoolDate === oldGroup.enteredAPoolDate, '未改动词组的 A 池进入时间不应变化', { groupId: group.groupId });
        assert(JSON.stringify(group.correctRatesHistory) === JSON.stringify(oldGroup.correctRatesHistory), '未改动词组的历史记录不应变化', { groupId: group.groupId });
    });

    const addWordScenario = existingGroups.map(group => ({
        groupId: group.groupId,
        words: group.words.map(word => ({ ...word }))
    }));
    const addWordTargetGroup = addWordScenario[3];
    addWordTargetGroup.words.push({
        word: `newword_group_${addWordTargetGroup.groupId}`,
        expectedAnswer: '测试新增单词'
    });
    const addWordResolvedGroups = assignStableGroupIds(
        addWordScenario.map(group => group.words.map(word => ({ ...word }))),
        existingGroups
    );
    const addWordSyncedGroups = syncWithCodeSourceLikeApp(mockWordGroups, addWordResolvedGroups);
    const addWordGroupId = addWordTargetGroup.groupId;
    const addWordById = new Map(addWordSyncedGroups.map(group => [group.groupId, group]));
    const addedWordGroup = addWordById.get(addWordGroupId);
    assert(addedWordGroup, '新增单词后的目标组不存在', { addWordGroupId });
    assert(addedWordGroup.pool === 'main', '新增单词后的目标组应被重置到总池', addedWordGroup);
    assert(addedWordGroup.tier === 'new', '新增单词后的目标组 tier 应重置为 new', addedWordGroup);
    assert(addedWordGroup.correctRatesHistory.length === 0, '新增单词后的目标组历史应被清空', addedWordGroup);
    addWordSyncedGroups
        .filter(group => group.groupId !== addWordGroupId)
        .forEach(group => {
            const oldGroup = oldById.get(group.groupId);
            assert(!!oldGroup, '新增单词场景下未改动词组必须能在旧数据中找到', { groupId: group.groupId });
            assert(group.pool === oldGroup.pool, '新增单词不应影响其他词组的池状态', { groupId: group.groupId, oldPool: oldGroup.pool, newPool: group.pool });
            assert(group.enteredAPoolDate === oldGroup.enteredAPoolDate, '新增单词不应影响其他词组的 A 池进入时间', { groupId: group.groupId });
            assert(JSON.stringify(group.correctRatesHistory) === JSON.stringify(oldGroup.correctRatesHistory), '新增单词不应影响其他词组的历史记录', { groupId: group.groupId });
        });

    const addGroupScenario = existingGroups.map(group => ({
        groupId: group.groupId,
        words: group.words.map(word => ({ ...word }))
    }));
    addGroupScenario.push({
        groupId: null,
        words: [
            { word: 'alphaextra', expectedAnswer: '测试新增词组1' },
            { word: 'betaextra', expectedAnswer: '测试新增词组2' }
        ]
    });
    const addGroupResolvedGroups = assignStableGroupIds(
        addGroupScenario.map(group => group.words.map(word => ({ ...word }))),
        existingGroups
    );
    const addGroupSyncedGroups = syncWithCodeSourceLikeApp(mockWordGroups, addGroupResolvedGroups);
    const addGroupNewEntry = addGroupResolvedGroups.find(group => group.words.some(word => word.word === 'alphaextra'));
    assert(!!addGroupNewEntry, '新增词组未生成新的 groupId');
    const addGroupById = new Map(addGroupSyncedGroups.map(group => [group.groupId, group]));
    const newGroup = addGroupById.get(addGroupNewEntry.groupId);
    assert(!!newGroup, '新增词组未出现在同步结果中', { groupId: addGroupNewEntry.groupId });
    assert(newGroup.pool === 'main', '新增词组应初始化在总池', newGroup);
    assert(newGroup.tier === 'new', '新增词组 tier 应初始化为 new', newGroup);
    assert(newGroup.correctRatesHistory.length === 0, '新增词组历史应为空', newGroup);
    addGroupSyncedGroups
        .filter(group => group.groupId !== addGroupNewEntry.groupId)
        .forEach(group => {
            const oldGroup = oldById.get(group.groupId);
            assert(!!oldGroup, '新增词组场景下旧词组必须仍可找到', { groupId: group.groupId });
            assert(group.pool === oldGroup.pool, '新增词组不应影响旧词组池状态', { groupId: group.groupId, oldPool: oldGroup.pool, newPool: group.pool });
            assert(group.enteredAPoolDate === oldGroup.enteredAPoolDate, '新增词组不应影响旧词组 A 池进入时间', { groupId: group.groupId });
            assert(JSON.stringify(group.correctRatesHistory) === JSON.stringify(oldGroup.correctRatesHistory), '新增词组不应影响旧词组历史记录', { groupId: group.groupId });
        });

    console.log(JSON.stringify({
        txtParsingScenario: {
            parsedGroupCount: parsedTxtGroups.length,
            group55Words: parsedGroup55Words
        },
        mergeAndMeaningScenario: {
            totalGroupsBefore: existingGroups.length,
            totalGroupsAfter: mergeMeaningSyncedGroups.length,
            changedGroupIds: [...changedGroupIds].sort((a, b) => a - b),
            removedGroupId,
            unaffectedGroupCount: unaffectedMergeMeaningGroups.length,
            preservedSample: unaffectedMergeMeaningGroups.slice(0, 5).map(group => ({
                groupId: group.groupId,
                pool: group.pool,
                tier: group.tier,
                enteredAPoolDate: group.enteredAPoolDate
            }))
        },
        addWordScenario: {
            changedGroupId: addWordGroupId,
            unaffectedGroupCount: addWordSyncedGroups.length - 1
        },
        addGroupScenario: {
            newGroupId: addGroupNewEntry.groupId,
            totalGroupsAfter: addGroupSyncedGroups.length,
            unaffectedOldGroupCount: addGroupSyncedGroups.length - 1
        }
    }, null, 2));
}

try {
    main();
} catch (error) {
    console.error(error.message);
    if (error.details) {
        console.error(JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
}
