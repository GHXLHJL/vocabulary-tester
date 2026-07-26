# Phase 3 发现记录

## 当前项目状态
- `kaoyan_dict.json` 已经过 Phase 1 清洗，且产物结构支持 `translations` / `synonyms` / `translationsByPos` / `collocations`。
- `GLOBAL_SYN_DICT` 在 Phase 2 已扩充到 66 组，并具备自动验证脚本。
- 当前 git diff 主要集中在 `app.js`、`index.html`、`kaoyan_dict.json`。
- 当前清洗报告显示正式词库为 `5047` 词，清洗后义项总数为 `28530`，产物大小 `865838 bytes`，仍低于 `1572864 bytes` 性能红线。

## Phase 3 启动前确认
- 当前项目根目录中还没有 `task_plan.md`、`findings.md`、`progress.md` 旧文件，需要新建。
- 规划技能的 `SKILL.md` 可读，但其中提到的脚本和模板目录在当前环境下并不存在，需要手动执行同等流程。

## 策略约束
- Phase 3 的唯一编辑源仍应为 `kaoyan_dict_raw.json`。
- 补词动作必须走 `raw -> clean script -> kaoyan_dict.json` 这条链路。
- 先做缺口分析，再做小规模试点，不直接全量扩到 6000+。

## 新线索
- 仓库搜索到一个潜在线索：`scripts/node/replace_words_helper.js` 注释中提到 `.trae/specs/vocabulary-tester/相似单词集.txt`。
- 这份 `相似单词集.txt` 可能是项目内已有词表来源，需要继续确认文件是否存在、内容是否适合做 Phase 3 差集对比。
- `.trae/specs/vocabulary-tester/相似单词集.txt` 文件已确认存在。
- `scripts/node/replace_words_helper.js` 的用途是用这份 txt 直接替换 `app.js` 中的 `defaultWords`，说明它更偏练习题数据源，而不是现成的离线考研词库补词脚本。
- `scripts/python/count_words_in_txt.py` 可直接统计这份 txt 的英文词数量，适合下一步做基线比较。
- `相似单词集.txt` 共 `621` 个英文词，全部为唯一词。
- 将 `相似单词集.txt` 与 `kaoyan_dict_raw.json` 对比后，发现有 `120` 个词不在当前离线词库中。
- 缺失样例包括：`ascribe`、`shortcut`、`undercut`、`shorten`、`shortlist`、`elusive`、`patriot`、`deplete`、`perceptive`、`align`、`volatile`、`destruct` 等。
- 这说明 Phase 3 可以先基于项目内现成词表做一轮“小规模补词试点”，无需立刻引入外部来源。
- 首批适合试点的清晰词包括：`ascribe`、`shortcut`、`undercut`、`shorten`、`elusive`、`patriot`、`deplete`、`perceptive`、`align`、`volatile`。

## 首批试点结果
- 已补入 `ascribe`、`shortcut`、`undercut`、`shorten`、`elusive`、`patriot`、`deplete`、`perceptive`、`align`、`volatile` 共 10 个词到 `kaoyan_dict_raw.json`。
- 其中 `volatile` 的中文释义按常规词典语义规范为 `易挥发的 / 易变的`，避免沿用原 txt 中疑似笔误的 `易发挥的`。
- 重跑 `scripts/clean_kaoyan_dict.js` 后，正式词库总数升为 `5057`，异常报告仍为 `0`。
- 产物大小从 `865838 bytes` 微增到 `866787 bytes`，仍显著低于性能红线。
- 再次对比 `相似单词集.txt` 后，剩余缺失词降为 `110`。

## 6000+ 主来源
- 用户已明确要求推进“补充到 6000+”而不是只做试点。
- 已确认主来源为 `KyleBing/english-vocabulary` 的考研词表。
- 该仓库 README 说明“考研”词库数量为 `9602`，且 txt 格式为 `单词\t释义`，适合直接做差集和自动合并。
- 按当前正式词库体积估算，不宜直接全量吃进 9602 词，否则可能逼近或超过现有性能红线；更合适的路径是从该源中补到 `6000+` 后再校验体积与质量。
- 实测下载后的 `5 考研-乱序.txt` 确实有 `9602` 行，但只有 `5047` 个唯一词头。
- 这与当前 `kaoyan_dict_raw.json` 的词头规模完全一致，说明两者几乎同源，不能作为真正的 6000+ 扩库来源。
- 新候选来源：`Zorrow2017/engword` 的 `engword5500.txt`，其原始内容包含词头、中文释义、英文解释和短语字段，值得继续做差集验证。

## 墨墨单词表导入结果
- 用户已明确确认 [墨墨单词本6755_单词表.md](file:///e:/project/trae/study/%E5%A2%A8%E5%A2%A8%E5%8D%95%E8%AF%8D%E6%9C%AC6755_%E5%8D%95%E8%AF%8D%E8%A1%A8.md) 为准确来源，Phase 3 改为基于这份词表继续扩库。
- 通过解析这份 Markdown 词表，当前可稳定识别 `6748` 个唯一英文词头。
- 与 `kaoyan_dict_raw.json` 对比后，发现仍有 `1821` 个词不在当前 raw 词库中。
- 为控制体积和风险，本轮没有一次性灌满 6755，而是按既有策略先补到 `6007`。
- 已新增脚本 [import_momo_wordlist.js](file:///e:/project/trae/study/scripts/node/import_momo_wordlist.js)，可直接从 Markdown 词表导入缺失词并输出导入报告。
- 本轮已按墨墨词表顺序导入首批 `950` 个缺失词，样例包括：`you`、`the`、`a`、`it`、`and`、`that`、`have`、`want`、`good`、`think`。
- 导入后 raw 词库词头数已从 `5057` 升到 `6007`。
- 重跑 `scripts/clean_kaoyan_dict.js` 后，正式词库也已稳定达到 `6007` 词。
- 最新清洗结果：
  - 清洗后义项总数：`29934`
  - 最终输出大小：`1079614 bytes`
  - 性能红线：`1572864 bytes`
  - 异常报告条数：`0`
- 这说明目前已经达成“6000+ 扩库”这一阶段目标，且体积和清洗稳定性仍在可接受范围内。
- 用户随后要求“一次性都完成”，因此已继续补入墨墨词表剩余 `871` 个缺失词。
- 已为导入脚本增加 `--all-missing` 模式，可一次补齐来源词表中尚未覆盖的全部词头。
- 全量补入后，raw 与清洗后的正式词库都达到 `6878` 词。
- 由于现有 raw 中有一部分历史词头并不在墨墨词表里，所以最终正式词库数量高于 `6748`；这是“保留旧词 + 吃满墨墨来源”的叠加结果，不是重复导入。
- 全量扩库后的最终清洗结果：
  - 清洗后义项总数：`30950`
  - 最终输出大小：`1265767 bytes`
  - 性能红线：`1572864 bytes`
  - 异常报告条数：`0`
- 同步复跑 [validate_global_synonyms.js](file:///e:/project/trae/study/scripts/validate_global_synonyms.js) 后，66 组全局同义词仍全部通过护栏校验，没有出现重复词冲突或结构问题。
