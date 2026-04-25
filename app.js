document.addEventListener('DOMContentLoaded', () => {
    const wordTbody = document.getElementById('word-tbody');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const resetTestBtn = document.getElementById('reset-test-btn');
    const testSummary = document.getElementById('test-summary');
    const summaryTotal = document.getElementById('summary-total');
    const summaryCorrect = document.getElementById('summary-correct');
    const summaryIncorrect = document.getElementById('summary-incorrect');
    const summaryAccuracy = document.getElementById('summary-accuracy');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // 悬浮错题导航相关 DOM
    const floatingNavContainer = document.getElementById('floating-nav-container');
    const floatingNavToggle = document.getElementById('floating-nav-toggle');
    const floatingNavBadge = document.getElementById('floating-nav-badge');
    const floatingNavPanel = document.getElementById('floating-nav-panel');
    const floatingNavList = document.getElementById('floating-nav-list');
    const floatingNavOverlay = document.getElementById('floating-nav-overlay');
    const appVersionDisplay = document.getElementById('app-version-display');

    const STORAGE_KEY = 'vocabulary_tester_data_v26.4.34';

    // 在左上角显示当前版本号
    if (appVersionDisplay) {
        const versionMatch = STORAGE_KEY.match(/_v([\d\.]+)$/);
        if (versionMatch) {
            appVersionDisplay.textContent = `Version: v${versionMatch[1]}`;
        }
    }

    // 预置部分初始词库
    const defaultWords = [
        { id: generateId(), group: 1, word: 'ascribe', expectedAnswer: '将…归因于/认为…具有', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'prescribe', expectedAnswer: '开药/规定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'subscribe', expectedAnswer: '订阅/同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'describe', expectedAnswer: '描述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'mantle', expectedAnswer: '覆盖（物）/地幔', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'mortal', expectedAnswer: '凡人/致命的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'mental', expectedAnswer: '精神（健康）的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'metal', expectedAnswer: '金属', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'medal', expectedAnswer: '奖章/奖牌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'ethic', expectedAnswer: '道德观/道德规范', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'ethnic', expectedAnswer: '民族的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'cannon', expectedAnswer: '猛撞/大炮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'canon', expectedAnswer: '标准/真作集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'light', expectedAnswer: '光线/鉴于/点燃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'alight', expectedAnswer: '点亮/落下', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'slight', expectedAnswer: '轻微的/轻视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'plight', expectedAnswer: '困境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'delight', expectedAnswer: '愉快/高兴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'flight', expectedAnswer: '航班/飞行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'delete', expectedAnswer: '删除/删去', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'deplete', expectedAnswer: '耗尽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'volume', expectedAnswer: '容量/一卷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'column', expectedAnswer: '专栏/支柱/列', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'seem', expectedAnswer: '似乎', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'deem', expectedAnswer: '认为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'esteem', expectedAnswer: '尊敬', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'redeem', expectedAnswer: '弥补/兑换', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'feed', expectedAnswer: '喂养/提供/饲料', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'deed', expectedAnswer: '行为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'indeed', expectedAnswer: '确实', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'need', expectedAnswer: '需要', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'reed', expectedAnswer: '芦苇', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'seed', expectedAnswer: '种子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'stuff', expectedAnswer: '东西/填充', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'staff', expectedAnswer: '职工/任职于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'stiff', expectedAnswer: '艰难的/（僵）硬的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'drill', expectedAnswer: '练习/钻（孔）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'drift', expectedAnswer: '漂流/移动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'draft', expectedAnswer: '草稿/草拟（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'thrift', expectedAnswer: '节俭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'essential', expectedAnswer: '基本的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'eccentric', expectedAnswer: '古怪的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'notion', expectedAnswer: '概念', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'notice', expectedAnswer: '注意/通知', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'type', expectedAnswer: '类型/打字', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'tape', expectedAnswer: '录音/磁带/卷尺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'tap', expectedAnswer: '利用/水龙头', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'desert', expectedAnswer: '沙漠/丢弃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'dessert', expectedAnswer: '甜点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'cherish', expectedAnswer: '珍爱/怀念', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'perish', expectedAnswer: '死亡', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'nourish', expectedAnswer: '滋养', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'perspective', expectedAnswer: '观点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'prospective', expectedAnswer: '可能的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'perceptive', expectedAnswer: '有洞察力的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'respective', expectedAnswer: '分别的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'susceptive', expectedAnswer: '敏感的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'retrospective', expectedAnswer: '回想的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'introspective', expectedAnswer: '自省的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'gene', expectedAnswer: '基因', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'genesis', expectedAnswer: '起源', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'general', expectedAnswer: '普通的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'generic', expectedAnswer: '一般的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'genetic', expectedAnswer: '基因的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'generate', expectedAnswer: '产生', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'generation', expectedAnswer: '一代（人）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'generalize', expectedAnswer: '概括/推广', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'generous', expectedAnswer: '慷慨的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'genre', expectedAnswer: '类型', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'generalization', expectedAnswer: '概括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'claim', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'acclaim', expectedAnswer: '称赞', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'declaim', expectedAnswer: '演讲', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'disclaim', expectedAnswer: '否认', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'exclaim', expectedAnswer: '呼喊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'proclaim', expectedAnswer: '宣布', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'reclaim', expectedAnswer: '回收/开垦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'hub', expectedAnswer: '中心/轮轴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'pub', expectedAnswer: '酒馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'sub', expectedAnswer: '替补/潜水艇', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'tub', expectedAnswer: '浴缸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'rub', expectedAnswer: '摩擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'dub', expectedAnswer: '给…起绰号', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'cub', expectedAnswer: '幼崽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'device', expectedAnswer: '设备', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'devise', expectedAnswer: '发明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'advise', expectedAnswer: '建议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'advice', expectedAnswer: '建议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'revise', expectedAnswer: '校阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'evolution', expectedAnswer: '进化', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'resolution', expectedAnswer: '决定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'revelation', expectedAnswer: '揭露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'revolution', expectedAnswer: '革命', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'allege', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'allegation', expectedAnswer: '指控', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'allegiance', expectedAnswer: '忠诚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'alien', expectedAnswer: '外国的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'align', expectedAnswer: '使一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'alliance', expectedAnswer: '联盟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'ally', expectedAnswer: '盟友', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'allay', expectedAnswer: '减轻', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'alloy', expectedAnswer: '合金', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'alley', expectedAnswer: '小巷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'rally', expectedAnswer: '集合', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'alleviate', expectedAnswer: '缓解', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'alienate', expectedAnswer: '使疏远', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'affiliate', expectedAnswer: '隶属于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'allocate', expectedAnswer: '分配', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'formal', expectedAnswer: '形式的/正规的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'formality', expectedAnswer: '例行公事', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'format', expectedAnswer: '格式(化)', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'formative', expectedAnswer: '影响形成的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'former', expectedAnswer: '以前的/前者（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'formula', expectedAnswer: '方案/配方', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'formulate', expectedAnswer: '制定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'trip', expectedAnswer: '旅行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'trap', expectedAnswer: '困住/陷阱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'strap', expectedAnswer: '捆绑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'strip', expectedAnswer: '剥夺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'stripe', expectedAnswer: '条纹', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'spite', expectedAnswer: '怨恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'spit', expectedAnswer: '吐（口水）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'confide', expectedAnswer: '透露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'confidence', expectedAnswer: '信心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'confident', expectedAnswer: '自信的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'confidant', expectedAnswer: '知己', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'tramp', expectedAnswer: '远足/流浪汉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'damp', expectedAnswer: '潮湿的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'dump', expectedAnswer: '倾销/垃圾场', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'jump', expectedAnswer: '跳跃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'bump', expectedAnswer: '撞上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'pump', expectedAnswer: '抽水（机）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'lump', expectedAnswer: '把…混为一谈/肿块', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'bravery', expectedAnswer: '勇敢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'gravity', expectedAnswer: '重力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'brevity', expectedAnswer: '简洁', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'fate', expectedAnswer: '命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'fade', expectedAnswer: '逐渐消失', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'fame', expectedAnswer: '声誉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'feat', expectedAnswer: '功绩', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'feast', expectedAnswer: '盛宴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'fake', expectedAnswer: '假的/赝品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'scare', expectedAnswer: '害怕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'scarce', expectedAnswer: '缺乏的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'score', expectedAnswer: '分数', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'scorn', expectedAnswer: '蔑视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'corn', expectedAnswer: '玉米', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'ore', expectedAnswer: '矿', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'sore', expectedAnswer: '痛处', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'core', expectedAnswer: '核心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'scar', expectedAnswer: '伤痕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'stationary', expectedAnswer: '静止的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'stationery', expectedAnswer: '文具', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'fuse', expectedAnswer: '融合/保险丝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'confuse', expectedAnswer: '迷惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'effuse', expectedAnswer: '流出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'refuse', expectedAnswer: '拒绝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'refute', expectedAnswer: '反驳', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'defuse', expectedAnswer: '使缓和', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'infuse', expectedAnswer: '注入', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'diffuse', expectedAnswer: '传播（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'transfuse', expectedAnswer: '输（血）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'test', expectedAnswer: '测试', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'text', expectedAnswer: '文本', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'taste', expectedAnswer: '喜好/品味', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'task', expectedAnswer: '任务', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'elect', expectedAnswer: '选举', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'erect', expectedAnswer: '建立', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'enact', expectedAnswer: '制定法律/实施', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'cardinal', expectedAnswer: '最重要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'cordial', expectedAnswer: '热情友好的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'expect', expectedAnswer: '期待/预计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'expert', expectedAnswer: '专家（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'export', expectedAnswer: '出口（物）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'except', expectedAnswer: '除…之外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'excerpt', expectedAnswer: '摘录', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'expend', expectedAnswer: '花钱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'expand', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'extend', expectedAnswer: '延长/包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'extent', expectedAnswer: '程度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'expire', expectedAnswer: '过期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'expose', expectedAnswer: '暴露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'week', expectedAnswer: '星期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'weed', expectedAnswer: '杂草', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'weep', expectedAnswer: '流出/哭泣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'sweep', expectedAnswer: '扫过/迅速传播', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'wipe', expectedAnswer: '擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'wife', expectedAnswer: '妻子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'whip', expectedAnswer: '党鞭/鞭子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'ventilate', expectedAnswer: '使通风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'versatile', expectedAnswer: '多才多艺的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'volatile', expectedAnswer: '易发挥的/易变的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'gratitude', expectedAnswer: '感谢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'attitude', expectedAnswer: '态度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'altitude', expectedAnswer: '高度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'latitude', expectedAnswer: '纬度/自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'longitude', expectedAnswer: '经度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'aptitude', expectedAnswer: '天赋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'talent', expectedAnswer: '才能/天才', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'latent', expectedAnswer: '潜伏的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'patent', expectedAnswer: '专利/专利权', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'tenant', expectedAnswer: '租户/佃户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'lantern', expectedAnswer: '灯笼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'lateral', expectedAnswer: '侧面的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'vote', expectedAnswer: '投票', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'veto', expectedAnswer: '否决', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'row', expectedAnswer: '争吵/一排', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'raw', expectedAnswer: '未经加工的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'law', expectedAnswer: '法则', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'paw', expectedAnswer: '爪子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'jaw', expectedAnswer: '下巴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'saw', expectedAnswer: '锯', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'sew', expectedAnswer: '缝制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'sow', expectedAnswer: '播种', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'quota', expectedAnswer: '配额', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'quote', expectedAnswer: '引用', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'quoth', expectedAnswer: '说', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'quotient', expectedAnswer: '商', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'quotidian', expectedAnswer: '每日的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'parade', expectedAnswer: '游行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'paradox', expectedAnswer: '悖论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'paralyse', expectedAnswer: '使瘫痪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'paradise', expectedAnswer: '天堂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'alter', expectedAnswer: '改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'alert', expectedAnswer: '警惕（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'avert', expectedAnswer: '防止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'advert', expectedAnswer: '广告/提及', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'advent', expectedAnswer: '到来', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'overt', expectedAnswer: '公开的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'invert', expectedAnswer: '颠倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'convert', expectedAnswer: '转换/改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'divert', expectedAnswer: '转向/转移', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'principal', expectedAnswer: '主要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'principle', expectedAnswer: '原则', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'ecological', expectedAnswer: '生态的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'physiological', expectedAnswer: '生理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'psychological', expectedAnswer: '心理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'philosophical', expectedAnswer: '哲学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'erupt', expectedAnswer: '爆发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'abrupt', expectedAnswer: '突然的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'disrupt', expectedAnswer: '使干扰', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'corrupt', expectedAnswer: '腐败（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'interrupt', expectedAnswer: '打断', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'bankrupt', expectedAnswer: '破产的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'sentiment', expectedAnswer: '观点/情绪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'sensible', expectedAnswer: '明智的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'sensitive', expectedAnswer: '敏感的/体贴的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'product', expectedAnswer: '产品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'conduct', expectedAnswer: '实施', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'instruct', expectedAnswer: '指示/教授（v）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'obstruct', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'destruct', expectedAnswer: '毁坏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'construct', expectedAnswer: '建造', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'board', expectedAnswer: '董事会/木板', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'aboard', expectedAnswer: '在船上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'broad', expectedAnswer: '宽阔的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'abroad', expectedAnswer: '在国外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'circulation', expectedAnswer: '发行量/流通', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'curriculum', expectedAnswer: '课程', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'circumstance', expectedAnswer: '情况/命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'recent', expectedAnswer: '最近的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'resent', expectedAnswer: '愤恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'consent', expectedAnswer: '同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'context', expectedAnswer: '背景/语境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'contest', expectedAnswer: '比赛/争辩', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'contend', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'content', expectedAnswer: '内容/满意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'operate', expectedAnswer: '经营/运转', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'cooperate', expectedAnswer: '合作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'corporate', expectedAnswer: '公司的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'incorporate', expectedAnswer: '包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'coordinate', expectedAnswer: '使协调', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'protest', expectedAnswer: '抗议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'pretext', expectedAnswer: '借口', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'process', expectedAnswer: '过程/处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'progress', expectedAnswer: '进步/进展', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'congress', expectedAnswer: '国会/代表大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'deform', expectedAnswer: '使畸形', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'perform', expectedAnswer: '表现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'uniform', expectedAnswer: '制服/统一的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'conform', expectedAnswer: '遵守/相一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'inform', expectedAnswer: '通知/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'reform', expectedAnswer: '改革', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'reformation', expectedAnswer: '革新', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'reformer', expectedAnswer: '改革者', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'reformatory', expectedAnswer: '改革的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'confer', expectedAnswer: '授予', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'infer', expectedAnswer: '推断', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'refer', expectedAnswer: '涉及/查阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'defer', expectedAnswer: '推迟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'chase', expectedAnswer: '追逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'phase', expectedAnswer: '阶段', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'phrase', expectedAnswer: '短语/叙述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'purchase', expectedAnswer: '购买', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'assume', expectedAnswer: '假设', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'reassume', expectedAnswer: '重新假定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'resume', expectedAnswer: '继续/简历', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'presume', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'consume', expectedAnswer: '消耗/吃喝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'subsume', expectedAnswer: '包含', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'clash', expectedAnswer: '冲突/分歧', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'crash', expectedAnswer: '撞车/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'crack', expectedAnswer: '破裂/打压', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'crush', expectedAnswer: '压坏/迷恋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'genuine', expectedAnswer: '真正的/真诚的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'genius', expectedAnswer: '天才/天赋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'ingenious', expectedAnswer: '精巧的/巧妙的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'ingenuity', expectedAnswer: '创造力/聪明才智', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'ingenuous', expectedAnswer: '单纯的/天真的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'serve', expectedAnswer: '服务/用于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'reserve', expectedAnswer: '预订/保护区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'observe', expectedAnswer: '观察/评论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'deserve', expectedAnswer: '值得', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'preserve', expectedAnswer: '维护/专属领域', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'conserve', expectedAnswer: '节约/保护', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'congregate', expectedAnswer: '集合/聚集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'segregate', expectedAnswer: '（使）隔离/分开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'convention', expectedAnswer: '习俗/大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'contention', expectedAnswer: '争论/观点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'contract', expectedAnswer: '合同', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'contrast', expectedAnswer: '差异', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'contrary', expectedAnswer: '相反的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'controversy', expectedAnswer: '争论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'mount', expectedAnswer: '发起', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'amount', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'account', expectedAnswer: '账户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'literacy', expectedAnswer: '读写能力/专业能力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'literal', expectedAnswer: '字面上的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'literary', expectedAnswer: '文学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'liberal', expectedAnswer: '开放的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'liberty', expectedAnswer: '自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'property', expectedAnswer: '财产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'poverty', expectedAnswer: '贫穷的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'proper', expectedAnswer: '恰当的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'prosper', expectedAnswer: '繁荣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'prospect', expectedAnswer: '可能性', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'reproach', expectedAnswer: '责备', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'approach', expectedAnswer: '接近', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'approval', expectedAnswer: '赞成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'appear', expectedAnswer: '出现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'inflict', expectedAnswer: '使遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'conflict', expectedAnswer: '冲突', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'delicate', expectedAnswer: '精美的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'dedicate', expectedAnswer: '献身于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'indicate', expectedAnswer: '表明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'distinguish', expectedAnswer: '区分', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'distinguished', expectedAnswer: '卓著的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'extinguish', expectedAnswer: '熄灭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'extinct', expectedAnswer: '已灭绝的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'distinction', expectedAnswer: '差别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'distinct', expectedAnswer: '截然不同的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'instinct', expectedAnswer: '本能', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'attempt', expectedAnswer: '尝试', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'contempt', expectedAnswer: '鄙视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'tempt', expectedAnswer: '引诱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'temptation', expectedAnswer: '诱惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'temple', expectedAnswer: '寺院', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'template', expectedAnswer: '模版', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'contemplate', expectedAnswer: '思考', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'tempo', expectedAnswer: '节奏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'temporal', expectedAnswer: '短暂的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'temporary', expectedAnswer: '暂时的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'hamper', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'cape', expectedAnswer: '披风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'cap', expectedAnswer: '帽子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'cope', expectedAnswer: '处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'cop', expectedAnswer: '警察', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'rap', expectedAnswer: '说唱/敲击', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'rape', expectedAnswer: '强奸/抢夺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'lapse', expectedAnswer: '疏忽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'elapse', expectedAnswer: '流逝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'collapse', expectedAnswer: '倒塌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'precious', expectedAnswer: '珍贵的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'previous', expectedAnswer: '先前的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'precise', expectedAnswer: '精确的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'conceive', expectedAnswer: '想象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'perceive', expectedAnswer: '看待', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'receive', expectedAnswer: '收到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'deceive', expectedAnswer: '欺骗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'sufficient', expectedAnswer: '充足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'efficient', expectedAnswer: '效率高的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'escalate', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'evaluate', expectedAnswer: '评价', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'estimate', expectedAnswer: '估计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'eliminate', expectedAnswer: '消除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'simulate', expectedAnswer: '假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'stimulate', expectedAnswer: '刺激', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'calculate', expectedAnswer: '计算', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'speculate', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'stipulate', expectedAnswer: '规定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'spectrum', expectedAnswer: '光谱/范围', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'spectacle', expectedAnswer: '景象/眼镜', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'spectacular', expectedAnswer: '壮观的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'speculative', expectedAnswer: '猜测的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'repeal', expectedAnswer: '废止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'repel', expectedAnswer: '驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'rebel', expectedAnswer: '反抗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'dispel', expectedAnswer: '驱散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'impel', expectedAnswer: '促使', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'compel', expectedAnswer: '强迫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'propel', expectedAnswer: '推动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'expel', expectedAnswer: '开除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'excel', expectedAnswer: '擅长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'gas', expectedAnswer: '气体', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'gasp', expectedAnswer: '喘气', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'gape', expectedAnswer: '裂开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'grasp', expectedAnswer: '理解', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'grape', expectedAnswer: '葡萄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'gossip', expectedAnswer: '流言', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'inventive', expectedAnswer: '善于创新的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'incentive', expectedAnswer: '激励', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'intensive', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'inclusive', expectedAnswer: '包括的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'assure', expectedAnswer: '（人）保证', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'insure', expectedAnswer: '（钱）给…买保险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'ensure', expectedAnswer: '（事）确保', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'secure', expectedAnswer: '（资源）获得/使安全', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'equality', expectedAnswer: '平等', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'quantity', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'quality', expectedAnswer: '质量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'qualify', expectedAnswer: '使合格', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'vigorous', expectedAnswer: '精力旺盛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'rigorous', expectedAnswer: '严厉的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'humorous', expectedAnswer: '幽默的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'victorious', expectedAnswer: '获胜的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'curious', expectedAnswer: '好奇的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'nervous', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'obvious', expectedAnswer: '明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'dubious', expectedAnswer: '怀疑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'serious', expectedAnswer: '严重的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'district', expectedAnswer: '地区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'distribute', expectedAnswer: '分发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'contribute', expectedAnswer: '捐赠', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'attribute', expectedAnswer: '把...归因于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'substance', expectedAnswer: '物质', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'substitute', expectedAnswer: '代替的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'institute', expectedAnswer: '机构', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'constitute', expectedAnswer: '构成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'dense', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'sense', expectedAnswer: '感觉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'tense', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'tease', expectedAnswer: '戏弄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'inhabit', expectedAnswer: '居住于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'inhibit', expectedAnswer: '抑制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'define', expectedAnswer: '定义', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'confine', expectedAnswer: '限制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'refine', expectedAnswer: '提炼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'ascend', expectedAnswer: '上升', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'descend', expectedAnswer: '下降', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transcend', expectedAnswer: '超出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transition', expectedAnswer: '过渡', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transaction', expectedAnswer: '交易', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transparent', expectedAnswer: '明显的/透明的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transient', expectedAnswer: '短暂的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transmission', expectedAnswer: '传输', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'translate', expectedAnswer: '转变/翻译', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transform', expectedAnswer: '改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transport', expectedAnswer: '运输/交通方式', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'transplant', expectedAnswer: '移植/移居', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'assist', expectedAnswer: '帮助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'persist', expectedAnswer: '坚持', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'resist', expectedAnswer: '抵制', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'consist', expectedAnswer: '由...组成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'roast', expectedAnswer: '烘烤', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'boast', expectedAnswer: '自夸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'boost', expectedAnswer: '增长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'complement', expectedAnswer: '补足', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'compliment', expectedAnswer: '称赞', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'trail', expectedAnswer: '追踪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'trial', expectedAnswer: '试验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'state', expectedAnswer: '国家（的）/状况/说明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'statue', expectedAnswer: '雕塑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'status', expectedAnswer: '地位', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'statute', expectedAnswer: '法令', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'stature', expectedAnswer: '身材', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'saturate', expectedAnswer: '浸透', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'crumple', expectedAnswer: '起皱/瘫倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'crumble', expectedAnswer: '坍塌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'grumble', expectedAnswer: '抱怨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'humble', expectedAnswer: '谦逊的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'bumble', expectedAnswer: '弄糟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'fumble', expectedAnswer: '摸索/笨手笨脚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'jumble', expectedAnswer: '使混乱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'rumble', expectedAnswer: '隆隆作响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'tumble', expectedAnswer: '跌到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'stumble', expectedAnswer: '绊倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'gamble', expectedAnswer: '赌博', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'shamble', expectedAnswer: '蹒跚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'assemble', expectedAnswer: '集合/组装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'resemble', expectedAnswer: '与…相似', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'dissemble', expectedAnswer: '掩饰/假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'ensemble', expectedAnswer: '剧团/套装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'render', expectedAnswer: '（使）成为/表达', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'tender', expectedAnswer: '温柔的/提交', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'wonder', expectedAnswer: '想知道/奇观/惊讶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'gender', expectedAnswer: '性别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'ponder', expectedAnswer: '考虑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'abstract', expectedAnswer: '抽象的/摘要', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'subject', expectedAnswer: '主题/（使）遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'object', expectedAnswer: '物体/反对/对象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'inject', expectedAnswer: '注射/增添', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'project', expectedAnswer: '项目/计划/投射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'eject', expectedAnswer: '驱逐/喷出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'polish', expectedAnswer: '擦亮/修改', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'astonish', expectedAnswer: '（使）惊讶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'abolish', expectedAnswer: '废除/取消', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'foolish', expectedAnswer: '愚蠢的/尴尬的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'consensus', expectedAnswer: '共识', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'census', expectedAnswer: '官方统计/人口普查', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'versus', expectedAnswer: '以...为对手', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'aid', expectedAnswer: '援助/帮助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'lid', expectedAnswer: '盖子/眼皮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'bid', expectedAnswer: '出价/努力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'hid(hide)', expectedAnswer: '躲藏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'rid', expectedAnswer: '摆脱/除去', userAnswer: '', isCorrect: null },














    ];

    let words = [];

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
        return defaultWords.map(word => ({
            ...word,
            errorCount: 0 // 初始化错误次数为 0
        }));
    }

    function isValidStoredWords(data) {
        return Array.isArray(data) && data.every(word =>
            word &&
            typeof word.word === 'string' &&
            typeof word.expectedAnswer === 'string' &&
            Object.prototype.hasOwnProperty.call(word, 'userAnswer') &&
            Object.prototype.hasOwnProperty.call(word, 'isCorrect') &&
            Object.prototype.hasOwnProperty.call(word, 'errorCount')
        );
    }

    let storageUnavailableNotified = false;

    function warnStorageUnavailable(error) {
        if (!storageUnavailableNotified) {
            console.warn('本地缓存不可用，当前将使用临时内存模式。关闭页面后数据不会保留。', error);
            storageUnavailableNotified = true;
        }
    }

    // 从 LocalStorage 加载数据
    function loadData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                words = createDefaultWords();
                saveData();
                return;
            }

            const parsedData = JSON.parse(data);
            if (isValidStoredWords(parsedData)) {
                words = parsedData;
            } else {
                words = createDefaultWords();
                saveData();
            }
        } catch (error) {
            const isStorageAccessError =
                error && (
                    error.name === 'SecurityError' ||
                    error.name === 'QuotaExceededError'
                );

            if (isStorageAccessError) {
                warnStorageUnavailable(error);
            } else {
                console.warn('本地缓存数据损坏，已自动恢复默认词库。', error);
            }

            words = createDefaultWords();
            saveData();
        }
    }

    // 保存数据到 LocalStorage
    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    // 渲染表格内容
    function renderTable() {
        wordTbody.innerHTML = '';
        let lastGroup = null;

        words.forEach((wordObj, index) => {
            // 如果存在 group 属性且与上一个不同，则准备插入新的模组分隔行
            if (wordObj.group !== undefined && wordObj.group !== lastGroup) {
                const currentGroupTr = document.createElement('tr');
                currentGroupTr.className = 'group-separator';
                currentGroupTr.id = `module-${wordObj.group}`;

                const separatorTd = document.createElement('td');
                separatorTd.colSpan = 3; // 更新跨列数以匹配剩余的三列

                const groupLabel = document.createElement('div');
                groupLabel.className = 'group-label';
                groupLabel.textContent = `▶ 模组: ${wordObj.group}`;
                separatorTd.appendChild(groupLabel);

                currentGroupTr.appendChild(separatorTd);
                wordTbody.appendChild(currentGroupTr);

                lastGroup = wordObj.group;
            }

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
        tdWord.className = 'word-cell';

        const wordText = document.createElement('span');
        wordText.textContent = wordObj.word;
        tdWord.appendChild(wordText);

        // 如果提交过且错误次数大于 0，则显示小红点角标
        if (wordObj.isCorrect !== null && wordObj.errorCount > 0) {
            const errorBadge = document.createElement('sup');
            errorBadge.className = 'error-badge';
            errorBadge.textContent = wordObj.errorCount;
            tdWord.appendChild(errorBadge);
        }

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

        // 【中文释义】列（默认隐藏意思内容，提交后显示）
        const tdMeaning = document.createElement('td');
        tdMeaning.className = 'meaning-col';
        tdMeaning.style.color = '#0056b3'; // 深蓝色，对比度更高，更清晰
        tdMeaning.style.fontSize = '16px'; // 字号加大一码
        tdMeaning.style.fontWeight = 'bold'; // 进一步加粗，提升可读性

        // 只有提交过检测才显示中文释义，并且让答案区域变成展示态
        if (wordObj.isCorrect !== null) {
            tdMeaning.textContent = wordObj.expectedAnswer;
            inputAnswer.readOnly = true;
            inputAnswer.tabIndex = -1;
            inputAnswer.setAttribute('aria-readonly', 'true');
            inputAnswer.placeholder = '';
        } else {
            tdMeaning.textContent = '';
            inputAnswer.readOnly = false;
            inputAnswer.removeAttribute('tabindex');
            inputAnswer.removeAttribute('aria-readonly');
            inputAnswer.placeholder = '输入中文释义...';
        }

        tr.appendChild(tdMeaning);

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

    // 处理用户输入，只保存不验证
    function handleAnswerInput(index, value, tr) {
        const wordObj = words[index];
        wordObj.userAnswer = value;
        wordObj.isCorrect = null; // 重置状态

        saveData(); // 实时保存用户的答题记录，但不判断正误

        updateRowAppearance(tr, wordObj);

        // 隐藏释义内容
        const tdMeaning = tr.querySelector('.meaning-col');
        if (tdMeaning) {
            tdMeaning.textContent = '';
        }
    }

    // 统一清洗字符串，但保留括号内的正文字符，只去掉括号和标点
    function normalizeAnswerString(str) {
        if (!str) return '';
        return str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    }

    // 将“传播（的）”展开为“传播”和“传播的”这类可接受答案
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

    function getPossibleAnswers(expectedAnswer) {
        return [...new Set(
            expectedAnswer
                .split('/')
                .flatMap(ans => expandOptionalAnswerVariants(ans))
                .filter(Boolean)
        )];
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
                const cleanedUserAns = normalizeAnswerString(userAns);

                // 展开括号可选内容后的所有合法答案
                const possibleAnswers = getPossibleAnswers(wordObj.expectedAnswer);

                // 只要清洗后的用户输入匹配任何一个清洗后的正确答案即为正确
                wordObj.isCorrect = possibleAnswers.some(ans => ans === cleanedUserAns);
            }

            if (wordObj.isCorrect) {
                correctCount++;
            } else {
                wordObj.errorCount = (wordObj.errorCount || 0) + 1; // 答错则错误次数加1
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
                // 注意：不重置 errorCount，保留历史错误次数
            });
            saveData();
            renderTable();
            testSummary.style.display = 'none';
            setFloatingNavVisible(false);
        }
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
