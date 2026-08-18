# 接入墨墨 API 方法预设

## 一、目标定位

在每日/周/月测试中，当本地词库释义不足时，调用墨墨 API 补充单词释义，提升判题准确性。

**核心原则**：本地优先，API 兜底，尽量减少 API 调用次数。

---

## 二、已有基础

### 2.1 代码中已有的墨墨相关设施

| 项目 | 说明 |
|------|------|
| `maimemoConfig.token` | 已存 Token 配置 |
| `maimemoConfig.syncWeakness` | 已有开关 |
| `maimemoWordStatusMap` | 已有缓存映射 |
| 设置面板 | 已有 Token 输入框和保存按钮 |

### 2.2 本地已有数据源

| 数据源 | 覆盖范围 |
|--------|---------|
| 内置词库 (`defaultWords`) | 约 1700+ 组易混词组 |
| 墨墨6755词库 (`momo_words.json`) | 6754 个单词及其释义 |
| 考研词库 (`kaoyanDict`) | 约 9600 词 |

**实际上**，结合 6755 词库和考研词库，绝大部分单词释义已经覆盖，API 调用量极小。

---

## 三、接入方案

### 3.1 整体流程

```
┌─────────────────────────────────────────────────────┐
│                  生成测试题目                          │
│                                                       │
│  1. 从词库中抽取 N 组词组 → 获得各组内单词列表          │
│  2. 对每个单词，按优先级查找释义：                      │
│     a. 本地词库（defaultWords 中该组的 expectedAnswer）  │
│     b. 6755词库（momo_words.json）                     │
│     c. 考研词库（kaoyanDict）                          │
│     d. 墨墨 API（在线兜底）                            │
│  3. 缓存 API 查到的结果，下次避免重复请求                │
└─────────────────────────────────────────────────────┘
```

### 3.2 新增数据结构

```javascript
// 释义缓存（新增，独立于 maimemoWordStatusMap）
let wordMeaningCache = {};  // { word: { meaning: "释义", source: "api", cachedAt: timestamp } }

// 释义来源优先级
const MEANING_SOURCES = {
    LOCAL_GROUP: 4,  // 当前词组自带的释义（最高）
    MOMO_DICT: 3,    // 6755词库
    KAOYAN_DICT: 2,  // 考研词库
    MAIMEMO_API: 1   // 墨墨API
};
```

### 3.3 核心函数

```javascript
async function getWordMeaning(word) {
    const key = word.toLowerCase();

    // 1. 检查当前测试词组自带的释义（最高优先级）
    // （由 currentTestGroups 中的 expectAnswer 提供）

    // 2. 检查 6755 词库缓存
    if (momoDict[key]) return { meaning: momoDict[key], source: 'momo_dict' };

    // 3. 检查考研词库
    if (kaoyanDict[key]) return { meaning: kaoyanDict[key], source: 'kaoyan_dict' };

    // 4. 检查之前 API 缓存
    if (wordMeaningCache[key]) return { meaning: wordMeaningCache[key].meaning, source: 'cache' };

    // 5. 调用墨墨 API（兜底）
    return await queryMaimemoAPI(key);
}

async function queryMaimemoAPI(word) {
    // 检查频控
    if (!checkRateLimit()) {
        console.warn('墨墨API调用频控已达上限，跳过');
        return null;
    }

    try {
        const response = await fetch(
            `https://open.maimemo.com/open/api/v1/phrases?keyword=${encodeURIComponent(word)}`,
            {
                headers: { 'Authorization': `Bearer ${maimemoConfig.token}` }
            }
        );
        const data = await response.json();
        const meaning = extractMeaning(data);
        // 缓存结果
        wordMeaningCache[word] = { meaning, source: 'api', cachedAt: Date.now() };
        return { meaning, source: 'api' };
    } catch (err) {
        console.error('墨墨API查询失败:', word, err);
        return null;
    }
}
```

### 3.4 频控管理

```javascript
const RATE_LIMIT = {
    per10s: { max: 20, window: 10000, count: 0, resetAt: 0 },
    per60s: { max: 40, window: 60000, count: 0, resetAt: 0 },
    per5h:  { max: 2000, window: 18000000, count: 0, resetAt: 0 }
};

function checkRateLimit() {
    const now = Date.now();
    for (const limit of Object.values(RATE_LIMIT)) {
        if (now > limit.resetAt) {
            limit.count = 0;
            limit.resetAt = now + limit.window;
        }
        limit.count++;
        if (limit.count > limit.max) return false;
    }
    return true;
}
```

---

## 四、预估调用量

### 场景分析

| 场景 | 每次测试单词数 | 本地缺失率（预估） | 每次API调用量 |
|------|---------------|-------------------|--------------|
| 每日测试 | 70-120个 | 约 5%-10% | **3-12次** |
| 周复盘 | 全部A池组 | 约 5%-10% | 少量 |
| 月度总测 | 全部A池组 | 约 5%-10% | 少量 |

### 频控余量

```
5小时上限 2000次
每次测试调用 3-12次
每天1次测试 ≈ 12次/天
5小时余量：2000 - 12 = 1988 次（充裕）
```

---

## 五、用户配置流程

### 5.1 设置面板新增

```
┌─────────────────────────────────┐
│  设置                            │
│                                  │
│  ✅ 启用墨墨 API 查词（新增开关）  │
│  Token: [________________] (已有) │
│  ✅ 同步墨墨掌握情况 (已有)        │
│                                  │
│  [保存]                          │
│                                  │
│  状态：已连接 / 未连接            │
│  今日已用：0 / 2000 次            │
└─────────────────────────────────┘
```

### 5.2 用户操作步骤

1. 墨墨 App → 我的 → 更多设置 → 实验功能 → 开放 API → 获取 Token
2. 复制 Token 粘贴到工具设置面板
3. 开启「启用墨墨 API 查词」
4. 保存即可

---

## 六、数据流图

```
                    ┌─────────────┐
                    │  生成测试题  │
                    └──────┬──────┘
                           │
                           ▼
              ┌──────────────────────┐
              │  获取每个单词的释义    │
              └──────┬───────────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
   ┌──────────┐ ┌────────┐ ┌────────┐
   │ 本地词库  │ │6755词库│ │考研词库│
   │ (内置)    │ │(JSON)  │ │(JSON)  │
   └──────────┘ └────────┘ └────────┘
          │
          ▼ (本地查不到)
   ┌──────────┐     ┌──────────────┐
   │ 命中缓存  │◄────│ wordMeaning  │
   │ (API缓存) │     │ Cache        │
   └──────────┘     └──────────────┘
          │
          ▼ (缓存未命中)
   ┌──────────┐
   │ 墨墨API  │
   │ (兜底)   │
   └──────────┘
```

---

## 七、实现优先级

| 优先级 | 任务 | 预计工作量 |
|--------|------|-----------|
| P0 | 加载 6755 词库到内存并提供查词接口 | 简单 |
| P1 | 实现 `getWordMeaning()` 多级查找函数 | 中等 |
| P2 | 接入墨墨 API 查词 + 频控管理 | 中等 |
| P3 | 设置面板 UI + 状态展示 | 简单 |
| P4 | 释义缓存持久化（localStorage） | 简单 |

---

## 八、注意事项

1. **Token 需要用户自己申请**，无法通用，每个用户都得操作一次
2. **微信内置浏览器跨域**：墨墨 API 如果没配 CORS，前端直接调会失败，可能需要后端代理
3. **频控是硬限制**：超过 2000 次/5小时会直接被封，必须有严格的频控检测
4. **释义缓存要有过期机制**：避免缓存越来越大的同时，也要保证释义能更新