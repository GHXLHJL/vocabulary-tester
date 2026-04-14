document.addEventListener('DOMContentLoaded', () => {
    const wordTbody = document.getElementById('word-tbody');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const resetTestBtn = document.getElementById('reset-test-btn');
    const testSummary = document.getElementById('test-summary');
    const summaryTotal = document.getElementById('summary-total');
    const summaryCorrect = document.getElementById('summary-correct');
    const summaryIncorrect = document.getElementById('summary-incorrect');
    const summaryAccuracy = document.getElementById('summary-accuracy');

    const STORAGE_KEY = 'vocabulary_tester_data_v7';

    // 预置部分初始词库
    const defaultWords = [
        { id: generateId(), group: 1, word: 'ascribe', expectedAnswer: '将…归因于/认为…具有', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'prescribe', expectedAnswer: '开药', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'subscribe', expectedAnswer: '订阅/同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'describe', expectedAnswer: '描述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'alter', expectedAnswer: '改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'alert', expectedAnswer: '警惕（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'avert', expectedAnswer: '防止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'overt', expectedAnswer: '公开的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'invert', expectedAnswer: '颠倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'principal', expectedAnswer: '主要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'principle', expectedAnswer: '原则', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'ecological', expectedAnswer: '生态的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'physiological', expectedAnswer: '生理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'psychological', expectedAnswer: '心理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'philosophical', expectedAnswer: '哲学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'erupt', expectedAnswer: '爆发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'abrupt', expectedAnswer: '突然的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'disrupt', expectedAnswer: '使干扰', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'sentiment', expectedAnswer: '观点/情绪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'sensible', expectedAnswer: '明智的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'sensitive', expectedAnswer: '敏感的/体贴的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'product', expectedAnswer: '产品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'conduct', expectedAnswer: '实施', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'instruct', expectedAnswer: '指示/教授（v）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'obstruct', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'destruct', expectedAnswer: '毁坏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'construct', expectedAnswer: '建造', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'board', expectedAnswer: '董事会/木板', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'aboard', expectedAnswer: '在船上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'broad', expectedAnswer: '宽阔的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'abroad', expectedAnswer: '在国外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'circulation', expectedAnswer: '发行量/流通', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'curriculum', expectedAnswer: '课程', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'circumstance', expectedAnswer: '情况/命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'recent', expectedAnswer: '最近的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'resent', expectedAnswer: '愤恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'consent', expectedAnswer: '同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'context', expectedAnswer: '背景/语境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'contest', expectedAnswer: '比赛/争辩', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'contend', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'content', expectedAnswer: '内容/满意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'operate', expectedAnswer: '经营/运转', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'cooperate', expectedAnswer: '合作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'corporate', expectedAnswer: '公司的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'incorporate', expectedAnswer: '包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'coordinate', expectedAnswer: '使协调', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'protest', expectedAnswer: '抗议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'pretext', expectedAnswer: '借口', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'process', expectedAnswer: '过程/处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'progress', expectedAnswer: '进步/进展', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'congress', expectedAnswer: '国会/代表大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'inform', expectedAnswer: '通知/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'reform', expectedAnswer: '改革', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'conform', expectedAnswer: '遵守/相一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'confer', expectedAnswer: '授予', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'infer', expectedAnswer: '推断', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'refer', expectedAnswer: '涉及/查阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'defer', expectedAnswer: '推迟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'chase', expectedAnswer: '追逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'phase', expectedAnswer: '阶段', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'phrase', expectedAnswer: '短语/叙述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'purchase', expectedAnswer: '购买', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'assume', expectedAnswer: '假设', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'resume', expectedAnswer: '继续/简历', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'presume', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'consume', expectedAnswer: '消耗/吃喝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'clash', expectedAnswer: '冲突', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'crash', expectedAnswer: '撞车/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'crack', expectedAnswer: '破裂/打压', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'crush', expectedAnswer: '压坏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'ingenious', expectedAnswer: '精巧的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'ingenuous', expectedAnswer: '单纯的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'serve', expectedAnswer: '服务/用于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'reserve', expectedAnswer: '预订', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'observe', expectedAnswer: '观察', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'deserve', expectedAnswer: '值得', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'preserve', expectedAnswer: '维护', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'subserve', expectedAnswer: '促进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'conserve', expectedAnswer: '节约', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'congregate', expectedAnswer: '聚集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'segregate', expectedAnswer: '使隔离', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'convention', expectedAnswer: '习俗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'contention', expectedAnswer: '争论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'contract', expectedAnswer: '合同', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'contrast', expectedAnswer: '差异', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'contrary', expectedAnswer: '相反的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'controversy', expectedAnswer: '争论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'mount', expectedAnswer: '发起', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'amount', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'account', expectedAnswer: '账户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'literacy', expectedAnswer: '读写能力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'literal', expectedAnswer: '字面上的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'literary', expectedAnswer: '文学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'liberal', expectedAnswer: '开放的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'liberty', expectedAnswer: '自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'property', expectedAnswer: '财产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'poverty', expectedAnswer: '贫穷的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'proper', expectedAnswer: '恰当的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'prosper', expectedAnswer: '繁荣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'prospect', expectedAnswer: '可能性', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'propel', expectedAnswer: '推进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'reproach', expectedAnswer: '责备', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'approach', expectedAnswer: '接近', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'approval', expectedAnswer: '赞成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'appear', expectedAnswer: '出现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'inflict', expectedAnswer: '使遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'conflict', expectedAnswer: '冲突', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'delicate', expectedAnswer: '精美的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'dedicate', expectedAnswer: '献身于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'indicate', expectedAnswer: '表明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'distinguish', expectedAnswer: '区分', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'distinguished', expectedAnswer: '卓著的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'extinguish', expectedAnswer: '熄灭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'extinct', expectedAnswer: '已灭绝的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'distinction', expectedAnswer: '差别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'distinct', expectedAnswer: '截然不同的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'instinct', expectedAnswer: '本能', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'attempt', expectedAnswer: '尝试', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'contempt', expectedAnswer: '鄙视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'tempt', expectedAnswer: '引诱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'temple', expectedAnswer: '寺院', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'hamper', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'lapse', expectedAnswer: '疏忽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'elapse', expectedAnswer: '流逝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'collapse', expectedAnswer: '倒塌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'precious', expectedAnswer: '珍贵的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'previous', expectedAnswer: '先前的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'precise', expectedAnswer: '精确的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'conceive', expectedAnswer: '想象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'perceive', expectedAnswer: '看待', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'receive', expectedAnswer: '收到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'deceive', expectedAnswer: '欺骗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'sufficient', expectedAnswer: '充足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'efficient', expectedAnswer: '效率高的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'escalate', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'evaluate', expectedAnswer: '评价', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'estimate', expectedAnswer: '估计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'eliminate', expectedAnswer: '消除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'simulate', expectedAnswer: '假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'stimulate', expectedAnswer: '刺激', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'calculate', expectedAnswer: '计算', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'speculate', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'spectrum', expectedAnswer: '光谱/范围', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'spectacle', expectedAnswer: '景象/眼镜', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'repel', expectedAnswer: '驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'rebel', expectedAnswer: '反抗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'inventive', expectedAnswer: '善于创新的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'incentive', expectedAnswer: '激励', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'intensive', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'inclusive', expectedAnswer: '包括的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'assure', expectedAnswer: '（人）保证', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'insure', expectedAnswer: '（钱）给…买保险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'ensure', expectedAnswer: '（事）确保', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'secure', expectedAnswer: '（资源）获得/使安全', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'equality', expectedAnswer: '平等', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'quantity', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'quality', expectedAnswer: '质量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'qualify', expectedAnswer: '使合格', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'vigorous', expectedAnswer: '精力旺盛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'rigorous', expectedAnswer: '严厉的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'humorous', expectedAnswer: '幽默的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'victorious', expectedAnswer: '获胜的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'curious', expectedAnswer: '好奇的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'nervous', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'obvious', expectedAnswer: '明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'dubious', expectedAnswer: '怀疑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'serious', expectedAnswer: '严重的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'district', expectedAnswer: '地区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'distribute', expectedAnswer: '分发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'contribute', expectedAnswer: '捐赠', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'attribute', expectedAnswer: '把...归因于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'substance', expectedAnswer: '物质', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'substitute', expectedAnswer: '代替的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'institute', expectedAnswer: '机构', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'constitute', expectedAnswer: '构成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'dense', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'sense', expectedAnswer: '感官', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'tense', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'tease', expectedAnswer: '戏弄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'inhabit', expectedAnswer: '居住于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'inhibit', expectedAnswer: '抑制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'define', expectedAnswer: '定义', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'confine', expectedAnswer: '限制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'refine', expectedAnswer: '提炼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'ascend', expectedAnswer: '上升', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'descend', expectedAnswer: '下降', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'transcend', expectedAnswer: '超出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'assist', expectedAnswer: '帮助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'persist', expectedAnswer: '坚持', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'resist', expectedAnswer: '抵制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'consist', expectedAnswer: '由...组成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'roast', expectedAnswer: '烘烤', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'boast', expectedAnswer: '自夸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'boost', expectedAnswer: '增长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'complement', expectedAnswer: '补足', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'compliment', expectedAnswer: '称赞', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'trail', expectedAnswer: '追踪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'trial', expectedAnswer: '试验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'state', expectedAnswer: '状况', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'statue', expectedAnswer: '雕塑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'status', expectedAnswer: '地位', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'statute', expectedAnswer: '法令', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'stature', expectedAnswer: '身材', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'humble', expectedAnswer: '谦逊的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'tumble', expectedAnswer: '跌到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'stumble', expectedAnswer: '绊倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'gamble', expectedAnswer: '赌博', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'render', expectedAnswer: '渲染', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'tender', expectedAnswer: '温柔的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'wonder', expectedAnswer: '惊讶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'gender', expectedAnswer: '性别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'ponder', expectedAnswer: '考虑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'abstract', expectedAnswer: '抽象的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'subject', expectedAnswer: '主题', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'object', expectedAnswer: '目标', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'inject', expectedAnswer: '注射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'project', expectedAnswer: '项目', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'eject', expectedAnswer: '驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'polish', expectedAnswer: '擦亮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'astonish', expectedAnswer: '使吃惊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'abolish', expectedAnswer: '废止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'foolish', expectedAnswer: '愚蠢的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'avert', expectedAnswer: '防止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'overt', expectedAnswer: '公开的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'invert', expectedAnswer: '颠倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'consensus', expectedAnswer: '共识', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'census', expectedAnswer: '官方统计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'versus', expectedAnswer: '以...为对手', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'aid', expectedAnswer: '援助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'lid', expectedAnswer: '盖子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'bid', expectedAnswer: '出价', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'hid(hide)', expectedAnswer: '躲藏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'rid', expectedAnswer: '摆脱', userAnswer: '', isCorrect: null }
    ];

    let words = [];

    // 生成唯一 ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 从 LocalStorage 加载数据
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            words = JSON.parse(data);
        } else {
            words = [...defaultWords];
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
        words.forEach((wordObj, index) => {
            // 如果存在 group 属性且与上一个不同，则插入带有模组名称的分隔行
            if (wordObj.group !== undefined && wordObj.group !== lastGroup) {
                const separatorTr = document.createElement('tr');
                separatorTr.className = 'group-separator';
                const separatorTd = document.createElement('td');
                separatorTd.colSpan = 3;

                // 在分隔行中显示模组编号或名称
                const groupLabel = document.createElement('div');
                groupLabel.className = 'group-label';
                groupLabel.textContent = `▶ 模组: ${wordObj.group}`;
                separatorTd.appendChild(groupLabel);

                separatorTr.appendChild(separatorTd);
                wordTbody.appendChild(separatorTr);
            }
            lastGroup = wordObj.group;

            const tr = createRow(wordObj, index);
            wordTbody.appendChild(tr);
        });
    }

    // 创建单行表格内容
    function createRow(wordObj, index) {
        const tr = document.createElement('tr');
        updateRowAppearance(tr, wordObj);

        // 【英文单词】列
        const tdWord = document.createElement('td');
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
        }
    });

    // 初始化页面
    loadData();
    renderTable();
});