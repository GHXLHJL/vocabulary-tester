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

## 学习策略分析 (2026-07-26)

### “小容量、高频率”策略的科学性 (Strategy 3)
- **记忆强度补偿**：将单次题量减少 33%（30->20）虽然降低了瞬时压力，但通过提高测试频率（两天一测 -> 每天一测）使每周接触总量提升了约 **33%**。
- **权重修正逻辑**：在抽样池缩小时，薄弱词（weak）的被选概率会稀释。通过将权重从 3 提升至 **5**，可以确保薄弱词在 20 组的抽样中依然占据核心地位。
- **正向激励循环**：月度总测引入“分层回炉”机制。对于真正掌握的词（正确率 >= 80%）不再强制回炉，这符合艾宾浩斯遗忘曲线中“长时记忆”的特点，能有效减少无效劳动。
- **系统稳定性防护**：周测与月测的频率护栏是防止 LocalStorage 数据在非正常点击下产生统计偏差的关键。

## Phase 4 实施结果
- [app.js](file:///e:/project/trae/study/app.js) 已正式落地 Strategy 3 的核心参数：`dailyDrawCount = 20`、`weakTierWeight = 5`、`weeklyMinIntervalDays = 7`、`monthlyMinIntervalDays = 25`。
- 周复盘逻辑已由固定比例改为动态抽题：`A池 < 15` 时全量抽取，否则按 `20%` 抽取且不少于 `10` 组。
- 新增 `awakenExpiredAPoolGroups()`，使 `awakenDays = 30` 不再只停留在文档层，而会在测试开始前把超期 A 池词组唤醒回总池。
- 月度总测改为“只抽样、不预先打回”，真正的池子迁移发生在提交后，避免测试开始前就污染 A 池状态。
- [优化策略3.md](file:///e:/project/trae/study/%E4%BC%98%E5%8C%96%E7%AD%96%E7%95%A53.md) 中原先“正文建议已调整、优先级表却写先观察再调”的内部矛盾已同步修正。

## Phase 5 发现
- 现有排行榜上传逻辑 [uploadScoreToSupabase](file:///e:/project/trae/study/app.js) 本身已经携带 `test_mode`，因此“每日排行 / 每月排行”拆分无需改数据库结构，只需改前端查询口径。
- 原顶部“排行榜”与“墨墨API”按钮实际占据同一层级的产品入口，用户感知上更像两个榜单入口，因此改成“每日排行 / 每月排行”是自然的 UI 演进。
- 原顶部“墨墨API”按钮删除后，墨墨弱点同步功能仍保留在设置与本地权重计算链路中，不会影响已有数据结构和弱点加权能力。
- 这轮最稳妥的做法是“复用同一个排行榜弹窗 + 动态标题 + 按 `test_mode` 过滤”，既能最小改动，也能保持交互一致性。

## 目录清理结论
- `scripts/node/` 中大量 `debug_*.py`、`check_*.py`、`extract_momo_v*.py`、`verify_*.py` 属于阶段性探索脚本，未被主流程引用，适合清理。
- `debug_momo.log` 与 `page_279.png` 属于前述探索脚本生成的调试产物，可安全删除。
- [momo_words.json](file:///e:/project/trae/study/momo_words.json) 与 [suspicious_words.json](file:///e:/project/trae/study/suspicious_words.json) 当前无项目引用，且不在正式工作流中，适合删除。
- `collocation_report.txt` 仍由 [clean_kaoyan_dict.js](file:///e:/project/trae/study/scripts/clean_kaoyan_dict.js) 生成并引用，不应误删。

## 相似词练习链路修复发现
- 用户当前的 [相似单词集.txt](file:///e:/project/trae/study/.trae/specs/vocabulary-tester/%E7%9B%B8%E4%BC%BC%E5%8D%95%E8%AF%8D%E9%9B%86.txt) 已从“空行分组”切换为“`——` 分组”。
- 旧版 [replace_words_helper.js](file:///e:/project/trae/study/scripts/node/replace_words_helper.js) 只识别空行，不识别 `——`，会把整份 txt 误解析为 1 个大组；这是更新后分组错乱的根因。
- 当前故障样例 [app.js](file:///e:/project/trae/study/app.js#L505-L507) 已证实：修复前 `group 55` 只剩 `climax` 一个词，缺失 `climb`、`climate`。
- 修复后，`parseTxtGroups()` 已同时支持：
  - 空行分组
  - `——` 分组
  - 跳过标题行 `相似单词集`
- 修复后重跑更新脚本，当前 `txt` 与 `app.js` 的 `144` 个分组已完全一致，`mismatchCount = 0`。
- 链路级回归脚本 [test_update_chain_regression.js](file:///e:/project/trae/study/scripts/test_update_chain_regression.js) 已覆盖以下场景：
  - 合并两个词组
  - 修改两个不同词组中的释义
  - 给现有词组新增单词
  - 新增全新词组
- 回归结果表明：以上场景均只影响发生改动的词组，其余未改动词组的 `pool/tier/enteredAPoolDate/correctRatesHistory` 保持不变，不再整批冲击 A 池。

## AI 云端化与排行榜清理发现（2026-08-19）
- 当前 AI 第四层仍是前端直接请求 `https://api.deepseek.com/chat/completions`，配置入口在 [app.js](file:///e:/project/trae/study/app.js) 与本地私有文件 `local-ai-experiment.js`。
- 当前项目已存在 Supabase Edge Function 目录 [maimemo-proxy](file:///e:/project/trae/study/supabase/functions/maimemo-proxy/index.ts)，说明仓库已经具备“前端 -> Supabase 云函数 -> 外部 API”的接入模式。
- [app.js](file:///e:/project/trae/study/app.js#L3792-L3814) 已有调用 `functions/v1/maimemo-proxy` 的既有逻辑，可复用相同风格来接 AI 判题云函数。
- `leaderboard` 表当前包含 `id / user_id / nickname / total_words / correct_words / accuracy / test_date / test_mode`，适合按昵称批量清理历史测试数据。
- `ai_judge_cache_v1.sql` 已成功应用到远端 Supabase，云端缓存表 `public.ai_judge_cache` 已存在。
- 已新增 Supabase Edge Function [deepseek-ai-judge](file:///e:/project/trae/study/supabase/functions/deepseek-ai-judge/index.ts)，并将 DeepSeek key 改存为云端 secret `DEEPSEEK_API_KEY`。
- [app.js](file:///e:/project/trae/study/app.js) 已不再保存或读取 DeepSeek API key，前端只向 `functions/v1/deepseek-ai-judge` 发送判题业务字段。
- 云函数已进一步收紧：前端不再传完整 `messages`，提示词由云函数内部生成，减少被拿去当通用聊天代理的面。
- 浏览器复测时未再出现任何直连 `api.deepseek.com` 的请求；由于云端缓存已命中，这次复测也没有再触发 AI 云函数，只有缓存 RPC 读取。
- 排行榜中昵称为 `考研战士` 的记录在清理前共有 `23` 条，已删除完成，复查结果为 `0` 条。
