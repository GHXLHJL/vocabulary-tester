# 发现记录

## 当前项目结构
- 根目录包含网页主文件：`index.html`、`app.js`、`style.css`
- 根目录包含用户入口脚本：`一键更新部署.bat`、`统计单词数量.bat`、`检测单词集问题.bat`
- 根目录包含内部脚本：`replace_words_helper.js`、`add_word_helper.js`、`count_words_in_txt.py`、`check_vocabulary_txt.py`
- 根目录包含缓存：`.english_words_cache.txt`、`.kaoyan_words_cache.txt`、`.spellcheck_cache.json`
- `.trae/specs/vocabulary-tester/` 为 IDE 规格与词库目录

## 依赖关系
- `一键更新部署.bat` 调用 `replace_words_helper.js`
- `统计单词数量.bat` 调用 `count_words_in_txt.py`
- `检测单词集问题.bat` 调用 `check_vocabulary_txt.py`
- `replace_words_helper.js`、`add_word_helper.js` 直接读写根目录的 `app.js`、`index.html`
- Python 检测脚本读取 `.trae/specs/vocabulary-tester/相似单词集.txt`

## 重组建议
- 保留前端文件与 `.bat` 入口在根目录
- 将 Node/Python 内部脚本移入 `scripts/node`、`scripts/python`
- 将缓存统一移入 `cache`
- 新增 `docs/目录说明.md` 作为项目维护入口文档
