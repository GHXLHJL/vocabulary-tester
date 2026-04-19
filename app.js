document.addEventListener('DOMContentLoaded', () => {
    const wordTbody = document.getElementById('word-tbody');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const resetTestBtn = document.getElementById('reset-test-btn');
    const testSummary = document.getElementById('test-summary');
    const summaryTotal = document.getElementById('summary-total');
    const summaryCorrect = document.getElementById('summary-correct');
    const summaryIncorrect = document.getElementById('summary-incorrect');
    const summaryAccuracy = document.getElementById('summary-accuracy');
    const filterErrorsContainer = document.getElementById('filter-errors-container');
    const toggleErrorsBtn = document.getElementById('toggle-errors-btn');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // 悬浮错题导航相关 DOM
    const floatingNavContainer = document.getElementById('floating-nav-container');
    const floatingNavToggle = document.getElementById('floating-nav-toggle');
    const floatingNavBadge = document.getElementById('floating-nav-badge');
    const floatingNavPanel = document.getElementById('floating-nav-panel');
    const floatingNavList = document.getElementById('floating-nav-list');
    const floatingNavOverlay = document.getElementById('floating-nav-overlay');

    const STORAGE_KEY = 'vocabulary_tester_data_v24';

    // 预置部分初始词库
    const defaultWords = [
        { id: generateId(), group: 1, word: 'ascribe', expectedAnswer: '将…归因于/认为…具有', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'prescribe', expectedAnswer: '开药', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'subscribe', expectedAnswer: '订阅/同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'describe', expectedAnswer: '描述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'mantal', expectedAnswer: '覆盖', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'mortal', expectedAnswer: '凡人', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'mental', expectedAnswer: '精神（健康）的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'metal', expectedAnswer: '金属', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'medal', expectedAnswer: '奖章', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'score', expectedAnswer: '分数', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'scorn', expectedAnswer: '蔑视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'corn', expectedAnswer: '玉米', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'ore', expectedAnswer: '矿', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'sore', expectedAnswer: '痛处', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'core', expectedAnswer: '核心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'scar', expectedAnswer: '伤痕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'stationary', expectedAnswer: '静止的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'stationery', expectedAnswer: '文具', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'confuse', expectedAnswer: '迷惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'refuse', expectedAnswer: '拒绝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'infuse', expectedAnswer: '注入', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'diffuse', expectedAnswer: '传播（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'transfuse', expectedAnswer: '输（血）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'test', expectedAnswer: '测试', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'text', expectedAnswer: '文本', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'taste', expectedAnswer: '喜好/品味', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'task', expectedAnswer: '任务', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'elect', expectedAnswer: '选举', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'erect', expectedAnswer: '建立', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'cardinal', expectedAnswer: '最重要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'cordial', expectedAnswer: '热情友好的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'expect', expectedAnswer: '期待/预计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'expert', expectedAnswer: '专家（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'export', expectedAnswer: '出口（物）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'except', expectedAnswer: '除…之外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'excerpt', expectedAnswer: '摘录', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'expend', expectedAnswer: '花钱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'expand', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'extend', expectedAnswer: '延长/包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'extent', expectedAnswer: '程度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'expire', expectedAnswer: '过期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'expose', expectedAnswer: '暴露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'week', expectedAnswer: '星期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'weed', expectedAnswer: '杂草', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'weep', expectedAnswer: '流出/哭泣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'sweep', expectedAnswer: '扫过/迅速传播', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'wipe', expectedAnswer: '擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'wife', expectedAnswer: '妻子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'whip', expectedAnswer: '党鞭/鞭子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'ventilate', expectedAnswer: '使通风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'versatile', expectedAnswer: '多才多艺的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'volatile', expectedAnswer: '易发挥的/易变的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'gratitude', expectedAnswer: '感谢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'attitude', expectedAnswer: '态度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'altitude', expectedAnswer: '高度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'latitude', expectedAnswer: '纬度/自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'longitude', expectedAnswer: '经度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'aptitude', expectedAnswer: '天赋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'talent', expectedAnswer: '才能/天才', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'latent', expectedAnswer: '潜伏的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'patent', expectedAnswer: '专利/专利权', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'tenant', expectedAnswer: '租户/佃户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'lantern', expectedAnswer: '灯笼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'lateral', expectedAnswer: '侧面的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'vote', expectedAnswer: '投票', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'veto', expectedAnswer: '否决', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'row', expectedAnswer: '争吵/一排', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'raw', expectedAnswer: '未经加工的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'law', expectedAnswer: '法则', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'paw', expectedAnswer: '爪子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'jaw', expectedAnswer: '下巴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'saw', expectedAnswer: '锯', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'sew', expectedAnswer: '缝制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'sow', expectedAnswer: '播种', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'driff', expectedAnswer: '移动/漂流', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'draff', expectedAnswer: '草稿/草拟（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'thrift', expectedAnswer: '节俭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'quota', expectedAnswer: '配额', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'quote', expectedAnswer: '引用', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'quoth', expectedAnswer: '说', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'quotient', expectedAnswer: '商', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'quotidian', expectedAnswer: '每日的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'parade', expectedAnswer: '游行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'paradox', expectedAnswer: '悖论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'paralyse', expectedAnswer: '使瘫痪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'paradise', expectedAnswer: '天堂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'alter', expectedAnswer: '改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'alert', expectedAnswer: '警惕（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'avert', expectedAnswer: '防止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'overt', expectedAnswer: '公开的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'invert', expectedAnswer: '颠倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'principal', expectedAnswer: '主要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'principle', expectedAnswer: '原则', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'ecological', expectedAnswer: '生态的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'physiological', expectedAnswer: '生理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'psychological', expectedAnswer: '心理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'philosophical', expectedAnswer: '哲学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'erupt', expectedAnswer: '爆发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'abrupt', expectedAnswer: '突然的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'disrupt', expectedAnswer: '使干扰', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'corrupt', expectedAnswer: '腐败（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'sentiment', expectedAnswer: '观点/情绪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'sensible', expectedAnswer: '明智的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'sensitive', expectedAnswer: '敏感的/体贴的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'product', expectedAnswer: '产品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'conduct', expectedAnswer: '实施', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'instruct', expectedAnswer: '指示/教授（v）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'obstruct', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'destruct', expectedAnswer: '毁坏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'construct', expectedAnswer: '建造', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'board', expectedAnswer: '董事会/木板', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'aboard', expectedAnswer: '在船上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'broad', expectedAnswer: '宽阔的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'abroad', expectedAnswer: '在国外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'circulation', expectedAnswer: '发行量/流通', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'curriculum', expectedAnswer: '课程', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'circumstance', expectedAnswer: '情况/命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'recent', expectedAnswer: '最近的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'resent', expectedAnswer: '愤恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'consent', expectedAnswer: '同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'context', expectedAnswer: '背景/语境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'contest', expectedAnswer: '比赛/争辩', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'contend', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'content', expectedAnswer: '内容/满意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'operate', expectedAnswer: '经营/运转', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'cooperate', expectedAnswer: '合作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'corporate', expectedAnswer: '公司的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'incorporate', expectedAnswer: '包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'coordinate', expectedAnswer: '使协调', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'protest', expectedAnswer: '抗议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'pretext', expectedAnswer: '借口', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'process', expectedAnswer: '过程/处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'progress', expectedAnswer: '进步/进展', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'congress', expectedAnswer: '国会/代表大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'inform', expectedAnswer: '通知/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'reform', expectedAnswer: '改革', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'conform', expectedAnswer: '遵守/相一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'confer', expectedAnswer: '授予', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'infer', expectedAnswer: '推断', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'refer', expectedAnswer: '涉及/查阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'defer', expectedAnswer: '推迟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'chase', expectedAnswer: '追逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'phase', expectedAnswer: '阶段', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'phrase', expectedAnswer: '短语/叙述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'purchase', expectedAnswer: '购买', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'assume', expectedAnswer: '假设', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'resume', expectedAnswer: '继续/简历', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'presume', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'consume', expectedAnswer: '消耗/吃喝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'clash', expectedAnswer: '冲突', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'crash', expectedAnswer: '撞车/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'crack', expectedAnswer: '破裂/打压', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'crush', expectedAnswer: '压坏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'genuine', expectedAnswer: '真正的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'genius', expectedAnswer: '天才', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'ingenious', expectedAnswer: '精巧的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'ingenuity', expectedAnswer: '创造力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'ingenuous', expectedAnswer: '单纯的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'serve', expectedAnswer: '服务/用于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'reserve', expectedAnswer: '预订', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'observe', expectedAnswer: '观察', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'deserve', expectedAnswer: '值得', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'preserve', expectedAnswer: '维护', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'subserve', expectedAnswer: '促进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'conserve', expectedAnswer: '节约', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'congregate', expectedAnswer: '聚集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'segregate', expectedAnswer: '使隔离', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'convention', expectedAnswer: '习俗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'contention', expectedAnswer: '争论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'contract', expectedAnswer: '合同', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'contrast', expectedAnswer: '差异', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'contrary', expectedAnswer: '相反的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'controversy', expectedAnswer: '争论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'mount', expectedAnswer: '发起', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'amount', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'account', expectedAnswer: '账户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'literacy', expectedAnswer: '读写能力/专业能力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'literal', expectedAnswer: '字面上的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'literary', expectedAnswer: '文学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'liberal', expectedAnswer: '开放的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'liberty', expectedAnswer: '自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'property', expectedAnswer: '财产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'poverty', expectedAnswer: '贫穷的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'proper', expectedAnswer: '恰当的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'prosper', expectedAnswer: '繁荣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'prospect', expectedAnswer: '可能性', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'propel', expectedAnswer: '推进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'reproach', expectedAnswer: '责备', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'approach', expectedAnswer: '接近', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'approval', expectedAnswer: '赞成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'appear', expectedAnswer: '出现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'inflict', expectedAnswer: '使遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'conflict', expectedAnswer: '冲突', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'delicate', expectedAnswer: '精美的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'dedicate', expectedAnswer: '献身于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'indicate', expectedAnswer: '表明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'distinguish', expectedAnswer: '区分', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'distinguished', expectedAnswer: '卓著的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'extinguish', expectedAnswer: '熄灭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'extinct', expectedAnswer: '已灭绝的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'distinction', expectedAnswer: '差别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'distinct', expectedAnswer: '截然不同的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'instinct', expectedAnswer: '本能', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'attempt', expectedAnswer: '尝试', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'contempt', expectedAnswer: '鄙视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'tempt', expectedAnswer: '引诱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'temptation', expectedAnswer: '诱惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'temple', expectedAnswer: '寺院', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'template', expectedAnswer: '模版', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'contemplate', expectedAnswer: '思考', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'tempo', expectedAnswer: '节奏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'temporal', expectedAnswer: '短暂的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'temporary', expectedAnswer: '暂时的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'hamper', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'cape', expectedAnswer: '披风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'cap', expectedAnswer: '帽子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'cope', expectedAnswer: '处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'cop', expectedAnswer: '警察', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'rap', expectedAnswer: '说唱/敲击', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'rape', expectedAnswer: '强奸/抢夺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'lapse', expectedAnswer: '疏忽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'elapse', expectedAnswer: '流逝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'collapse', expectedAnswer: '倒塌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'precious', expectedAnswer: '珍贵的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'previous', expectedAnswer: '先前的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'precise', expectedAnswer: '精确的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'conceive', expectedAnswer: '想象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'perceive', expectedAnswer: '看待', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'receive', expectedAnswer: '收到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'deceive', expectedAnswer: '欺骗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'sufficient', expectedAnswer: '充足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'efficient', expectedAnswer: '效率高的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'escalate', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'evaluate', expectedAnswer: '评价', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'estimate', expectedAnswer: '估计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'eliminate', expectedAnswer: '消除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'simulate', expectedAnswer: '假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'stimulate', expectedAnswer: '刺激', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'calculate', expectedAnswer: '计算', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'speculate', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'spectrum', expectedAnswer: '光谱/范围', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'spectacle', expectedAnswer: '景象/眼镜', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'repeal', expectedAnswer: '废止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'repel', expectedAnswer: '驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'rebel', expectedAnswer: '反抗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'dispel', expectedAnswer: '驱散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'impel', expectedAnswer: '促使', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'compel', expectedAnswer: '强迫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'propel', expectedAnswer: '推动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'expel', expectedAnswer: '开除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'excel', expectedAnswer: '擅长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'gas', expectedAnswer: '气体', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'gasp', expectedAnswer: '喘气', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'gape', expectedAnswer: '裂开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'grasp', expectedAnswer: '理解', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'grape', expectedAnswer: '葡萄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'gossip', expectedAnswer: '流言', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'inventive', expectedAnswer: '善于创新的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'incentive', expectedAnswer: '激励', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'intensive', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'inclusive', expectedAnswer: '包括的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'assure', expectedAnswer: '（人）保证', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'insure', expectedAnswer: '（钱）给…买保险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'ensure', expectedAnswer: '（事）确保', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'secure', expectedAnswer: '（资源）获得/使安全', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'equality', expectedAnswer: '平等', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'quantity', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'quality', expectedAnswer: '质量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'qualify', expectedAnswer: '使合格', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'vigorous', expectedAnswer: '精力旺盛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'rigorous', expectedAnswer: '严厉的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'humorous', expectedAnswer: '幽默的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'victorious', expectedAnswer: '获胜的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'curious', expectedAnswer: '好奇的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'nervous', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'obvious', expectedAnswer: '明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'dubious', expectedAnswer: '怀疑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'serious', expectedAnswer: '严重的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'district', expectedAnswer: '地区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'distribute', expectedAnswer: '分发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'contribute', expectedAnswer: '捐赠', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'attribute', expectedAnswer: '把...归因于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'substance', expectedAnswer: '物质', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'substitute', expectedAnswer: '代替的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'institute', expectedAnswer: '机构', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'constitute', expectedAnswer: '构成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'dense', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'sense', expectedAnswer: '感觉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'tense', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'tease', expectedAnswer: '戏弄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'inhabit', expectedAnswer: '居住于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'inhibit', expectedAnswer: '抑制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'define', expectedAnswer: '定义', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'confine', expectedAnswer: '限制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'refine', expectedAnswer: '提炼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'ascend', expectedAnswer: '上升', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'descend', expectedAnswer: '下降', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'transcend', expectedAnswer: '超出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'assist', expectedAnswer: '帮助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'persist', expectedAnswer: '坚持', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'resist', expectedAnswer: '抵制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'consist', expectedAnswer: '由...组成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'roast', expectedAnswer: '烘烤', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'boast', expectedAnswer: '自夸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'boost', expectedAnswer: '增长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'complement', expectedAnswer: '补足', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'compliment', expectedAnswer: '称赞', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'trail', expectedAnswer: '追踪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'trial', expectedAnswer: '试验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'state', expectedAnswer: '国家/状况', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'statue', expectedAnswer: '雕塑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'status', expectedAnswer: '地位', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'statute', expectedAnswer: '法令', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'stature', expectedAnswer: '身材', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'humble', expectedAnswer: '谦逊的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'tumble', expectedAnswer: '跌到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'stumble', expectedAnswer: '绊倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'gamble', expectedAnswer: '赌博', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'render', expectedAnswer: '渲染', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'tender', expectedAnswer: '温柔的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'wonder', expectedAnswer: '惊讶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'gender', expectedAnswer: '性别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'ponder', expectedAnswer: '考虑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'abstract', expectedAnswer: '抽象的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'subject', expectedAnswer: '主题', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'object', expectedAnswer: '目标', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'inject', expectedAnswer: '注射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'project', expectedAnswer: '项目', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'eject', expectedAnswer: '驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'polish', expectedAnswer: '擦亮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'astonish', expectedAnswer: '使吃惊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'abolish', expectedAnswer: '废止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'foolish', expectedAnswer: '愚蠢的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'consensus', expectedAnswer: '共识', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'census', expectedAnswer: '官方统计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'versus', expectedAnswer: '以...为对手', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'aid', expectedAnswer: '援助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'lid', expectedAnswer: '盖子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'bid', expectedAnswer: '出价', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'hid(hide)', expectedAnswer: '躲藏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'rid', expectedAnswer: '摆脱', userAnswer: '', isCorrect: null },




    ];

    let words = [];
    let isShowingOnlyErrors = false; // 记录当前是否处于“只看错题”模式

    function setBackToTopVisible(isVisible) {
        backToTopBtn.classList.toggle('is-visible', isVisible);
    }

    function setFloatingNavVisible(isVisible) {
        floatingNavContainer.classList.toggle('is-visible', isVisible);
        if (!isVisible) {
            setFloatingNavOpen(false);
        }
    }

    function setFloatingNavOpen(isOpen) {
        floatingNavPanel.classList.toggle('open', isOpen);
        floatingNavOverlay.classList.toggle('open', isOpen);
        floatingNavToggle.setAttribute('aria-expanded', String(isOpen));
    }

    // 生成唯一 ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function createDefaultWords() {
        return defaultWords.map(word => ({ ...word }));
    }

    function isValidStoredWords(data) {
        return Array.isArray(data) && data.every(word =>
            word &&
            typeof word.word === 'string' &&
            typeof word.expectedAnswer === 'string' &&
            Object.prototype.hasOwnProperty.call(word, 'userAnswer') &&
            Object.prototype.hasOwnProperty.call(word, 'isCorrect')
        );
    }

    // 从 LocalStorage 加载数据
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            words = createDefaultWords();
            saveData();
            return;
        }

        try {
            const parsedData = JSON.parse(data);
            if (isValidStoredWords(parsedData)) {
                words = parsedData;
            } else {
                words = createDefaultWords();
                saveData();
            }
        } catch (error) {
            console.warn('本地缓存数据损坏，已自动恢复默认词库。', error);
            words = createDefaultWords();
            saveData();
        }
    }

    // 保存数据到 LocalStorage
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    }

    // 渲染表格内容
    function renderTable() {
        wordTbody.innerHTML = '';
        let lastGroup = null;
        let currentGroupTr = null;
        let hasErrorInCurrentGroup = false;

        words.forEach((wordObj, index) => {
            // 在“只看错题”模式下，跳过正确的题目
            if (isShowingOnlyErrors && wordObj.isCorrect === true) {
                return;
            }

            // 如果存在 group 属性且与上一个不同，则准备插入新的模组分隔行
            if (wordObj.group !== undefined && wordObj.group !== lastGroup) {
                // 如果上一个模组在“只看错题”模式下没有错题，则将其隐藏
                if (isShowingOnlyErrors && currentGroupTr && !hasErrorInCurrentGroup) {
                    currentGroupTr.style.display = 'none';
                }

                currentGroupTr = document.createElement('tr');
                currentGroupTr.className = 'group-separator';
                currentGroupTr.id = `module-${wordObj.group}`;

                const separatorTd = document.createElement('td');
                separatorTd.colSpan = 3;

                const groupLabel = document.createElement('div');
                groupLabel.className = 'group-label';
                groupLabel.textContent = `▶ 模组: ${wordObj.group}`;
                separatorTd.appendChild(groupLabel);

                currentGroupTr.appendChild(separatorTd);
                wordTbody.appendChild(currentGroupTr);

                lastGroup = wordObj.group;
                hasErrorInCurrentGroup = false; // 重置当前模组的错题标记
            }

            // 检查当前题目是否为错题（错误或未作答）
            if (wordObj.isCorrect === false) {
                hasErrorInCurrentGroup = true;
            }

            const tr = createRow(wordObj, index);
            wordTbody.appendChild(tr);
        });

        // 循环结束后，处理最后一个模组的分隔行显示状态
        if (isShowingOnlyErrors && currentGroupTr && !hasErrorInCurrentGroup) {
            currentGroupTr.style.display = 'none';
        }
    }

    // 创建单行表格内容
    function createRow(wordObj, index) {
        const tr = document.createElement('tr');
        updateRowAppearance(tr, wordObj);

        // 【英文单词】列
        const tdWord = document.createElement('td');
        tdWord.className = 'word-cell';
        tdWord.textContent = wordObj.word;
        tr.appendChild(tdWord);

        // 【你的答案】列
        const tdAnswer = document.createElement('td');
        const inputAnswer = document.createElement('input');
        inputAnswer.type = 'text';
        inputAnswer.value = wordObj.userAnswer || '';
        inputAnswer.placeholder = '输入中文释义...';

        // 绑定 input 事件，实现实时保存（不验证）
        inputAnswer.addEventListener('input', (e) => {
            handleAnswerInput(index, e.target.value, tr);
        });

        tdAnswer.appendChild(inputAnswer);
        tr.appendChild(tdAnswer);

        // 【检测结果】列
        const tdResult = document.createElement('td');
        tdResult.className = 'result-cell';
        updateResultCell(tdResult, wordObj);
        tr.appendChild(tdResult);

        return tr;
    }

    // 更新行的样式（正确/错误背景色）
    function updateRowAppearance(tr, wordObj) {
        tr.classList.remove('correct', 'incorrect');
        if (wordObj.isCorrect === true) {
            tr.classList.add('correct');
        } else if (wordObj.isCorrect === false) {
            tr.classList.add('incorrect');
        }
    }

    // 更新检测结果单元格的内容（✅ / ❌）
    function updateResultCell(tdResult, wordObj) {
        if (wordObj.isCorrect === true) {
            tdResult.innerHTML = '<span class="result-correct">✅ 正确</span>';
        } else if (wordObj.isCorrect === false) {
            tdResult.innerHTML = '<span class="result-incorrect">❌ 错误</span>';
        } else {
            tdResult.innerHTML = '';
        }
    }

    // 处理用户输入，只保存不验证
    function handleAnswerInput(index, value, tr) {
        const wordObj = words[index];
        wordObj.userAnswer = value;
        wordObj.isCorrect = null; // 重置状态

        saveData(); // 实时保存用户的答题记录，但不判断正误

        updateRowAppearance(tr, wordObj);
        const tdResult = tr.querySelector('.result-cell');
        updateResultCell(tdResult, wordObj);
    }

    // 清洗字符串：移除括号及其中内容，移除所有非中文字符（如标点符号等）
    function cleanString(str) {
        if (!str) return '';
        // 移除中文括号和英文括号及其内部的内容
        let cleaned = str.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '');
        // 移除所有非中文字符、非英文字母数字（相当于去除了标点符号、空格等）
        // 这样可以实现最大的宽松度匹配
        cleaned = cleaned.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
        return cleaned;
    }

    // 提交检测所有单词
    submitTestBtn.addEventListener('click', () => {
        let correctCount = 0;
        let totalCount = 0;
        const errorGroups = new Set(); // 收集有错题的模组编号

        words.forEach(wordObj => {
            const userAns = wordObj.userAnswer || '';
            totalCount++; // 所有单词（无论是否作答）都计入总数

            if (userAns.trim() === '') {
                wordObj.isCorrect = false; // 未作答直接算作错误
            } else {
                // 清洗用户输入
                const cleanedUserAns = cleanString(userAns);

                // 获取所有可能的正确答案，并分别清洗
                const possibleAnswers = wordObj.expectedAnswer.split('/').map(ans => cleanString(ans));

                // 只要清洗后的用户输入匹配任何一个清洗后的正确答案即为正确
                wordObj.isCorrect = possibleAnswers.some(ans => ans === cleanedUserAns);
            }

            if (wordObj.isCorrect) {
                correctCount++;
            } else {
                if (wordObj.group) {
                    errorGroups.add(wordObj.group); // 记录错误模组
                }
            }
        });

        saveData();
        renderTable(); // 全量刷新显示结果

        // ==== 显示本地成绩汇总 ====
        if (totalCount > 0) {
            const incorrectCount = totalCount - correctCount;
            const accuracy = ((correctCount / totalCount) * 100).toFixed(1);

            summaryTotal.textContent = totalCount;
            summaryCorrect.textContent = correctCount;
            summaryIncorrect.textContent = incorrectCount;
            summaryAccuracy.textContent = accuracy + '%';

            // 渲染“只看错题”切换按钮
            if (incorrectCount > 0) {
                filterErrorsContainer.style.display = 'block';
            } else {
                filterErrorsContainer.style.display = 'none';
                isShowingOnlyErrors = false; // 如果全对，强制重置状态
                updateToggleButtonUI();
            }

            // ==== 渲染悬浮错题导航 ====
            if (errorGroups.size > 0) {
                setFloatingNavVisible(true);
                floatingNavBadge.textContent = errorGroups.size;
                floatingNavList.innerHTML = '';

                const sortedGroups = Array.from(errorGroups).sort((a, b) => a - b);
                sortedGroups.forEach(group => {
                    const link = document.createElement('a');
                    link.href = `#module-${group}`;
                    link.className = 'error-module-link';
                    link.textContent = `模组 ${group}`;

                    // 点击导航项实现平滑跳转，并收起面板
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetModule = document.getElementById(`module-${group}`);
                        if (targetModule) {
                            // 稍微偏移一点以防被顶部或导航遮挡
                            const yOffset = -20;
                            const y = targetModule.getBoundingClientRect().top + window.scrollY + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });

                            // 高亮提示
                            targetModule.style.backgroundColor = '#fff3cd';
                            setTimeout(() => {
                                targetModule.style.backgroundColor = '';
                            }, 1000);

                            // 跳转后自动收起面板
                            setFloatingNavOpen(false);
                        }
                    });

                    floatingNavList.appendChild(link);
                });
            } else {
                setFloatingNavVisible(false);
            }

            testSummary.style.display = 'block';

            // 滚动到成绩汇总区
            testSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            testSummary.style.display = 'none';
            alert('请先输入答案再提交检测！');
        }
    });

    // 清空重填事件绑定
    resetTestBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有答案重新测试吗？')) {
            words.forEach(wordObj => {
                wordObj.userAnswer = '';
                wordObj.isCorrect = null;
            });
            saveData();
            renderTable();
            testSummary.style.display = 'none';
            filterErrorsContainer.style.display = 'none';
            setFloatingNavVisible(false);
            isShowingOnlyErrors = false; // 重置时恢复全部显示
            updateToggleButtonUI();
        }
    });

    // “只看错题” 按钮点击事件
    toggleErrorsBtn.addEventListener('click', () => {
        isShowingOnlyErrors = !isShowingOnlyErrors;
        updateToggleButtonUI();
        renderTable(); // 重新渲染表格，应用过滤逻辑
    });

    // 悬浮导航按钮点击事件：展开/收起错题列表
    floatingNavToggle.addEventListener('click', () => {
        setFloatingNavOpen(!floatingNavPanel.classList.contains('open'));
    });

    // 点击页面其他地方自动收起悬浮导航面板
    document.addEventListener('click', (e) => {
        if (!floatingNavContainer.contains(e.target) &&
            !floatingNavOverlay.contains(e.target) &&
            floatingNavPanel.classList.contains('open')) {
            setFloatingNavOpen(false);
        }
    });

    floatingNavOverlay.addEventListener('click', () => {
        setFloatingNavOpen(false);
    });

    // 更新切换按钮的样式和文字
    function updateToggleButtonUI() {
        if (isShowingOnlyErrors) {
            toggleErrorsBtn.textContent = '显示全部单词';
            toggleErrorsBtn.style.backgroundColor = '#6c757d'; // 灰色
        } else {
            toggleErrorsBtn.textContent = '只看错题';
            toggleErrorsBtn.style.backgroundColor = '#ff4757'; // 红色
        }
    }

    // ==== 悬浮回到顶部功能 ====
    // 监听滚动事件，当向下滚动超过 300px 时显示按钮
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            setBackToTopVisible(true);
        } else {
            setBackToTopVisible(false);
        }
    });

    // 点击按钮平滑滚动到顶部
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 初始化页面
    loadData();
    renderTable();
});
