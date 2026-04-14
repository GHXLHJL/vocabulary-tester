# Tasks
- [x] Task 1: 初始化项目结构
  - [x] SubTask 1.1: 创建基础的 `index.html`、`style.css` 和 `app.js` 文件。
  - [x] SubTask 1.2: 编写基础页面骨架，引入必要的样式以快速还原 Excel 风格的表格界面。
- [x] Task 2: 构建数据模型和本地存储逻辑
  - [x] SubTask 2.1: 设计单词数据结构（如 `{ id, word, expectedAnswer, userAnswer, isCorrect }`）。
  - [x] SubTask 2.2: 实现从 LocalStorage 读取和写入单词数据的逻辑。
  - [x] SubTask 2.3: 预置部分初始词库（如图片中展示的 ascribe, alter 等），以便首次打开时有数据展示。
- [x] Task 3: 实现 UI 界面和核心交互
  - [x] SubTask 3.1: 动态渲染包含【英文单词】、【你的答案】、【检测结果】的表格数据。
  - [x] SubTask 3.2: 在【你的答案】列渲染输入框，并绑定输入（input 或 change）事件。
  - [x] SubTask 3.3: 实现比对逻辑，当用户输入内容时，忽略前后空格，判断是否与正确答案匹配。
  - [x] SubTask 3.4: 根据比对结果实时更新行或单元格的样式（正确显示浅绿色背景+✅，错误显示浅红色背景+❌）。
- [x] Task 4: 实现添加新单词功能
  - [x] SubTask 4.1: 在页面底部或顶部增加“添加新单词”表单区域（包含英文输入框、中文输入框、添加按钮）。
  - [x] SubTask 4.2: 绑定表单提交事件，验证输入不为空后，将新单词加入数据列表并更新 LocalStorage。
  - [x] SubTask 4.3: 重新渲染表格以显示新添加的单词。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]