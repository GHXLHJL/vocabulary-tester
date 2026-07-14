document.addEventListener('DOMContentLoaded', () => {
    const wordTbody = document.getElementById('word-tbody');
    const submitTestBtn = document.getElementById('submit-test-btn');
    const resetTestBtn = document.getElementById('reset-test-btn');
    const exitTestBtn = document.getElementById('exit-test-btn');
    const testSummary = document.getElementById('test-summary');
    const summaryTotal = document.getElementById('summary-total');
    const summaryCorrect = document.getElementById('summary-correct');
    const summaryIncorrect = document.getElementById('summary-incorrect');
    const summaryAccuracy = document.getElementById('summary-accuracy');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // 仪表盘 DOM
    const dashboard = document.getElementById('dashboard');
    const mainPoolCount = document.getElementById('main-pool-count');
    const aPoolCount = document.getElementById('a-pool-count');
    const dailyStatus = document.getElementById('daily-status');
    const weeklyStatus = document.getElementById('weekly-status');
    const monthlyStatus = document.getElementById('monthly-status');
    const startDailyBtn = document.getElementById('start-daily-btn');
    const startWeeklyBtn = document.getElementById('start-weekly-btn');
    const startMonthlyBtn = document.getElementById('start-monthly-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const syncMaimemoBtn = document.getElementById('sync-maimemo-btn');
    const testerHeader = document.querySelector('.tester-header');
    const wordTable = document.getElementById('word-table');

    // 设置面板 DOM
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const maimemoTokenInput = document.getElementById('maimemo-token');
    const userNicknameInput = document.getElementById('user-nickname');
    const saveTokenBtn = document.getElementById('save-token-btn');
    const syncWeaknessToggle = document.getElementById('sync-weakness-toggle');

    // 悬浮错题导航相关 DOM
    const floatingNavContainer = document.getElementById('floating-nav-container');
    const floatingNavToggle = document.getElementById('floating-nav-toggle');
    const floatingNavBadge = document.getElementById('floating-nav-badge');
    const floatingNavPanel = document.getElementById('floating-nav-panel');
    const floatingNavList = document.getElementById('floating-nav-list');
    const floatingNavOverlay = document.getElementById('floating-nav-overlay');

    // 排行榜 DOM
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const leaderboardTbody = document.getElementById('leaderboard-tbody');
    const testActionConfirmModal = document.getElementById('test-action-confirm-modal');
    const testActionConfirmTitle = document.getElementById('test-action-confirm-title');
    const testActionConfirmMessage = document.getElementById('test-action-confirm-message');
    const testActionCancelBtn = document.getElementById('test-action-cancel-btn');
    const testActionConfirmBtn = document.getElementById('test-action-confirm-btn');

    // Supabase 配置
    const SUPABASE_URL = 'https://iebdkqswcyuyqsusmocn.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_5JmvfLkKx-Nmv9Dts9OvDw_2kOXu5qn';
    let supabase = null;

    function initSupabase() {
        try {
            if (window.supabase) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log('Supabase 客户端初始化成功');
                return true;
            } else {
                console.error('Supabase SDK 未能加载');
                return false;
            }
        } catch (e) {
            console.error('Supabase 初始化失败:', e);
            return false;
        }
    }

    initSupabase();

    const APP_VERSION = 'v26.7.16';
    const STORAGE_KEY = 'vocabulary_tester_data_v26.7.9'; // 保持存储键稳定，避免版本号变更导致本地数据丢失
    const MAIMEMO_RESPONSE_WEIGHTS = {
        FORGET: 3,
        VAGUE: 2,
        CANCEL_WELL_FAMILIAR: 2,
        FAMILIAR: 0,
        WELL_FAMILIAR: -1
    };

    // 优化方案参数配置
    const SETTINGS = {
        dailyDrawCount: 30,      // 每日抽取词组数
        minIntervalDays: 2,      // 抽题最小间隔
        graduationThreshold: 0.8, // 毕业正确率阈值 (最近3次平均)
        minSingleRate: 0.6,      // 毕业最低单次线
        weeklyReviewRatio: 0.2,   // 周复盘抽取比例
        weeklyDegradation: 0.7,   // 周复盘退化线
        monthlyDegradation: 0.6,  // 月度总测退化线
        awakenDays: 30,          // A池强制唤醒周期
        stuckDays: 7             // 防卡死天数
    };

    let wordGroups = []; // 核心数据：词组池
    let systemState = {
        lastDailyTestDate: null,
        lastWeeklyReviewDate: null,
        lastMonthlyTestDate: null,
        userId: null,
        nickname: '考研战士'
    };
    let maimemoConfig = {
        token: '',
        syncWeakness: true
    };
    let maimemoWordStatusMap = {}; // 缓存墨墨单词状态：{ word: last_response }
    let currentTestMode = null; // null | 'daily' | 'weekly' | 'monthly'
    let currentTestGroups = []; // 当前正在测试的词组引用
    let currentTestSnapshot = null; // 进入测试前的快照，用于退出时回滚

    let confirmActionResolver = null;

    const appVersionDisplay = document.getElementById('app-version-display');

    // 在左上角显示当前版本号
    if (appVersionDisplay) {
        appVersionDisplay.textContent = APP_VERSION;
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

    function createDefaultWordGroups() {
        const groups = {};
        defaultWords.forEach(word => {
            const gid = word.group || 999;
            if (!groups[gid]) {
                groups[gid] = {
                    groupId: gid,
                    words: [],
                    pool: 'main',
                    correctRatesHistory: [],
                    tier: 'new',
                    lastTestDate: null,
                    enteredAPoolDate: null,
                    consecutiveQualified: 0
                };
            }
            groups[gid].words.push({
                id: word.id || generateId(),
                word: word.word,
                expectedAnswer: word.expectedAnswer,
                userAnswer: '',
                isCorrect: null,
                errorCount: 0
            });
        });
        return Object.values(groups);
    }

    // 从旧格式迁移数据
    function migrateFromV2(oldWords) {
        const groups = {};
        oldWords.forEach(word => {
            const gid = word.group || 999;
            if (!groups[gid]) {
                groups[gid] = {
                    groupId: gid,
                    words: [],
                    pool: 'main',
                    correctRatesHistory: [],
                    tier: 'new',
                    lastTestDate: null,
                    enteredAPoolDate: null,
                    consecutiveQualified: 0
                };
            }
            groups[gid].words.push({
                id: word.id || generateId(),
                word: word.word,
                expectedAnswer: word.expectedAnswer,
                userAnswer: word.userAnswer || '',
                isCorrect: word.isCorrect,
                errorCount: word.errorCount || 0
            });
        });
        return Object.values(groups);
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
            // 尝试加载新格式 v3.0
            const v3Data = localStorage.getItem(STORAGE_KEY);
            if (v3Data) {
                const parsed = JSON.parse(v3Data);
                wordGroups = parsed.wordGroups || [];
                systemState = parsed.systemState || systemState;
                maimemoConfig = parsed.maimemoConfig || maimemoConfig;
                maimemoWordStatusMap = parsed.maimemoWordStatusMap || {};

                // 核心改进：即使有缓存，也要检查代码中的词库是否有更新
                syncWithCodeSource();

                // 同步设置界面
                maimemoTokenInput.value = maimemoConfig.token || '';
                userNicknameInput.value = systemState.nickname || '考研战士';
                syncWeaknessToggle.checked = !!maimemoConfig.syncWeakness;

                updateDashboardUI();
                return;
            }

            // 尝试从旧版本 v26.4.35 迁移
            const oldKey = 'vocabulary_tester_data_v26.4.35';
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                try {
                    const parsedOld = JSON.parse(oldData);
                    wordGroups = migrateFromV2(parsedOld);
                    saveData();
                    updateDashboardUI();
                    return;
                } catch (e) {
                    console.error('迁移旧数据失败', e);
                }
            }

            // 无数据则初始化
            wordGroups = createDefaultWordGroups();
            saveData();
            updateDashboardUI();
        } catch (error) {
            warnStorageUnavailable(error);
            wordGroups = createDefaultWordGroups();
            updateDashboardUI();
        }
    }

    // 保存数据到 LocalStorage
    function saveData() {
        try {
            const dataToSave = {
                wordGroups: wordGroups,
                systemState: systemState,
                maimemoConfig: maimemoConfig,
                maimemoWordStatusMap: maimemoWordStatusMap,
                version: '3.0'
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    // 更新仪表盘显示
    function updateDashboardUI() {
        const mainPool = wordGroups.filter(g => g.pool === 'main');
        const aPool = wordGroups.filter(g => g.pool === 'a');

        mainPoolCount.textContent = mainPool.length;
        aPoolCount.textContent = aPool.length;

        const today = new Date().toLocaleDateString();

        dailyStatus.textContent = systemState.lastDailyTestDate === today ? '已完成' : '未开始';
        dailyStatus.style.color = systemState.lastDailyTestDate === today ? '#28a745' : '#666';

        // 每周/月逻辑简化显示
        weeklyStatus.textContent = systemState.lastWeeklyReviewDate ? `上次:${systemState.lastWeeklyReviewDate}` : '待进行';
        monthlyStatus.textContent = systemState.lastMonthlyTestDate ? `上次:${systemState.lastMonthlyTestDate}` : '待进行';
    }

    function getMaimemoStatusWeight(status) {
        return MAIMEMO_RESPONSE_WEIGHTS[status] ?? 0;
    }

    function getGroupMaimemoBoost(group) {
        return group.words.reduce((maxBoost, wordObj) => {
            const status = maimemoWordStatusMap[wordObj.word.toLowerCase()];
            return Math.max(maxBoost, getMaimemoStatusWeight(status));
        }, 0);
    }

    // 渲染表格内容
    function renderTable() {
        wordTbody.innerHTML = '';

        // currentTestGroups 存储当前试卷中选中的词组
        currentTestGroups.forEach((groupObj) => {
            // 插入模组分隔行
            const separatorTr = document.createElement('tr');
            separatorTr.className = 'group-separator';
            separatorTr.id = `module-${groupObj.groupId}`;
            const separatorTd = document.createElement('td');
            separatorTd.colSpan = 3;
            const groupLabel = document.createElement('div');
            groupLabel.className = 'group-label';
            groupLabel.textContent = `▶ 模组: ${groupObj.groupId} (${groupObj.pool === 'a' ? 'A池' : '总池'})`;
            separatorTd.appendChild(groupLabel);
            separatorTr.appendChild(separatorTd);
            wordTbody.appendChild(separatorTr);

            // 插入该组内的所有单词行
            groupObj.words.forEach((wordObj, wordIdx) => {
                const tr = createRow(wordObj, groupObj, wordIdx);
                wordTbody.appendChild(tr);
            });
        });

        if (currentTestGroups.length > 0) {
            testerHeader.style.display = 'flex';
            wordTable.style.display = 'table';
        } else {
            testerHeader.style.display = 'none';
            wordTable.style.display = 'none';
        }
    }

    // 创建单行表格内容
    function createRow(wordObj, groupObj, wordIdx) {
        const tr = document.createElement('tr');
        updateRowAppearance(tr, wordObj);

        // 【英文单词】列
        const tdWord = document.createElement('td');
        tdWord.className = 'word-cell';
        const wordText = document.createElement('span');
        wordText.textContent = wordObj.word;
        tdWord.appendChild(wordText);

        // 如果提交过且错误次数大于 0，则显示角标
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

        // 提交后移除 placeholder
        if (wordObj.isCorrect !== null) {
            inputAnswer.placeholder = '';
            inputAnswer.readOnly = true;
            inputAnswer.tabIndex = -1;
        } else {
            inputAnswer.placeholder = '输入中文释义...';
            inputAnswer.readOnly = false;
        }

        inputAnswer.addEventListener('input', (e) => {
            wordObj.userAnswer = e.target.value;
            wordObj.isCorrect = null;
            saveData();
            updateRowAppearance(tr, wordObj);
            const tdMeaning = tr.querySelector('.meaning-col');
            if (tdMeaning) tdMeaning.textContent = '';
        });

        tdAnswer.appendChild(inputAnswer);
        tr.appendChild(tdAnswer);

        // 【中文释义】列
        const tdMeaning = document.createElement('td');
        tdMeaning.className = 'meaning-col';

        if (wordObj.isCorrect !== null) {
            tdMeaning.textContent = wordObj.expectedAnswer;
        } else {
            tdMeaning.textContent = '';
        }
        tr.appendChild(tdMeaning);

        return tr;
    }

    // ==== 核心抽题算法 ====
    function generateDailyTest() {
        const today = new Date();
        const availableGroups = wordGroups.filter(g => {
            if (g.pool !== 'main') return false;
            if (!g.lastTestDate) return true;

            const lastDate = new Date(g.lastTestDate);
            const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);

            // 满足最小间隔约束，或者连续 7 天未被抽到强制进入
            return diffDays >= SETTINGS.minIntervalDays || diffDays >= SETTINGS.stuckDays;
        });

        if (availableGroups.length === 0) {
            alert('总池中没有满足间隔要求的词组，请休息一下或尝试其他模式！');
            return [];
        }

        // 加权抽取
        const weightedPool = [];
        availableGroups.forEach(g => {
            let weight = 1;

            // 基础权重判定
            if (g.tier === 'weak' || g.tier === 'new') weight = 3;
            else if (g.tier === 'fuzzy') weight = 1;

            // 墨墨 API 增强权重：根据最近反馈状态动态调整
            if (maimemoConfig.syncWeakness && maimemoConfig.token) {
                const maimemoBoost = getGroupMaimemoBoost(g);
                weight = Math.max(1, weight + maimemoBoost);
            }

            for (let i = 0; i < weight; i++) {
                weightedPool.push(g);
            }
        });

        // 随机抽取 30 组
        const selected = [];
        const count = Math.min(SETTINGS.dailyDrawCount, availableGroups.length);
        const usedIndices = new Set();

        while (selected.length < count && usedIndices.size < weightedPool.length) {
            const idx = Math.floor(Math.random() * weightedPool.length);
            const group = weightedPool[idx];

            // 确保不重复抽取同一个 group
            if (!selected.includes(group)) {
                selected.push(group);
            }
            usedIndices.add(idx);
        }

        return selected;
    }

    function generateWeeklyReview() {
        const aPool = wordGroups.filter(g => g.pool === 'a');
        if (aPool.length === 0) {
            alert('A池（熟练池）目前为空，请先完成每日轻测以积累熟练词！');
            return [];
        }

        const count = Math.max(5, Math.floor(aPool.length * SETTINGS.weeklyReviewRatio));
        const selected = [];
        const tempPool = [...aPool];

        for (let i = 0; i < Math.min(count, aPool.length); i++) {
            const idx = Math.floor(Math.random() * tempPool.length);
            selected.push(tempPool.splice(idx, 1)[0]);
        }
        return selected;
    }

    function generateMonthlyTest() {
        // 强制唤醒：A池全体回炉到总池
        wordGroups.forEach(g => {
            if (g.pool === 'a') {
                const enteredDate = new Date(g.enteredAPoolDate);
                const today = new Date();
                const diffDays = (today - enteredDate) / (1000 * 60 * 60 * 24);

                // 如果在 A 池待够了 30 天，或者进行月度总测，全部参与
                g.pool = 'main';
                g.tier = 'fuzzy'; // 回炉后标记为模糊档
            }
        });

        saveData();
        updateDashboardUI();

        // 月度总测抽取 50%-70% 的总池
        const mainPool = wordGroups.filter(g => g.pool === 'main');
        const count = Math.floor(mainPool.length * 0.6); // 取 60%
        const selected = [];
        const tempPool = [...mainPool];

        for (let i = 0; i < Math.min(count, mainPool.length); i++) {
            const idx = Math.floor(Math.random() * tempPool.length);
            selected.push(tempPool.splice(idx, 1)[0]);
        }
        return selected;
    }

    // 绑定仪表盘按钮事件
    startDailyBtn.addEventListener('click', () => {
        if (confirm('开始今日轻测？将从总池中加权抽取 30 组词。')) {
            currentTestSnapshot = createCurrentTestSnapshot();
            currentTestGroups = generateDailyTest();
            currentTestMode = 'daily';
            if (currentTestGroups.length > 0) {
                resetCurrentTestAnswers();
                updateTestActionPlacement(false);
                renderTable();
                dashboard.style.display = 'none';
            }
        }
    });

    startWeeklyBtn.addEventListener('click', () => {
        if (confirm('开始每周复盘？将从 A 池中随机抽取 20% 词组检测是否退化。')) {
            currentTestSnapshot = createCurrentTestSnapshot();
            currentTestGroups = generateWeeklyReview();
            currentTestMode = 'weekly';
            if (currentTestGroups.length > 0) {
                resetCurrentTestAnswers();
                updateTestActionPlacement(false);
                renderTable();
                dashboard.style.display = 'none';
            }
        }
    });

    startMonthlyBtn.addEventListener('click', async () => {
        const confirmed = await openTestActionConfirm('月度总测', '确定开始月度总测吗？A 池会回炉唤醒，并从总池抽取约 60% 词组进行筛查。');
        if (confirmed) {
            currentTestSnapshot = createCurrentTestSnapshot();
            currentTestGroups = generateMonthlyTest();
            currentTestMode = 'monthly';
            if (currentTestGroups.length > 0) {
                resetCurrentTestAnswers();
                updateTestActionPlacement(false);
                renderTable();
                dashboard.style.display = 'none';
            }
        }
    });

    function resetCurrentTestAnswers() {
        currentTestGroups.forEach(g => {
            g.words.forEach(w => {
                w.userAnswer = '';
                w.isCorrect = null;
            });
        });
    }

    function createCurrentTestSnapshot() {
        return {
            wordGroups: JSON.parse(JSON.stringify(wordGroups)),
            systemState: JSON.parse(JSON.stringify(systemState))
        };
    }

    function leaveCurrentTest(shouldRestoreSnapshot) {
        if (shouldRestoreSnapshot && currentTestSnapshot) {
            wordGroups = JSON.parse(JSON.stringify(currentTestSnapshot.wordGroups));
            systemState = JSON.parse(JSON.stringify(currentTestSnapshot.systemState));
            saveData();
        }

        currentTestSnapshot = null;
        currentTestGroups = [];
        currentTestMode = null;
        testSummary.style.display = 'none';
        updateTestActionPlacement(false);
        setFloatingNavVisible(false);
        setFloatingNavOpen(false);
        dashboard.style.display = 'block';
        updateDashboardUI();
        renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateTestActionPlacement(placeAfterSummary) {
        const testerParent = testerHeader.parentNode;
        if (!testerParent) return;

        if (placeAfterSummary) {
            testSummary.insertAdjacentElement('afterend', testerHeader);
            testerHeader.classList.add('after-summary');
        } else {
            testerParent.insertBefore(testerHeader, testSummary);
            testerHeader.classList.remove('after-summary');
        }
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

    // 统一清洗字符串，但保留括号内的正文字符，只去掉括号和标点
    function openTestActionConfirm(title, message) {
        testActionConfirmTitle.textContent = title;
        testActionConfirmMessage.textContent = message;
        testActionConfirmModal.classList.add('open');

        return new Promise((resolve) => {
            confirmActionResolver = resolve;
        });
    }

    function closeTestActionConfirm(result) {
        testActionConfirmModal.classList.remove('open');
        if (confirmActionResolver) {
            confirmActionResolver(result);
            confirmActionResolver = null;
        }
    }

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

    function getPossibleAnswers(wordObj) {
        return [...new Set(
            wordObj.expectedAnswer
                .split('/')
                .flatMap(ans => expandOptionalAnswerVariants(ans))
                .filter(Boolean)
        )];
    }

    // 提交检测所有单词
    submitTestBtn.addEventListener('click', () => {
        let globalCorrectCount = 0;
        let globalTotalCount = 0;
        const errorGroups = new Set();
        const today = new Date().toLocaleDateString();

        currentTestGroups.forEach(groupObj => {
            let groupCorrectCount = 0;
            const groupTotalCount = groupObj.words.length;

            groupObj.words.forEach(wordObj => {
                globalTotalCount++;
                const userAns = wordObj.userAnswer || '';

                if (userAns.trim() === '') {
                    wordObj.isCorrect = false;
                } else {
                    const cleanedUserAns = normalizeAnswerString(userAns);
                    const possibleAnswers = getPossibleAnswers(wordObj);
                    wordObj.isCorrect = possibleAnswers.some(ans => ans === cleanedUserAns);
                }

                if (wordObj.isCorrect) {
                    groupCorrectCount++;
                    globalCorrectCount++;
                } else {
                    wordObj.errorCount = (wordObj.errorCount || 0) + 1;
                    errorGroups.add(groupObj.groupId);
                }
            });

            // 更新词组层面的历史记录和状态
            const currentRate = groupCorrectCount / groupTotalCount;
            groupObj.correctRatesHistory.unshift(currentRate);
            if (groupObj.correctRatesHistory.length > 10) groupObj.correctRatesHistory.pop();

            groupObj.lastTestDate = new Date().toISOString();

            // 毕业/退化判定逻辑
            if (currentTestMode === 'daily') {
                const recentRates = groupObj.correctRatesHistory.slice(0, 3);
                const avgRate = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;

                if (avgRate >= SETTINGS.graduationThreshold && currentRate >= SETTINGS.minSingleRate) {
                    groupObj.pool = 'a';
                    groupObj.enteredAPoolDate = new Date().toISOString();
                } else {
                    if (avgRate < 0.5) groupObj.tier = 'weak';
                    else if (avgRate <= 0.84) groupObj.tier = 'fuzzy';
                }
            } else if (currentTestMode === 'weekly') {
                if (currentRate < SETTINGS.weeklyDegradation) {
                    groupObj.pool = 'main';
                    groupObj.tier = 'fuzzy';
                    groupObj.enteredAPoolDate = null;
                }
            } else if (currentTestMode === 'monthly') {
                if (currentRate < SETTINGS.monthlyDegradation) {
                    groupObj.pool = 'main';
                    groupObj.tier = 'weak';
                    groupObj.enteredAPoolDate = null;
                } else if (currentRate >= SETTINGS.graduationThreshold) {
                    groupObj.pool = 'a';
                    groupObj.enteredAPoolDate = new Date().toISOString();
                }
            }
        });

        if (currentTestMode === 'daily') systemState.lastDailyTestDate = today;
        else if (currentTestMode === 'weekly') systemState.lastWeeklyReviewDate = today;
        else if (currentTestMode === 'monthly') systemState.lastMonthlyTestDate = today;

        saveData();
        currentTestSnapshot = null;
        renderTable();
        updateDashboardUI();
        // 提交后仍停留在当前独立测试页，只有退出检测时才回主页面
        dashboard.style.display = 'none';

        if (globalTotalCount > 0) {
            const incorrectCount = globalTotalCount - globalCorrectCount;
            const accuracy = ((globalCorrectCount / globalTotalCount) * 100).toFixed(1);

            summaryTotal.textContent = globalTotalCount;
            summaryCorrect.textContent = globalCorrectCount;
            summaryIncorrect.textContent = incorrectCount;
            summaryAccuracy.textContent = accuracy + '%';

            if (errorGroups.size > 0) {
                setFloatingNavVisible(true);
                floatingNavBadge.textContent = errorGroups.size;
                floatingNavList.innerHTML = '';
                Array.from(errorGroups).sort((a, b) => a - b).forEach(gid => {
                    const link = document.createElement('a');
                    link.href = `#module-${gid}`;
                    link.className = 'error-module-link';
                    link.textContent = `模组 ${gid}`;
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetModule = document.getElementById(`module-${gid}`);
                        if (targetModule) {
                            window.scrollTo({ top: targetModule.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
                            targetModule.style.backgroundColor = '#fff3cd';
                            setTimeout(() => { targetModule.style.backgroundColor = ''; }, 1000);
                            setFloatingNavOpen(false);
                        }
                    });
                    floatingNavList.appendChild(link);
                });
            } else {
                setFloatingNavVisible(false);
            }
            testSummary.style.display = 'block';
            updateTestActionPlacement(true);
            testSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // 上报成绩至 Supabase 排行榜
            uploadScoreToSupabase(globalTotalCount, globalCorrectCount, accuracy, currentTestMode);
        }
    });

    // 清空重填事件绑定
    testActionCancelBtn.addEventListener('click', () => {
        closeTestActionConfirm(false);
    });

    testActionConfirmBtn.addEventListener('click', () => {
        closeTestActionConfirm(true);
    });

    resetTestBtn.addEventListener('click', async () => {
        const confirmed = await openTestActionConfirm('重新测试', '确定要清空当前页面答案并重新开始吗？');
        if (confirmed) {
            currentTestGroups.forEach(groupObj => {
                groupObj.words.forEach(wordObj => {
                    wordObj.userAnswer = '';
                    wordObj.isCorrect = null;
                });
            });
            saveData();
            renderTable();
            testSummary.style.display = 'none';
            updateTestActionPlacement(false);
            setFloatingNavVisible(false);
        }
    });

    exitTestBtn.addEventListener('click', async () => {
        const hasSubmittedCurrentTest = !currentTestSnapshot;
        const exitMessage = hasSubmittedCurrentTest
            ? '确定要退出检测吗？本次测试结果已保存，退出后将返回主页面。'
            : '确定要退出检测吗？当前这一页的作答不会保留，并返回主页面。';
        const confirmed = await openTestActionConfirm('退出检测', exitMessage);
        if (confirmed) {
            leaveCurrentTest(!hasSubmittedCurrentTest);
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

    // ==== 设置面板逻辑 ====
    settingsToggleBtn.addEventListener('click', () => {
        settingsModal.classList.add('open');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('open');
    });

    // 点击遮罩层关闭
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('open');
        }
    });

    saveTokenBtn.addEventListener('click', () => {
        const token = maimemoTokenInput.value.trim();
        const nickname = userNicknameInput.value.trim();

        maimemoConfig.token = token;
        maimemoConfig.syncWeakness = syncWeaknessToggle.checked;

        if (nickname) {
            systemState.nickname = nickname;
        }

        saveData();

        if (token) {
            alert('设置已保存！已启用墨墨 API 增强模式。');
        } else {
            alert('设置已保存！');
        }

        settingsModal.classList.remove('open');
    });

    // ==== 数据备份与恢复 ====
    exportDataBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify({
            wordGroups: wordGroups,
            systemState: systemState,
            maimemoConfig: maimemoConfig,
            maimemoWordStatusMap: maimemoWordStatusMap,
            version: '3.6',
            exportDate: new Date().toISOString()
        }, null, 2);

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocabulary_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importDataBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (!imported.wordGroups) throw new Error('无效的备份文件');

                    // 执行智能合并与重置逻辑
                    mergeAndResetData(
                        imported.wordGroups,
                        imported.systemState,
                        imported.maimemoConfig,
                        imported.maimemoWordStatusMap
                    );

                    alert('数据恢复成功！已根据新词插入逻辑自动调整进度。');
                    location.reload();
                } catch (err) {
                    alert('恢复失败：' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    function mergeAndResetData(newGroups, newState, newConfig, newWordStatusMap) {
        // 如果是完全替换模式
        if (confirm('是否完全替换当前数据？(选择“取消”将尝试合并新词组并保留旧进度)')) {
            wordGroups = newGroups;
            systemState = newState || systemState;
            maimemoConfig = newConfig || maimemoConfig;
            maimemoWordStatusMap = newWordStatusMap || {};
            saveData();
            return;
        }

        // 合并模式：检测变动
        newGroups.forEach(newG => {
            const existingG = wordGroups.find(g => g.groupId === newG.groupId);
            if (!existingG) {
                // 全新词组
                newG.pool = 'main';
                newG.tier = 'new';
                newG.correctRatesHistory = [];
                newG.consecutiveQualified = 0;
                wordGroups.push(newG);
            } else {
                // 检查词数变动
                const isModified = newG.words.length !== existingG.words.length ||
                    newG.words.some(nw => !existingG.words.find(ew => ew.word === nw.word));

                if (isModified) {
                    // 插入或变动逻辑：打回总池，重置进度
                    existingG.words = newG.words;
                    existingG.pool = 'main';
                    existingG.tier = 'new';
                    existingG.correctRatesHistory = [];
                    existingG.consecutiveQualified = 0;
                    existingG.lastTestDate = null;
                    existingG.enteredAPoolDate = null;
                }
            }
        });

        if (newWordStatusMap && typeof newWordStatusMap === 'object') {
            maimemoWordStatusMap = { ...maimemoWordStatusMap, ...newWordStatusMap };
        }

        saveData();
    }

    // 核心改进：同步代码中的 defaultWords 到当前状态
    function syncWithCodeSource() {
        const sourceGroups = createDefaultWordGroups();
        let modified = false;

        sourceGroups.forEach(srcG => {
            const targetG = wordGroups.find(g => g.groupId === srcG.groupId);
            if (!targetG) {
                // 发现全新词组
                wordGroups.push(srcG);
                modified = true;
            } else {
                // 检查词组内容是否有变动
                const isWordsChanged = srcG.words.length !== targetG.words.length ||
                    srcG.words.some(sw => !targetG.words.find(tw => tw.word === sw.word));

                if (isWordsChanged) {
                    // 执行 Phase 2 逻辑：打回总池并重置
                    targetG.words = srcG.words;
                    targetG.pool = 'main';
                    targetG.tier = 'new';
                    targetG.correctRatesHistory = [];
                    targetG.consecutiveQualified = 0;
                    targetG.lastTestDate = null;
                    targetG.enteredAPoolDate = null;
                    modified = true;
                }
            }
        });

        if (modified) {
            saveData();
            console.log('检测到代码词库变动，已自动同步并重置相关进度。');
        }
    }

    // ==== 墨墨 API 同步逻辑 (Supabase 代理版) ====
    async function fetchWithProxy(targetUrl, token, options = {}) {
        const {
            method = 'GET',
            headers = {},
            body = null
        } = options;

        // 如果 Supabase 已连接，优先使用 Supabase Edge Function 代理
        if (supabase) {
            const proxyFuncUrl = `${SUPABASE_URL}/functions/v1/maimemo-proxy`;
            try {
                const response = await fetch(proxyFuncUrl, {
                    method: 'POST',
                    headers: {
                        'x-maimemo-token': token,
                        'apikey': SUPABASE_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: targetUrl, method, headers, body })
                });

                if (response.ok) return response;
                if (response.status === 404) {
                    console.warn('Supabase Edge Function 未找到，请确保已部署 maimemo-proxy');
                    throw new Error('代理函数未部署');
                }
                if (response.status === 401) throw new Error('Token 无效');
                throw new Error(`代理服务器响应错误: ${response.status}`);
            } catch (e) {
                console.warn('Supabase 代理失败，尝试备用方案:', e);
            }
        }

        if (method !== 'GET') {
            throw new Error('当前请求需要 Supabase 代理支持，请先重新部署云函数');
        }

        // 备用方案：使用 allorigins
        const backupProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        try {
            const response = await fetch(backupProxyUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) return response;
            throw new Error(`备用代理响应错误: ${response.status}`);
        } catch (e) {
            console.error('所有代理均失败:', e);
            throw e;
        }
    }

    syncMaimemoBtn.addEventListener('click', async () => {
        if (!maimemoConfig.token) {
            alert('请先在设置中填入墨墨 API Token！');
            settingsModal.classList.add('open');
            return;
        }

        const confirmed = await openTestActionConfirm(
            '墨墨API',
            '确定开始同步墨墨弱点吗？系统会读取你在墨墨中的薄弱单词，并提高本地对应词组的抽取权重。'
        );

        if (!confirmed) {
            return;
        }

        syncMaimemoBtn.disabled = true;
        syncMaimemoBtn.innerHTML = '<span class="leaderboard-btn-icon">🔄</span><span>同步中...</span>';

        try {
            const localWords = [...new Set(
                wordGroups.flatMap(group => group.words.map(word => word.word.toLowerCase()))
            )];

            const response = await fetchWithProxy(
                'https://open.maimemo.com/open/api/v1/study/query_study_records',
                maimemoConfig.token,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        spellings: localWords,
                        limit: Math.min(localWords.length, 1000)
                    }
                }
            );
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const studyRecords = data?.data?.records || [];
            maimemoWordStatusMap = studyRecords.reduce((statusMap, item) => {
                const spelling = item?.voc_spelling?.toLowerCase();
                const status = item?.last_response;
                if (spelling && status) {
                    statusMap[spelling] = status;
                }
                return statusMap;
            }, {});

            // 找出本地受影响的词组数量
            const affectedGroups = wordGroups.filter(g =>
                g.words.some(w => maimemoWordStatusMap[w.word.toLowerCase()])
            );

            const statusCounts = studyRecords.reduce((counts, item) => {
                const status = item?.last_response;
                if (status) {
                    counts[status] = (counts[status] || 0) + 1;
                }
                return counts;
            }, {});
            const summaryText = Object.entries(statusCounts)
                .filter(([, count]) => count > 0)
                .map(([status, count]) => `${status} ${count} 个`)
                .join('，');

            saveData();
            alert(`同步成功！已读取墨墨学习状态 ${studyRecords.length} 个，并映射本地词组 ${affectedGroups.length} 组。${summaryText ? `\n\n状态分布：${summaryText}` : ''}`);
        } catch (err) {
            console.error('墨墨同步失败:', err);
            let errorMsg = '同步失败：' + (err.message || '网络连接异常');

            if (err.message.includes('代理函数未部署') || err.message.includes('404')) {
                errorMsg = '❌ 同步失败：Supabase 代理函数未部署。\n\n解决办法：\n1. 请查看根目录下的 supabase_edge_function.md 文件。\n2. 按照步骤使用 Supabase CLI 部署 maimemo-proxy 函数。\n3. 部署后即可解决跨域拦截问题。';
            } else if (err.message.toLowerCase().includes('fetch') || err.message.includes('拦截')) {
                errorMsg += '\n\n提示：请求被浏览器拦截。请确保你没有直接打开 HTML 文件，而是通过本地服务器（如 Live Server）运行。';
            }
            alert(errorMsg);
        } finally {
            syncMaimemoBtn.disabled = false;
            syncMaimemoBtn.innerHTML = '<span class="leaderboard-btn-icon">🔄</span><span>墨墨API</span>';
        }
    });

    // ==== 排行榜逻辑 (Supabase 驱动) ====
    async function uploadScoreToSupabase(total, correct, accuracy, mode) {
        if (!supabase) return;

        // 首次使用生成 UUID
        if (!systemState.userId) {
            systemState.userId = generateId();
            saveData();
        }

        try {
            const { error } = await supabase
                .from('leaderboard')
                .insert([
                    {
                        user_id: systemState.userId,
                        nickname: systemState.nickname,
                        total_words: total,
                        correct_words: correct,
                        accuracy: parseFloat(accuracy),
                        test_mode: mode
                    }
                ]);

            if (error) throw error;
            console.log('成绩已成功上报至 Supabase 排行榜');
        } catch (err) {
            console.error('上报成绩失败:', err);
        }
    }

    async function fetchLeaderboard() {
        if (!supabase) {
            alert('Supabase 连接未建立。请确保网络正常且已正确配置 API Key。');
            leaderboardModal.classList.remove('open');
            return;
        }

        leaderboardLoading.style.display = 'block';
        leaderboardContent.style.display = 'none';
        leaderboardTbody.innerHTML = '';

        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('accuracy', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (data && data.length > 0) {
                data.forEach((row, index) => {
                    const tr = document.createElement('tr');

                    // 排名逻辑
                    let rankDisplay = index + 1;
                    if (index === 0) rankDisplay = '🥇';
                    else if (index === 1) rankDisplay = '🥈';
                    else if (index === 2) rankDisplay = '🥉';

                    tr.innerHTML = `
                        <td>${rankDisplay}</td>
                        <td>${row.nickname || '匿名战士'}</td>
                        <td>${row.total_words}</td>
                        <td class="accuracy-val">${row.accuracy}%</td>
                    `;
                    leaderboardTbody.appendChild(tr);
                });
            } else {
                leaderboardTbody.innerHTML = '<tr><td colspan="4">暂无数据，快去测试吧！</td></tr>';
            }

            leaderboardLoading.style.display = 'none';
            leaderboardContent.style.display = 'block';
        } catch (err) {
            console.error('获取排行榜失败:', err);
            leaderboardTbody.innerHTML = '<tr><td colspan="4" style="color: red;">获取失败，请稍后重试</td></tr>';
            leaderboardLoading.style.display = 'none';
            leaderboardContent.style.display = 'block';
        }
    }

    viewLeaderboardBtn.addEventListener('click', () => {
        console.log('排行榜按钮被点击');
        leaderboardModal.classList.add('open');
        fetchLeaderboard();
    });

    closeLeaderboardBtn.addEventListener('click', () => {
        leaderboardModal.classList.remove('open');
    });

    leaderboardModal.addEventListener('click', (e) => {
        if (e.target === leaderboardModal) {
            leaderboardModal.classList.remove('open');
        }
    });

    // 初始化页面
    loadData();
    renderTable();
});
