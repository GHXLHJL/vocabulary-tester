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
    const viewDailyLeaderboardBtn = document.getElementById('view-daily-leaderboard-btn');
    const viewMonthlyLeaderboardBtn = document.getElementById('view-monthly-leaderboard-btn');
    const testerHeader = document.querySelector('.tester-header');
    const wordTable = document.getElementById('word-table');
    const adminReviewPanel = document.getElementById('admin-review-panel');
    const adminReviewStatus = document.getElementById('admin-review-status');
    const adminReviewMeta = document.getElementById('admin-review-meta');
    const adminReviewList = document.getElementById('admin-review-list');
    const reviewFilterButtons = document.querySelectorAll('.review-filter-btn');
    const refreshReviewBtn = document.getElementById('refresh-review-btn');
    const exitReviewBtn = document.getElementById('exit-review-btn');

    // 设置面板 DOM
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const maimemoTokenInput = document.getElementById('maimemo-token');
    const userNicknameInput = document.getElementById('user-nickname');
    const saveNicknameBtn = document.getElementById('save-nickname-btn');
    const saveTokenBtn = document.getElementById('save-token-btn');
    const syncWeaknessToggle = document.getElementById('sync-weakness-toggle');
    const kaoyanDictStatusHint = document.getElementById('kaoyan-dict-status');

    // 悬浮错题导航相关 DOM
    const floatingNavContainer = document.getElementById('floating-nav-container');
    const floatingNavToggle = document.getElementById('floating-nav-toggle');
    const floatingNavBadge = document.getElementById('floating-nav-badge');
    const floatingNavPanel = document.getElementById('floating-nav-panel');
    const floatingNavList = document.getElementById('floating-nav-list');
    const floatingNavOverlay = document.getElementById('floating-nav-overlay');

    // 排行榜 DOM
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardModalTitle = document.getElementById('leaderboard-modal-title');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const leaderboardTbody = document.getElementById('leaderboard-tbody');
    const testActionConfirmModal = document.getElementById('test-action-confirm-modal');
    const testActionConfirmTitle = document.getElementById('test-action-confirm-title');
    const testActionConfirmMessage = document.getElementById('test-action-confirm-message');
    const testActionCancelBtn = document.getElementById('test-action-cancel-btn');
    const testActionConfirmBtn = document.getElementById('test-action-confirm-btn');
    const infoModal = document.getElementById('info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalMessage = document.getElementById('info-modal-message');
    const infoModalConfirmBtn = document.getElementById('info-modal-confirm-btn');

    // 测试记录相关 DOM
    const recordsModal = document.getElementById('records-modal');
    const closeRecordsBtn = document.getElementById('close-records-btn');
    const recordsList = document.getElementById('records-list');
    const recordDetailView = document.getElementById('record-detail-view');
    const backToRecordsBtn = document.getElementById('back-to-records-btn');
    const detailRecordTime = document.getElementById('detail-record-time');
    const recordDetailContent = document.getElementById('record-detail-content');
    const recordModalTitle = document.getElementById('records-modal-title');
    const recordBtns = document.querySelectorAll('.record-btn');

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

    function updateKaoyanDictStatusUI() {
        if (!kaoyanDictStatusHint) return;

        kaoyanDictStatusHint.className = 'dict-status';
        if (kaoyanDictState.status === 'loading') {
            kaoyanDictStatusHint.classList.add('dict-status-loading');
            kaoyanDictStatusHint.textContent = '增强判题词库加载中，提交时会自动等待完成。';
            return;
        }

        if (kaoyanDictState.status === 'ready') {
            kaoyanDictStatusHint.classList.add('dict-status-ready');
            kaoyanDictStatusHint.textContent = `增强判题词库已就绪，当前支持 ${kaoyanDictState.wordCount} 个考研单词多义项匹配。`;
            return;
        }

        kaoyanDictStatusHint.classList.add('dict-status-failed');
        if (location.protocol === 'file:') {
            kaoyanDictStatusHint.textContent = '增强判题词库加载失败，当前直接打开本地文件时可能受浏览器限制；本次将仅按本地释义判题。';
        } else {
            kaoyanDictStatusHint.textContent = '增强判题词库加载失败，当前仅按本地释义判题。';
        }
    }

    async function loadKaoyanDict() {
        kaoyanDictState.status = 'loading';
        updateKaoyanDictStatusUI();
        try {
            const response = await fetch(`kaoyan_dict.json?v=${APP_VERSION}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            kaoyanDict = await response.json();
            kaoyanDictState.status = 'ready';
            kaoyanDictState.wordCount = Object.keys(kaoyanDict).length;
            console.log(`离线考研词库加载成功，共包含 ${kaoyanDictState.wordCount} 个单词`);
        } catch (e) {
            kaoyanDict = null;
            kaoyanDictState.status = 'failed';
            kaoyanDictState.wordCount = 0;
            console.warn('离线考研词库加载失败:', e);
        } finally {
            updateKaoyanDictStatusUI();
        }
    }

    initSupabase();

    const APP_VERSION = 'v26.8.11';
    const STORAGE_KEY = 'vocabulary_tester_data_v26.7.9'; // 保持存储键稳定，避免版本号变更导致本地数据丢失
    const RECORDS_STORAGE_KEY = 'vocabulary_tester_records_v1';
    const DRAFT_STORAGE_KEY = 'vocabulary_tester_draft_v1';
    const PROFILE_STORAGE_KEY = 'vocabulary_tester_profile_v1';
    const PRE_SYNC_BACKUP_KEY = 'vocabulary_tester_pre_sync_backup_v1';
    const ADMIN_SESSION_STORAGE_KEY = 'vocabulary_tester_admin_session_v1';
    const ACCEPTED_RULES_STORAGE_KEY = 'vocabulary_tester_accepted_rules_v1';
    const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
    const MAIMEMO_RESPONSE_WEIGHTS = {
        FORGET: 3,
        VAGUE: 2,
        CANCEL_WELL_FAMILIAR: 2,
        FAMILIAR: 0,
        WELL_FAMILIAR: -1
    };
    const JUDGE_STATUS = {
        CORRECT: 'correct',
        SYNONYM: 'synonym',
        PENDING: 'pending',
        INCORRECT: 'incorrect'
    };
    const GLOBAL_SYN_DICT = [
        ['方法', '办法', '方式', '手段', '途径'],
        ['聪明', '机灵'],
        ['聪明的', '机灵的'],
        ['水平', '水准'],
        ['员工', '职工', '职员', '工作人员', '雇员'],
        ['看见', '看到', '瞧见', '目睹'],
        ['逃避', '躲开', '规避'],
        ['不可避免', '不可避免的', '无法避免', '无法避免的'],
        ['必然发生', '必然发生的', '必然', '必然的'],
        ['表明', '说明', '显示'],
        ['导致', '引起', '造成'],
        ['包括', '包含', '涵盖'],
        ['保持', '维持'],
        ['提高', '提升'],
        ['帮助', '协助'],
        ['获得', '得到', '取得'],
        ['选择', '挑选'],
        ['相似', '类似'],
        ['明显', '显著'],
        ['合适', '适当'],
        ['证明', '证实'],
        ['强调', '着重'],
        ['遵守', '遵循'],
        ['参加', '参与'],
        ['目标', '目的'],
        ['优点', '长处'],
        ['缺点', '短处'],
        ['机会', '机遇'],
        ['看法', '观点'],
        ['迅速', '快速'],
        ['困难', '艰难'],
        ['准确', '精确'],
        ['重要', '关键'],
        ['依靠', '依赖'],
        ['发现', '发觉'],
        ['使用', '运用'],
        ['提供', '给予'],
        ['改善', '改进'],
        ['减少', '缩减'],
        ['反映', '体现'],
        ['理解', '明白'],
        ['本质', '实质'],
        ['区别', '差别'],
        ['错误', '失误'],
        ['建立', '设立'],
        ['允许', '准许', '许可'],
        ['拒绝', '回绝'],
        ['担心', '忧虑'],
        ['展示', '展现'],
        ['扩大', '扩展'],
        ['缩小', '减小'],
        ['宽阔', '宽广', '广阔'],
        ['收到', '接收', '接到'],
        ['结束', '终止'],
        ['继续', '持续'],
        ['适合', '适宜'],
        ['必要', '必需'],
        ['回答', '答复'],
        ['立即', '立刻'],
        ['经常', '常常'],
        ['一致', '相同'],
        ['全部', '所有'],
        ['准备', '预备'],
        ['改变', '转变'],
        ['构成', '组成'],
        ['建造', '修建'],
        ['破坏', '毁坏'],
        ['收集', '搜集']
    ];
    const GLOBAL_SYN_DICT_MAP = GLOBAL_SYN_DICT.reduce((accumulator, group) => {
        group.forEach(item => {
            accumulator[item] = group;
        });
        return accumulator;
    }, {});

    // 优化方案参数配置
    const SETTINGS = {
        dailyDrawCount: 20,      // 每日抽取词组数
        dailyLeaderboardRetentionDays: 5, // 每日排行榜记录有效期
        dailyLeaderboardMaxSlotsPerUser: 4, // 每日排行榜每人最多占据位次
        minIntervalDays: 2,      // 抽题最小间隔
        graduationThreshold: 0.8, // 毕业正确率阈值 (最近3次平均)
        minSingleRate: 0.6,      // 毕业最低单次线
        weakTierWeight: 5,       // 薄弱词组权重补偿
        newTierWeight: 3,        // 新词基础权重
        weeklyReviewRatio: 0.2,   // 周复盘抽取比例
        weeklyMinGroups: 10,     // 周复盘最少题量
        weeklyAllThreshold: 15,  // A池较小时全量复盘阈值
        weeklyMinIntervalDays: 7, // 周复盘建议最小间隔
        weeklyDegradation: 0.7,   // 周复盘退化线
        monthlyDegradation: 0.6,  // 月度总测退化线
        awakenDays: 21,          // A池强制唤醒周期
        stuckDays: 7             // 防卡死天数
    };
    const DEFAULT_NICKNAME = '考研战士';

    let wordGroups = []; // 核心数据：词组池
    let systemState = {
        lastDailyTestDate: null,
        lastWeeklyReviewDate: null,
        lastMonthlyTestDate: null,
        userId: null,
        nickname: DEFAULT_NICKNAME
    };
    let maimemoConfig = {
        token: '',
        syncWeakness: true
    };
    let maimemoWordStatusMap = {}; // 缓存墨墨单词状态：{ word: last_response }
    let kaoyanDict = null; // 离线考研词库
    let kaoyanDictState = {
        status: 'loading',
        wordCount: 0
    };
    let kaoyanDictReadyPromise = null;
    let currentTestMode = null; // null | 'daily' | 'weekly' | 'monthly'
    let currentTestGroups = []; // 当前正在测试的词组引用
    let currentTestSnapshot = null; // 进入测试前的快照，用于退出时回滚
    let adminSession = null;
    let currentReviewStatusFilter = 'pending';
    let acceptedRules = {
        perWord: {},
        globalSynonyms: [],
        blockedPairs: []
    };
    let acceptedGlobalSynonymMap = {};

    let confirmActionResolver = null;
    let infoModalResolver = null;

    updateKaoyanDictStatusUI();
    kaoyanDictReadyPromise = loadKaoyanDict();

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
        { id: generateId(), group: 1, word: 'describe', expectedAnswer: '描述/形容', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'inscribe', expectedAnswer: '题写/（雕）刻', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 1, word: 'transcribe', expectedAnswer: '抄写/改编（乐曲）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'modify', expectedAnswer: '更改/修改', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'commodity', expectedAnswer: '商品/日用品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'accommodate', expectedAnswer: '适应/容纳', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'commercial', expectedAnswer: '商业（的）/广告', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'irritate', expectedAnswer: '激怒/刺激', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'irrigate', expectedAnswer: '灌溉/冲洗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'agitate', expectedAnswer: '搅动/煽动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'devote', expectedAnswer: '投入/献身', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'donate', expectedAnswer: '捐赠/捐献', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'denote', expectedAnswer: '代表/表示', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'intend', expectedAnswer: '打算/计划', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'attend', expectedAnswer: '参加/应对', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'extend', expectedAnswer: '延长/包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'distend', expectedAnswer: '扩大/夸张', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'pretend', expectedAnswer: '假装/假扮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'contend', expectedAnswer: '竞争/声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'conscious', expectedAnswer: '意识到的/有意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'subconscious', expectedAnswer: '下意识（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'conscience', expectedAnswer: '良心/良知', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'averse', expectedAnswer: '反对的/讨厌的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'adverse', expectedAnswer: '不利的/有害的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'reverse', expectedAnswer: '相反的/逆转', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'reversible', expectedAnswer: '可逆的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'inverse', expectedAnswer: '（位置）相反的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'converse', expectedAnswer: '（说法）相反的/交谈', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'diverse', expectedAnswer: '不同的/多种多样的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'universal', expectedAnswer: '多方面的/普遍的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'controversial', expectedAnswer: '有争议的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'setback', expectedAnswer: '挫折/阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'feedback', expectedAnswer: '反馈', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'drawback', expectedAnswer: '缺点/不利条件', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'emit', expectedAnswer: '散发/发出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'omit', expectedAnswer: '遗漏/忽略', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'submit', expectedAnswer: '屈服/提交', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'transmit', expectedAnswer: '传送/传输', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'vision', expectedAnswer: '视力/远见', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'visual', expectedAnswer: '看得见的/视觉的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'visible', expectedAnswer: '看得见的/明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'visitation', expectedAnswer: '显现/拜访', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'gun', expectedAnswer: '枪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'guy', expectedAnswer: '家伙/男人', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'gum', expectedAnswer: '口香糖/牙龈', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'gym', expectedAnswer: '健身房/体育馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'gay', expectedAnswer: '同性恋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'abnormal', expectedAnswer: '不正常的/反常的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'abnormality', expectedAnswer: '变态/异常', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'norm', expectedAnswer: '规范/准则', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'enormous', expectedAnswer: '巨大的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'abound', expectedAnswer: '充满/丰富', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'abundant', expectedAnswer: '大量的/充足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'abundance', expectedAnswer: '丰富/充足', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'dissolve', expectedAnswer: '（使）溶解/解散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'solution', expectedAnswer: '解答/解决方法', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'soluble', expectedAnswer: '可溶的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'resolve', expectedAnswer: '决心/解决', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'resolute', expectedAnswer: '坚决的/果断的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'leather', expectedAnswer: '皮（革）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'feather', expectedAnswer: '羽毛', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shortcoming', expectedAnswer: '缺点/缺陷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shortage', expectedAnswer: '短缺/不足', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shortcut', expectedAnswer: '捷径/近路', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'undercut', expectedAnswer: '削减/压低', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'short', expectedAnswer: '短的/矮的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shortly', expectedAnswer: '立刻/简短地', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shorten', expectedAnswer: '缩短/变短', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shortlist', expectedAnswer: '候选名单', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'elusive', expectedAnswer: '难以捉摸的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'exclusive', expectedAnswer: '独有的/排外的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'coach', expectedAnswer: '教练/训练', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'couch', expectedAnswer: '长沙发/表达', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'cough', expectedAnswer: '咳嗽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'lever', expectedAnswer: '杠杆/撬动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'clever', expectedAnswer: '聪明的/灵巧的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'level', expectedAnswer: '水平/齐平的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'bottom', expectedAnswer: '底部（的）/尽头（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'button', expectedAnswer: '按钮/纽扣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'hose', expectedAnswer: '水管/软管', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'horse', expectedAnswer: '马', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'house', expectedAnswer: '房子/大楼/议院', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'hoarse', expectedAnswer: '沙哑的/嘶哑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'magnificent', expectedAnswer: '宏伟的/壮丽的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'malignant', expectedAnswer: '（病）恶性的/恶毒的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'patrol', expectedAnswer: '巡逻/巡查', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'patriot', expectedAnswer: '爱国者', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'petrol', expectedAnswer: '汽油', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'petroleum', expectedAnswer: '石油', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'patron', expectedAnswer: '赞助人/顾客', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'pardon', expectedAnswer: '原谅/宽恕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'suit', expectedAnswer: '诉讼/适合', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'suite', expectedAnswer: '套房/一套（东西）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'block', expectedAnswer: '阻碍/一块', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'flock', expectedAnswer: '聚集/一群', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'shadow', expectedAnswer: '影子/阴影', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'shallow', expectedAnswer: '（肤）浅的/浅薄的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'handicap', expectedAnswer: '障碍/残疾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'kidnap', expectedAnswer: '绑架/劫持', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'shake', expectedAnswer: '摇动/握手/摆脱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'shock', expectedAnswer: '震惊（的）/电击', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'sharp', expectedAnswer: '急剧的/锋利的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'shape', expectedAnswer: '形成/形状/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'shade', expectedAnswer: '阴凉处/遮光', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'heel', expectedAnswer: '脚后跟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'heal', expectedAnswer: '愈合/治愈', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'hell', expectedAnswer: '地狱/该死', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'hall', expectedAnswer: '大厅/礼堂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'hill', expectedAnswer: '小山/山丘', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'war', expectedAnswer: '战争/竞争', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'ware', expectedAnswer: '商品/制品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'wary', expectedAnswer: '谨慎的/小心的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'warn', expectedAnswer: '提醒/警告', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'warm', expectedAnswer: '暖和（的）/热情的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'warp', expectedAnswer: '（使）扭曲/弯曲', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'cession', expectedAnswer: '割让/转让', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'concession', expectedAnswer: '让步/特许权', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'recession', expectedAnswer: '经济衰退/退后', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'succession', expectedAnswer: '继承（权）/一连串', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'procession', expectedAnswer: '队伍/队列', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'possession', expectedAnswer: '拥有（物）/财产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'ward', expectedAnswer: '病房/防止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'award', expectedAnswer: '奖品/授予', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'reward', expectedAnswer: '奖赏/酬金', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'coward', expectedAnswer: '胆小鬼/懦夫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'awkward', expectedAnswer: '尴尬的/难办的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'outward', expectedAnswer: '外面的/向外（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'beat', expectedAnswer: '击败/跳动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'beast', expectedAnswer: '野兽/凶残的人', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'breast', expectedAnswer: '胸（部）/乳房', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'bear', expectedAnswer: '承受/带有/熊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'beard', expectedAnswer: '胡子/胡须', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'rut', expectedAnswer: '刻板乏味/车辙', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'nut', expectedAnswer: '螺母/坚果/疯子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'gut', expectedAnswer: '本能（的）/勇气/肚子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'needle', expectedAnswer: '针头/激怒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'needy', expectedAnswer: '贫穷的/贫困的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'scoop', expectedAnswer: '获得/一勺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'troop', expectedAnswer: '军队/一群', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'group', expectedAnswer: '团体/组', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'troupe', expectedAnswer: '表演团/剧团', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'ready', expectedAnswer: '准备好的/乐意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'greedy', expectedAnswer: '贪婪的/贪心的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'tragedy', expectedAnswer: '悲剧/遗憾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'remedy', expectedAnswer: '解决方法/补救', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'comedy', expectedAnswer: '喜剧（片）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'mantle', expectedAnswer: '覆盖（物）/地幔', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'mortal', expectedAnswer: '凡人/致命的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'mental', expectedAnswer: '精神（健康）的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'metal', expectedAnswer: '金属', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'medal', expectedAnswer: '奖章/奖牌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'motel', expectedAnswer: '汽车旅馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'ethic', expectedAnswer: '道德观/道德规范', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'ethnic', expectedAnswer: '民族的/种族的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'cannon', expectedAnswer: '猛撞/大炮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'canon', expectedAnswer: '标准/真作集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'light', expectedAnswer: '光线/鉴于/点燃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'alight', expectedAnswer: '点亮/落下', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'slight', expectedAnswer: '轻微的/轻视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'plight', expectedAnswer: '困境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'delight', expectedAnswer: '愉快/高兴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'flight', expectedAnswer: '航班/飞行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'delete', expectedAnswer: '删除/删去', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'deplete', expectedAnswer: '耗尽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'volume', expectedAnswer: '容量/一卷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'column', expectedAnswer: '专栏/（支）柱/列', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'seem', expectedAnswer: '似乎', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'deem', expectedAnswer: '认为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'esteem', expectedAnswer: '尊敬', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'redeem', expectedAnswer: '弥补/兑换', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'feed', expectedAnswer: '喂养/提供/饲料', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'deed', expectedAnswer: '行为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'indeed', expectedAnswer: '确实', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'need', expectedAnswer: '需要', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'reed', expectedAnswer: '芦苇', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'seed', expectedAnswer: '种子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'stuff', expectedAnswer: '东西/填充', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'staff', expectedAnswer: '职工/任职于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'stiff', expectedAnswer: '艰难的/（僵）硬的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'drill', expectedAnswer: '练习/钻（孔）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'drift', expectedAnswer: '漂流/移动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'draft', expectedAnswer: '草稿/草拟（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'thrift', expectedAnswer: '节俭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'essential', expectedAnswer: '基本的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'eccentric', expectedAnswer: '古怪的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'notion', expectedAnswer: '概念/观念', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'notice', expectedAnswer: '注意/通知', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'type', expectedAnswer: '类型/打字', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'tape', expectedAnswer: '录音/磁带/卷尺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'tap', expectedAnswer: '利用/水龙头', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'desert', expectedAnswer: '沙漠/丢弃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'dessert', expectedAnswer: '甜点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'cherish', expectedAnswer: '珍爱/怀念', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'perish', expectedAnswer: '死亡', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'nourish', expectedAnswer: '滋养/养育', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'perspective', expectedAnswer: '观点/视角', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'prospective', expectedAnswer: '可能的/潜在的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'perceptive', expectedAnswer: '有洞察力的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'respective', expectedAnswer: '分别的/各自的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'susceptive', expectedAnswer: '敏感的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'retrospective', expectedAnswer: '回想的/回顾的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'introspective', expectedAnswer: '自省的/反省的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'gene', expectedAnswer: '基因', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'genesis', expectedAnswer: '起源', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'general', expectedAnswer: '将军/普通的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'generic', expectedAnswer: '一般的/普通的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'genetic', expectedAnswer: '基因的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'generate', expectedAnswer: '产生', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'generation', expectedAnswer: '一代（人）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'generalize', expectedAnswer: '概括/推广', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'generous', expectedAnswer: '慷慨的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'genre', expectedAnswer: '类型/种类', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'generalization', expectedAnswer: '概括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'climb', expectedAnswer: '攀爬', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'climate', expectedAnswer: '气候', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'climax', expectedAnswer: '高潮/顶点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'claim', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'acclaim', expectedAnswer: '称赞', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'declaim', expectedAnswer: '演讲', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'disclaim', expectedAnswer: '否认', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'exclaim', expectedAnswer: '呼喊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'proclaim', expectedAnswer: '宣布', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'reclaim', expectedAnswer: '回收/开垦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'hub', expectedAnswer: '中心/轮轴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'pub', expectedAnswer: '酒馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'sub', expectedAnswer: '替补/潜水艇', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'tub', expectedAnswer: '浴缸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'rub', expectedAnswer: '摩擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'dub', expectedAnswer: '给…起绰号', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'cub', expectedAnswer: '幼崽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'device', expectedAnswer: '设备/方法', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'devise', expectedAnswer: '发明/设计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'advise', expectedAnswer: '建议/通知', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'advice', expectedAnswer: '建议/意见', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'revise', expectedAnswer: '修订/改变/复习', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'evolution', expectedAnswer: '进化', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'resolution', expectedAnswer: '决定/决心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'revelation', expectedAnswer: '揭露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'revolution', expectedAnswer: '革命', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'allege', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'allegation', expectedAnswer: '指控', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'allegiance', expectedAnswer: '忠诚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'alien', expectedAnswer: '外国的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'align', expectedAnswer: '（使）一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'alliance', expectedAnswer: '联盟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'ally', expectedAnswer: '盟友', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'allay', expectedAnswer: '减轻', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'alloy', expectedAnswer: '合金', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'alley', expectedAnswer: '小巷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'rally', expectedAnswer: '集合', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'alleviate', expectedAnswer: '缓解', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'alienate', expectedAnswer: '（使）疏远', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'affiliate', expectedAnswer: '隶属于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'allocate', expectedAnswer: '分配', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'formal', expectedAnswer: '形式的/正规的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'formality', expectedAnswer: '例行公事', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'format', expectedAnswer: '格式(化)', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'formative', expectedAnswer: '影响形成的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'former', expectedAnswer: '以前的/前者（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'formula', expectedAnswer: '方案/配方', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'formulate', expectedAnswer: '制定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'trip', expectedAnswer: '旅行/绊倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'trap', expectedAnswer: '困住/陷阱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'strap', expectedAnswer: '捆绑/布条', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'strip', expectedAnswer: '剥夺/条（带）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'stripe', expectedAnswer: '条纹/种类', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'scrip', expectedAnswer: '临时凭证/便条', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'script', expectedAnswer: '剧本/计划', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'spite', expectedAnswer: '怨恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'spit', expectedAnswer: '吐（口水）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'scrap', expectedAnswer: '放弃/废品/吵架', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'scrape', expectedAnswer: '勉强通过/擦伤/抓取', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'scratch', expectedAnswer: '抓/刮（伤）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'confide', expectedAnswer: '透露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'confidence', expectedAnswer: '信心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'confident', expectedAnswer: '自信的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'confidant', expectedAnswer: '知己', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'tramp', expectedAnswer: '远足/流浪汉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'damp', expectedAnswer: '潮湿的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'dumb', expectedAnswer: '愚蠢的/哑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'dump', expectedAnswer: '倾销/垃圾场', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'jump', expectedAnswer: '跳跃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'bump', expectedAnswer: '撞上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'pump', expectedAnswer: '抽水（机）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'lump', expectedAnswer: '把…混为一谈/肿块', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'bravery', expectedAnswer: '勇敢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'gravity', expectedAnswer: '重力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'brevity', expectedAnswer: '简洁/短暂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'fate', expectedAnswer: '命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'fade', expectedAnswer: '逐渐消失/褪色', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'fame', expectedAnswer: '声誉/名声', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'feat', expectedAnswer: '功绩/技艺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'feast', expectedAnswer: '盛宴/尽情享用', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'fake', expectedAnswer: '假的/赝品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'fare', expectedAnswer: '车费/船费', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'fear', expectedAnswer: '害怕/惧怕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'scare', expectedAnswer: '害怕/恐慌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'scarce', expectedAnswer: '缺乏的/不足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'score', expectedAnswer: '分数/得分', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'scorn', expectedAnswer: '蔑视/鄙视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'corn', expectedAnswer: '玉米', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'ore', expectedAnswer: '矿', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'sore', expectedAnswer: '痛处', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'core', expectedAnswer: '核（心）（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'scar', expectedAnswer: '伤痕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'stationary', expectedAnswer: '静止的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'stationery', expectedAnswer: '文具', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'fuse', expectedAnswer: '融合/保险丝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'confuse', expectedAnswer: '迷惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'effuse', expectedAnswer: '流出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'refuse', expectedAnswer: '拒绝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'refute', expectedAnswer: '反驳', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'defuse', expectedAnswer: '（使）缓和', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'infuse', expectedAnswer: '注入', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'diffuse', expectedAnswer: '传播（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'transfuse', expectedAnswer: '输（血）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'test', expectedAnswer: '测试/检验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'text', expectedAnswer: '文本/短信', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'taste', expectedAnswer: '喜好/品味', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'task', expectedAnswer: '任务/工作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'elect', expectedAnswer: '选举/选择', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'erect', expectedAnswer: '建立/直立的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'enact', expectedAnswer: '制定法律/实施', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'cardinal', expectedAnswer: '最重要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'cordial', expectedAnswer: '热情友好的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'expect', expectedAnswer: '期待/预计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'expert', expectedAnswer: '专家（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'export', expectedAnswer: '出口（物）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'exert', expectedAnswer: '运用/努力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'except', expectedAnswer: '除…之外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'excerpt', expectedAnswer: '摘录', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'expend', expectedAnswer: '花费/消耗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'expand', expectedAnswer: '扩大/详述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'extent', expectedAnswer: '程度/范围', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'expire', expectedAnswer: '过期/终止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'expose', expectedAnswer: '暴露/（使）遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'week', expectedAnswer: '星期/周', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'weed', expectedAnswer: '杂草', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'weep', expectedAnswer: '流出/哭泣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'sweep', expectedAnswer: '扫过/迅速传播', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'wipe', expectedAnswer: '擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'wife', expectedAnswer: '妻子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'whip', expectedAnswer: '党鞭/鞭子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'ventilate', expectedAnswer: '（使）通风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'versatile', expectedAnswer: '多才多艺的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'volatile', expectedAnswer: '易挥发的/易变的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'gratitude', expectedAnswer: '感谢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'attitude', expectedAnswer: '态度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'altitude', expectedAnswer: '高度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'latitude', expectedAnswer: '纬度/自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'longitude', expectedAnswer: '经度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'aptitude', expectedAnswer: '天赋/天资', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'multitude', expectedAnswer: '大量/人群', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'talent', expectedAnswer: '才能/天才', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'latent', expectedAnswer: '潜伏的/潜在的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'patent', expectedAnswer: '专利/专利权', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'tenant', expectedAnswer: '租户/佃户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'lantern', expectedAnswer: '灯笼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'lateral', expectedAnswer: '侧面的/平级的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'vote', expectedAnswer: '投票/表决', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'veto', expectedAnswer: '否决/反对', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'row', expectedAnswer: '争吵/一排', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'raw', expectedAnswer: '生的/未经加工的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'law', expectedAnswer: '法律/司法界/警方', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'paw', expectedAnswer: '爪子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'jaw', expectedAnswer: '下巴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'saw', expectedAnswer: '锯子/锯开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'sew', expectedAnswer: '缝（制）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'sow', expectedAnswer: '播（种）/散布', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'quota', expectedAnswer: '配额/定额', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'quote', expectedAnswer: '引用/引文', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'quoth', expectedAnswer: '说', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'quotient', expectedAnswer: '商', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'quotidian', expectedAnswer: '每日的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'parade', expectedAnswer: '游行/阅兵（式）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'paradox', expectedAnswer: '悖论/矛盾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'paralyse', expectedAnswer: '（使）麻痹/（使）瘫痪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'paradise', expectedAnswer: '天堂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'alter', expectedAnswer: '改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'alert', expectedAnswer: '警惕（的）/警报', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'avert', expectedAnswer: '防止/避免', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'advert', expectedAnswer: '广告/提及', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'advent', expectedAnswer: '到来/出现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'overt', expectedAnswer: '公开的/明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'invert', expectedAnswer: '（使）颠倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'convert', expectedAnswer: '转换/改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'divert', expectedAnswer: '转向/转移', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'principal', expectedAnswer: '主要的/校长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'principle', expectedAnswer: '原则/原理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'ecological', expectedAnswer: '生态的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'physiological', expectedAnswer: '生理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'psychological', expectedAnswer: '心理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'philosophical', expectedAnswer: '哲学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'erupt', expectedAnswer: '爆发/喷发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'abrupt', expectedAnswer: '突然的/意外的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'disrupt', expectedAnswer: '（使）扰乱/中断', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'corrupt', expectedAnswer: '破坏/腐败（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'interrupt', expectedAnswer: '打断/打扰', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'bankrupt', expectedAnswer: '破产的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'sentiment', expectedAnswer: '观点/情绪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'sensible', expectedAnswer: '明智的/理智的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'sensitive', expectedAnswer: '敏感的/体贴的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'product', expectedAnswer: '产品/产物', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'conduct', expectedAnswer: '实施/举止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'instruct', expectedAnswer: '指示/教授（v）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'obstruct', expectedAnswer: '阻碍/妨碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'destruct', expectedAnswer: '毁坏/摧毁', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'construct', expectedAnswer: '建造/构想', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'board', expectedAnswer: '董事会/木板', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'aboard', expectedAnswer: '在（船/飞机/火车）上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'broad', expectedAnswer: '宽阔的/广泛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'abroad', expectedAnswer: '在国外/到国外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'circulation', expectedAnswer: '发行量/流通', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'curriculum', expectedAnswer: '课程', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'circumstance', expectedAnswer: '情况/命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'recent', expectedAnswer: '最近的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'resent', expectedAnswer: '愤恨/讨厌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'consent', expectedAnswer: '同意/准许', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'context', expectedAnswer: '背景/语境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'contest', expectedAnswer: '比赛/争辩', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'content', expectedAnswer: '内容/满意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'contact', expectedAnswer: '联系/触摸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'operate', expectedAnswer: '经营/运转', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'cooperate', expectedAnswer: '合作/协作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'corporate', expectedAnswer: '公司的/全体的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'incorporate', expectedAnswer: '包括/并入', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'coordinate', expectedAnswer: '（使）协调/坐标（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'protect', expectedAnswer: '保护/保卫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'protest', expectedAnswer: '抗议/反对', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'pretext', expectedAnswer: '借口', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'process', expectedAnswer: '过程/处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'progress', expectedAnswer: '进步/进展', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'congress', expectedAnswer: '国会/代表大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'deform', expectedAnswer: '（使）畸形', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'perform', expectedAnswer: '表现/履行/表演', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'uniform', expectedAnswer: '制服/统一的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'conform', expectedAnswer: '遵守/相一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'inform', expectedAnswer: '通知/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'reform', expectedAnswer: '改革', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'reformation', expectedAnswer: '革新', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'reformer', expectedAnswer: '改革者', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'reformatory', expectedAnswer: '改革的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'confer', expectedAnswer: '授予/商讨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'infer', expectedAnswer: '推测/暗示', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'refer', expectedAnswer: '涉及/查阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'defer', expectedAnswer: '推迟/听从', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'chase', expectedAnswer: '追逐/追求', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'phase', expectedAnswer: '阶段/时期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'phrase', expectedAnswer: '短语/叙述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'purchase', expectedAnswer: '购买', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'assume', expectedAnswer: '假设', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'reassume', expectedAnswer: '重新假定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'resume', expectedAnswer: '继续/简历', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'presume', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'consume', expectedAnswer: '消耗/吃喝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'subsume', expectedAnswer: '包含', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'clash', expectedAnswer: '冲突/分歧', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'crash', expectedAnswer: '撞车/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'crack', expectedAnswer: '破裂/打压', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'crush', expectedAnswer: '压坏/迷恋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'genuine', expectedAnswer: '真正的/真诚的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'genius', expectedAnswer: '天才/天赋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'ingenious', expectedAnswer: '精巧的/巧妙的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'ingenuity', expectedAnswer: '创造力/聪明才智', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'ingenuous', expectedAnswer: '单纯的/天真的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'serve', expectedAnswer: '服务/用于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'reserve', expectedAnswer: '预订/保护区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'observe', expectedAnswer: '观察/评论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'deserve', expectedAnswer: '值得', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'preserve', expectedAnswer: '维护/专属领域', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'conserve', expectedAnswer: '节约/保护', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'congregate', expectedAnswer: '集合/聚集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'segregate', expectedAnswer: '（使）隔离/分开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'convention', expectedAnswer: '习俗/大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'contention', expectedAnswer: '争论/观点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'subtract', expectedAnswer: '减去/减掉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'attract', expectedAnswer: '吸引/招引', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'attractive', expectedAnswer: '吸引人的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'distract', expectedAnswer: '分散/（使）分心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'abstract', expectedAnswer: '抽象（派）的/摘要', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'extract', expectedAnswer: '抽出/选段', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'extraction', expectedAnswer: '提取/拔牙', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'contract', expectedAnswer: '合同/感染', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'contrast', expectedAnswer: '差异/对比', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'contrary', expectedAnswer: '相反（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'controversy', expectedAnswer: '争论/争议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'mount', expectedAnswer: '发起/登上/山', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'amount', expectedAnswer: '数量/解释', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'account', expectedAnswer: '账户/等同', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'literate', expectedAnswer: '识字的/有文化的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'illiterate', expectedAnswer: '文盲（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'literacy', expectedAnswer: '读写能力/专业能力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'literature', expectedAnswer: '文学/文献', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'literal', expectedAnswer: '字面上的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'literary', expectedAnswer: '文学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'liberal', expectedAnswer: '开放的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'liberty', expectedAnswer: '自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'liberate', expectedAnswer: '解放/解脱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'property', expectedAnswer: '财产/房地产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'poverty', expectedAnswer: '贫穷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'proper', expectedAnswer: '恰当的/得体的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'prosper', expectedAnswer: '繁荣/成功', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'prospect', expectedAnswer: '前景/可能性', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'reproach', expectedAnswer: '责备/批评', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'approach', expectedAnswer: '接近/方法', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'approval', expectedAnswer: '赞成/批准', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'appear', expectedAnswer: '出现/看起来', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 109, word: 'inflict', expectedAnswer: '（使）遭受/强加', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 109, word: 'conflict', expectedAnswer: '冲突/矛盾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'delicate', expectedAnswer: '精美的/微妙的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'dedicate', expectedAnswer: '奉献/献身（于）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'indicate', expectedAnswer: '表明/暗示', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'distinguish', expectedAnswer: '区分/辨别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'distinguished', expectedAnswer: '卓著的/杰出的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'extinguish', expectedAnswer: '熄灭/毁灭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'extinct', expectedAnswer: '（已）灭绝的/消亡的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'distinction', expectedAnswer: '差别/优秀', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'distinct', expectedAnswer: '明确的/截然不同的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'instinct', expectedAnswer: '本能/直觉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'attempt', expectedAnswer: '尝试/试图', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'contempt', expectedAnswer: '鄙视/轻蔑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'tempt', expectedAnswer: '引诱/劝说', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'temptation', expectedAnswer: '诱惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'temple', expectedAnswer: '寺院/寺庙', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'template', expectedAnswer: '模版/样板', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'contemplate', expectedAnswer: '思考', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'tempo', expectedAnswer: '节奏/速度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'temporal', expectedAnswer: '短暂的/世俗的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'temporary', expectedAnswer: '暂时的/临时的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'hamper', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'cape', expectedAnswer: '披风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'cap', expectedAnswer: '帽子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'cope', expectedAnswer: '处理/应对', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'cop', expectedAnswer: '警察', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'rap', expectedAnswer: '说唱/敲击', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'rape', expectedAnswer: '强奸/抢夺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'lapse', expectedAnswer: '疏忽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'elapse', expectedAnswer: '流逝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'collapse', expectedAnswer: '倒塌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'precious', expectedAnswer: '珍贵的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'previous', expectedAnswer: '先前的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'precise', expectedAnswer: '精确的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 116, word: 'conceive', expectedAnswer: '想象/怀孕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 116, word: 'perceive', expectedAnswer: '看待/注意到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 116, word: 'receive', expectedAnswer: '收到/受到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 116, word: 'deceive', expectedAnswer: '欺骗/误导', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 117, word: 'sufficient', expectedAnswer: '充足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 117, word: 'efficient', expectedAnswer: '效率高的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'evaporate', expectedAnswer: '消失/蒸发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'escalate', expectedAnswer: '扩大/升级', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'evacuate', expectedAnswer: '撤退/疏散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'evaluate', expectedAnswer: '评价/评估', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'estimate', expectedAnswer: '估计/估算', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'eliminate', expectedAnswer: '消除/淘汰', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'simulate', expectedAnswer: '假装/模拟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'stimulate', expectedAnswer: '刺激/激励', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'calculate', expectedAnswer: '计算/预测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'speculate', expectedAnswer: '推测/思索', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'stipulate', expectedAnswer: '规定/约定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'spectrum', expectedAnswer: '光谱/范围', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'spectacle', expectedAnswer: '景象/眼镜', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'spectacular', expectedAnswer: '壮观的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'spectator', expectedAnswer: '观众/旁观者', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'speculative', expectedAnswer: '猜测的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'repeal', expectedAnswer: '废止/废除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'repel', expectedAnswer: '驱逐/厌恶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'rebel', expectedAnswer: '反抗（者）/造反', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'dispel', expectedAnswer: '驱散/消除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'impel', expectedAnswer: '促使/驱使', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'compel', expectedAnswer: '强迫/逼迫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'propel', expectedAnswer: '推动/促使', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'expel', expectedAnswer: '开除/驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'excel', expectedAnswer: '擅长/超越', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'gap', expectedAnswer: '缝隙/缺口', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'gas', expectedAnswer: '气体/煤气', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'gasp', expectedAnswer: '喘气/喘息', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'gape', expectedAnswer: '裂开/张开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'grasp', expectedAnswer: '理解/抓住', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'grape', expectedAnswer: '葡萄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'gossip', expectedAnswer: '流言/闲话', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'inventive', expectedAnswer: '善于创新的/有创造力的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'incentive', expectedAnswer: '激励/刺激', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'intensive', expectedAnswer: '密集的/加强的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'inclusive', expectedAnswer: '包括的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'assure', expectedAnswer: '（人）确保/保证', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'insure', expectedAnswer: '（钱）确保/给…买保险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'ensure', expectedAnswer: '（事）确保', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'secure', expectedAnswer: '（资源）获得/（使）安全（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'obscure', expectedAnswer: '（使）模糊（的）/难以理解的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'equality', expectedAnswer: '平等/相等', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'quantity', expectedAnswer: '数量/大量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'quality', expectedAnswer: '质量/品质/优质（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'qualify', expectedAnswer: '（使）有资格/取得资格', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'vigorous', expectedAnswer: '活跃的/精力旺盛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'rigorous', expectedAnswer: '严厉的/严格的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'humorous', expectedAnswer: '幽默的/滑稽的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'victorious', expectedAnswer: '获胜的/胜利的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'curious', expectedAnswer: '好奇的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'nervous', expectedAnswer: '紧张的/担忧的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'obvious', expectedAnswer: '明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'dubious', expectedAnswer: '怀疑的/可疑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'serious', expectedAnswer: '严重的/重要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'district', expectedAnswer: '地区/区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'distribute', expectedAnswer: '分发/（使）分散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'contribute', expectedAnswer: '捐献/有助于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'attribute', expectedAnswer: '将...归因于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'substance', expectedAnswer: '物质/主旨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'substitute', expectedAnswer: '代替（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'institute', expectedAnswer: '制定/机构', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'constitute', expectedAnswer: '构成/被视为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'dense', expectedAnswer: '密集的/迟钝的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'sense', expectedAnswer: '意识到/感觉/意义', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'tense', expectedAnswer: '紧张的/焦虑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'tease', expectedAnswer: '戏弄/梳理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 129, word: 'inhabit', expectedAnswer: '居住于/身处于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 129, word: 'inhibit', expectedAnswer: '抑制/阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 130, word: 'define', expectedAnswer: '定义/说明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 130, word: 'confine', expectedAnswer: '限制/监禁', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 130, word: 'refine', expectedAnswer: '提炼/改进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'ascend', expectedAnswer: '上升/攀登', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'descend', expectedAnswer: '下降', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transcend', expectedAnswer: '超出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transition', expectedAnswer: '过渡/转变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transaction', expectedAnswer: '交易/业务', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transparent', expectedAnswer: '明显的/透明的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transient', expectedAnswer: '短暂的/暂住的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transmission', expectedAnswer: '传输/发射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'translate', expectedAnswer: '转变/翻译', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transform', expectedAnswer: '转化/改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transport', expectedAnswer: '运输/交通方式', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 131, word: 'transplant', expectedAnswer: '移植/移居', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 132, word: 'assist', expectedAnswer: '帮助/促进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 132, word: 'persist', expectedAnswer: '坚持/持续', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 132, word: 'resist', expectedAnswer: '抵制/忍住', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 132, word: 'consist', expectedAnswer: '由...组成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 133, word: 'roast', expectedAnswer: '烘烤/烤肉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 133, word: 'boast', expectedAnswer: '自夸/拥有', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 133, word: 'boost', expectedAnswer: '增长/促进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 134, word: 'implement', expectedAnswer: '实施/工具', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 134, word: 'complement', expectedAnswer: '补足/（使）完美', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 134, word: 'compliment', expectedAnswer: '称赞/恭维', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 135, word: 'trait', expectedAnswer: '特征/特点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 135, word: 'trail', expectedAnswer: '追踪/路线', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 135, word: 'trial', expectedAnswer: '审判/试验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 136, word: 'state', expectedAnswer: '国家（的）/状况/说明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 136, word: 'statue', expectedAnswer: '雕塑/塑像', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 136, word: 'status', expectedAnswer: '状况/地位', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 136, word: 'statute', expectedAnswer: '法令/法规', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 136, word: 'stature', expectedAnswer: '身材/名望', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 136, word: 'saturate', expectedAnswer: '（使）浸透/充满', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'crumple', expectedAnswer: '起皱/瘫倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'crumble', expectedAnswer: '坍塌/破裂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'grumble', expectedAnswer: '抱怨/轰隆声', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'humble', expectedAnswer: '谦逊的/卑微的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'bumble', expectedAnswer: '弄糟/语无伦次', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'fumble', expectedAnswer: '摸索/笨手笨脚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'jumble', expectedAnswer: '（使）混乱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'rumble', expectedAnswer: '隆隆作响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'tumble', expectedAnswer: '跌倒/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 137, word: 'stumble', expectedAnswer: '绊倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 138, word: 'amble', expectedAnswer: '缓行/漫步', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 138, word: 'ramble', expectedAnswer: '漫步/闲聊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 138, word: 'gamble', expectedAnswer: '赌博/冒险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 138, word: 'shamble', expectedAnswer: '蹒跚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 138, word: 'preamble', expectedAnswer: '序言/开场白', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 138, word: 'scramble', expectedAnswer: '争抢/（攀）爬', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 139, word: 'assemble', expectedAnswer: '集合/组装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 139, word: 'resemble', expectedAnswer: '与…相似', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 139, word: 'dissemble', expectedAnswer: '掩饰/假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 139, word: 'ensemble', expectedAnswer: '剧团/套装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 140, word: 'render', expectedAnswer: '（使）成为/表达', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 140, word: 'tender', expectedAnswer: '温柔的/提交', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 140, word: 'wonder', expectedAnswer: '想知道/奇观/惊讶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 140, word: 'gender', expectedAnswer: '性别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 140, word: 'ponder', expectedAnswer: '考虑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 141, word: 'subject', expectedAnswer: '主题/（使）遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 141, word: 'object', expectedAnswer: '物体/反对/对象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 141, word: 'inject', expectedAnswer: '注射/增添', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 141, word: 'project', expectedAnswer: '项目/计划/投射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 141, word: 'eject', expectedAnswer: '驱逐/喷出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 142, word: 'polish', expectedAnswer: '擦亮/修改', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 142, word: 'astonish', expectedAnswer: '（使）惊讶/（使）震惊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 142, word: 'abolish', expectedAnswer: '废除/取消', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 142, word: 'foolish', expectedAnswer: '愚蠢的/尴尬的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 143, word: 'consensus', expectedAnswer: '共识', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 143, word: 'census', expectedAnswer: '官方统计/人口普查', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 143, word: 'versus', expectedAnswer: '以...为对手', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 144, word: 'aid', expectedAnswer: '援助/帮助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 144, word: 'lid', expectedAnswer: '盖子/眼皮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 144, word: 'bid', expectedAnswer: '出价/努力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 144, word: 'hid(hide)', expectedAnswer: '躲藏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 144, word: 'rid', expectedAnswer: '摆脱/除去', userAnswer: '', isCorrect: null },







































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

    function normalizeNickname(rawNickname) {
        const cleaned = (rawNickname || '').trim();
        return cleaned || DEFAULT_NICKNAME;
    }

    function pickPreferredNickname(...candidates) {
        for (const candidate of candidates) {
            const trimmed = (candidate || '').trim();
            if (trimmed && trimmed !== DEFAULT_NICKNAME) {
                return trimmed;
            }
        }

        for (const candidate of candidates) {
            const trimmed = (candidate || '').trim();
            if (trimmed) {
                return trimmed;
            }
        }

        return DEFAULT_NICKNAME;
    }

    function loadProfileData() {
        try {
            const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('独立昵称档案加载失败:', error);
            return null;
        }
    }

    function saveProfileData() {
        try {
            const profile = {
                userId: systemState.userId || null,
                nickname: normalizeNickname(systemState.nickname)
            };
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    function ensureProfileIntegrity(options = {}) {
        const { preferInput = false } = options;
        const storedProfile = loadProfileData();
        const inputNickname = userNicknameInput ? userNicknameInput.value.trim() : '';
        const previousUserId = systemState.userId;
        const previousNickname = normalizeNickname(systemState.nickname);

        if (!systemState.userId && storedProfile?.userId) {
            systemState.userId = storedProfile.userId;
        }
        if (!systemState.userId) {
            systemState.userId = generateId();
        }

        const effectiveNickname = (preferInput && inputNickname)
            ? inputNickname
            : pickPreferredNickname(
                inputNickname,
                storedProfile?.nickname,
                systemState.nickname
            );

        systemState.nickname = normalizeNickname(effectiveNickname);

        if (userNicknameInput) {
            userNicknameInput.value = systemState.nickname;
        }

        saveProfileData();

        return (
            previousUserId !== systemState.userId ||
            previousNickname !== systemState.nickname
        );
    }

    function loadAdminSession() {
        try {
            const stored = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
            localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
            if (!stored) return null;
            const parsed = JSON.parse(stored);
            if (!parsed?.verifiedAt) return null;
            if ((Date.now() - new Date(parsed.verifiedAt).getTime()) > ADMIN_SESSION_TTL_MS) {
                sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
                return null;
            }
            return parsed;
        } catch (error) {
            console.warn('管理员会话加载失败:', error);
            return null;
        }
    }

    function saveAdminSession(session) {
        try {
            adminSession = session || null;
            if (session) {
                sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
                localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
            } else {
                sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
                localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
            }
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    function loadAcceptedRules() {
        try {
            const stored = localStorage.getItem(ACCEPTED_RULES_STORAGE_KEY);
            if (!stored) {
                return {
                    perWord: {},
                    globalSynonyms: [],
                    blockedPairs: []
                };
            }
            const parsed = JSON.parse(stored);
            const parsedGlobalSynonyms = Array.isArray(parsed?.globalSynonyms)
                ? parsed.globalSynonyms.filter(item =>
                    item
                    && typeof item.canonical === 'string'
                    && Array.isArray(item.members)
                )
                : [];
            return {
                perWord: parsed?.perWord || {},
                globalSynonyms: parsedGlobalSynonyms,
                blockedPairs: Array.isArray(parsed?.blockedPairs) ? parsed.blockedPairs : []
            };
        } catch (error) {
            console.warn('审核规则加载失败:', error);
            return {
                perWord: {},
                globalSynonyms: [],
                blockedPairs: []
            };
        }
    }

    function rebuildAcceptedGlobalSynonymMap() {
        const nextMap = {};
        (acceptedRules?.globalSynonyms || []).forEach(group => {
            if (!group || typeof group.canonical !== 'string' || !Array.isArray(group.members)) return;
            const normalizedMembers = [...new Set(
                group.members
                    .flatMap(item => expandMeaningVariants(item, { useGlobalSynonyms: false }))
                    .filter(Boolean)
            )];
            if (!normalizedMembers.length) return;
            normalizedMembers.forEach(member => {
                nextMap[member] = normalizedMembers;
            });
        });
        acceptedGlobalSynonymMap = nextMap;
    }

    function saveAcceptedRules() {
        try {
            localStorage.setItem(ACCEPTED_RULES_STORAGE_KEY, JSON.stringify(acceptedRules));
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    function mergeAcceptedRulesFromRows(rows) {
        const nextRules = {
            perWord: {},
            globalSynonyms: [],
            blockedPairs: []
        };

        (rows || []).forEach(row => {
            if (row.rule_type === 'per_word') {
                if (!nextRules.perWord[row.word_key]) {
                    nextRules.perWord[row.word_key] = [];
                }
                nextRules.perWord[row.word_key].push(row.answer_text);
            } else if (row.rule_type === 'global_synonym') {
                let targetGroup = nextRules.globalSynonyms.find(item => item.canonical === row.word_key);
                if (!targetGroup) {
                    targetGroup = {
                        canonical: row.word_key,
                        members: [row.word_key]
                    };
                    nextRules.globalSynonyms.push(targetGroup);
                }
                targetGroup.members.push(row.answer_text);
            } else if (row.rule_type === 'blocked') {
                nextRules.blockedPairs.push({
                    wordKey: row.word_key,
                    answer: row.answer_text
                });
            }
        });

        acceptedRules = nextRules;
        rebuildAcceptedGlobalSynonymMap();
        saveAcceptedRules();
    }

    async function syncAcceptedRulesFromSupabase() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('accepted_rules')
                .select('word_key, answer_text, rule_type')
                .eq('is_active', true);

            if (error) throw error;
            mergeAcceptedRulesFromRows(data || []);
        } catch (error) {
            console.warn('云端审核规则同步失败，将继续使用本地缓存规则:', error);
        }
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
            const storedProfile = loadProfileData();
            adminSession = loadAdminSession();
            acceptedRules = loadAcceptedRules();
            rebuildAcceptedGlobalSynonymMap();

            // 尝试加载新格式 v3.0
            const v3Data = localStorage.getItem(STORAGE_KEY);
            if (v3Data) {
                const parsed = JSON.parse(v3Data);
                wordGroups = parsed.wordGroups || [];
                // 修复：使用合并方式加载系统状态，防止新字段（如 userId）丢失
                systemState = { ...systemState, ...(parsed.systemState || {}) };
                if (storedProfile) {
                    systemState = {
                        ...systemState,
                        userId: systemState.userId || storedProfile.userId || null,
                        nickname: pickPreferredNickname(
                            storedProfile.nickname,
                            systemState.nickname
                        )
                    };
                }
                maimemoConfig = { ...maimemoConfig, ...(parsed.maimemoConfig || {}) };
                maimemoWordStatusMap = parsed.maimemoWordStatusMap || {};
                const storedSystemState = parsed.systemState || {};

                // 核心改进：即使有缓存，也要检查代码中的词库是否有更新
                syncWithCodeSource();

                const profileRepaired = ensureProfileIntegrity();
                const shouldPersistProfileRepair =
                    profileRepaired ||
                    (storedSystemState.userId || null) !== (systemState.userId || null) ||
                    normalizeNickname(storedSystemState.nickname) !== systemState.nickname;

                if (shouldPersistProfileRepair) {
                    saveData();
                }
                maimemoTokenInput.value = '';
                syncWeaknessToggle.checked = false;

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
                    ensureProfileIntegrity();
                    saveData();
                    updateDashboardUI();
                    return;
                } catch (e) {
                    console.error('迁移旧数据失败', e);
                }
            }

            // 无数据则初始化
            wordGroups = createDefaultWordGroups();
            ensureProfileIntegrity();
            saveData();
            updateDashboardUI();
        } catch (error) {
            warnStorageUnavailable(error);
            wordGroups = createDefaultWordGroups();
            ensureProfileIntegrity();
            updateDashboardUI();
        }
    }

    // 保存数据到 LocalStorage
    function saveData() {
        try {
            const dataToSave = {
                wordGroups: wordGroups,
                systemState: {
                    ...systemState,
                    nickname: normalizeNickname(systemState.nickname)
                },
                maimemoConfig: maimemoConfig,
                maimemoWordStatusMap: maimemoWordStatusMap,
                version: '3.0'
            };
            systemState.nickname = dataToSave.systemState.nickname;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            saveProfileData();
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    function backupDataBeforeCodeSync(reason) {
        try {
            const backupPayload = {
                reason,
                timestamp: new Date().toISOString(),
                appVersion: APP_VERSION,
                data: {
                    wordGroups,
                    systemState,
                    maimemoConfig,
                    maimemoWordStatusMap
                }
            };
            localStorage.setItem(PRE_SYNC_BACKUP_KEY, JSON.stringify(backupPayload));
        } catch (error) {
            warnStorageUnavailable(error);
        }
    }

    // 测试记录相关逻辑
    function loadTestRecords() {
        try {
            const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : { daily: [], weekly: [], monthly: [] };
        } catch (e) {
            console.error('加载记录失败:', e);
            return { daily: [], weekly: [], monthly: [] };
        }
    }

    function saveTestRecord(mode, result) {
        try {
            const records = loadTestRecords();
            const modeRecords = records[mode] || [];

            const newRecord = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                total: result.total,
                correct: result.correct,
                accuracy: result.accuracy,
                groups: JSON.parse(JSON.stringify(result.groups))
            };

            modeRecords.unshift(newRecord);
            if (modeRecords.length > 5) modeRecords.pop();

            records[mode] = modeRecords;
            localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
        } catch (e) {
            console.error('保存记录失败:', e);
        }
    }

    function renderRecordsList(mode) {
        const records = loadTestRecords();
        const modeRecords = records[mode] || [];

        const modeNames = { daily: '每日轻测', weekly: '每周复盘', monthly: '月度总测' };
        recordModalTitle.textContent = `${modeNames[mode]} - 历史记录`;

        recordsList.innerHTML = '';
        recordDetailView.style.display = 'none';
        recordsList.style.display = 'flex';

        if (modeRecords.length === 0) {
            recordsList.innerHTML = '<div class="records-empty">暂无记录，完成测试后将在这里显示</div>';
            return;
        }

        modeRecords.forEach(record => {
            const item = document.createElement('div');
            item.className = 'record-item';

            const accuracyVal = parseFloat(record.accuracy);
            let colorClass = 'accuracy-low';
            if (accuracyVal > 70) colorClass = 'accuracy-high';
            else if (accuracyVal >= 50) colorClass = 'accuracy-mid';

            const timeStr = new Date(record.timestamp).toLocaleString('zh-CN', {
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            });

            item.innerHTML = `
                <div class="record-info">
                    <div class="record-time">${timeStr}</div>
                    <div class="record-meta">
                        <span>答对: <strong class="record-count-correct">${record.correct}</strong></span>
                        <span style="margin-left: 10px;">答错: <strong class="record-count-incorrect">${record.total - record.correct}</strong></span>
                    </div>
                </div>
                <div class="record-accuracy ${colorClass}">${record.accuracy}%</div>
            `;

            item.onclick = () => showRecordDetail(record);
            recordsList.appendChild(item);
        });
    }

    function showRecordDetail(record) {
        recordsList.style.display = 'none';
        recordDetailView.style.display = 'block';
        detailRecordTime.textContent = new Date(record.timestamp).toLocaleString();

        recordDetailContent.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'record-detail-table';

        record.groups.forEach(group => {
            group.words.forEach(word => {
                const tr = document.createElement('tr');
                const rawAnswerText = (word.userAnswer || '').trim();
                const answerText = (!word.isCorrect && rawAnswerText === '未填写')
                    ? ''
                    : rawAnswerText;
                const expectedMeaning = word.expectedAnswer || '';
                tr.innerHTML = `
                    <td class="word">${word.word}</td>
                    <td class="record-answer-cell ${word.isCorrect ? 'correct' : 'incorrect'}">${answerText}</td>
                    <td class="record-meaning-cell">${expectedMeaning}</td>
                `;
                table.appendChild(tr);
            });
        });

        recordDetailContent.appendChild(table);
    }

    // 草稿保存相关逻辑
    let draftTimer = null;
    function saveDraft(mode, groups) {
        if (draftTimer) clearTimeout(draftTimer);
        draftTimer = setTimeout(() => {
            try {
                const draft = {
                    mode: mode,
                    timestamp: Date.now(),
                    groups: JSON.parse(JSON.stringify(groups))
                };
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
            } catch (e) {
                console.error('保存草稿失败:', e);
            }
        }, 1000); // 1秒防抖
    }

    function loadDraft() {
        try {
            const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!stored) return null;
            const draft = JSON.parse(stored);

            // 24小时过期检查
            if (Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
                clearDraft();
                return null;
            }
            return draft;
        } catch (e) {
            return null;
        }
    }

    function clearDraft() {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    function getTodayDateString() {
        return new Date().toLocaleDateString();
    }

    function parseStoredDate(value) {
        if (!value) return null;

        const directDate = new Date(value);
        if (!Number.isNaN(directDate.getTime())) {
            return directDate;
        }

        const match = String(value).match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
        if (!match) {
            return null;
        }

        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    function normalizeDateToStartOfDay(date) {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }

    function getElapsedDaysFromStoredDate(value) {
        const parsedDate = parseStoredDate(value);
        if (!parsedDate) return null;

        const today = normalizeDateToStartOfDay(new Date());
        const storedDate = normalizeDateToStartOfDay(parsedDate);
        return Math.floor((today - storedDate) / (1000 * 60 * 60 * 24));
    }

    function getMonthlyNextAvailableDate(value) {
        const parsedDate = parseStoredDate(value);
        if (!parsedDate) return null;

        const lastDate = normalizeDateToStartOfDay(parsedDate);
        const targetMonth = lastDate.getMonth() + 1;
        const desiredDay = lastDate.getDate();
        const maxDayOfTargetMonth = new Date(lastDate.getFullYear(), targetMonth + 1, 0).getDate();
        return new Date(
            lastDate.getFullYear(),
            targetMonth,
            Math.min(desiredDay, maxDayOfTargetMonth)
        );
    }

    function getRemainingDaysUntilDate(targetDate) {
        if (!targetDate) return null;

        const today = normalizeDateToStartOfDay(new Date());
        const normalizedTarget = normalizeDateToStartOfDay(targetDate);
        return Math.max(
            Math.floor((normalizedTarget - today) / (1000 * 60 * 60 * 24)),
            0
        );
    }

    function buildRetestConfirmMessage(modeLabel, defaultMessage, lastDate, minIntervalDays) {
        const elapsedDays = getElapsedDaysFromStoredDate(lastDate);
        if (elapsedDays === null || elapsedDays >= minIntervalDays) {
            return defaultMessage;
        }

        const remainingDays = Math.max(minIntervalDays - elapsedDays, 0);
        return `${defaultMessage}\n\n距上次${modeLabel}仅 ${elapsedDays} 天，建议至少间隔 ${minIntervalDays} 天；当前还差 ${remainingDays} 天。确定要提前开始吗？`;
    }

    function buildMonthlyRetestConfirmMessage(defaultMessage, lastDate) {
        const nextAvailableDate = getMonthlyNextAvailableDate(lastDate);
        if (!nextAvailableDate) {
            return defaultMessage;
        }

        const remainingDays = getRemainingDaysUntilDate(nextAvailableDate);
        if (remainingDays === 0) {
            return defaultMessage;
        }

        return `${defaultMessage}\n\n上次月度总测为 ${lastDate}，按自然月规则建议到 ${nextAvailableDate.toLocaleDateString()} 后再测；当前还差 ${remainingDays} 天。确定要提前开始吗？`;
    }

    function awakenExpiredAPoolGroups() {
        const now = new Date();
        let changed = false;

        wordGroups.forEach(groupObj => {
            if (groupObj.pool !== 'a' || !groupObj.enteredAPoolDate) {
                return;
            }

            const enteredDate = new Date(groupObj.enteredAPoolDate);
            const diffDays = (now - enteredDate) / (1000 * 60 * 60 * 24);
            if (diffDays >= SETTINGS.awakenDays) {
                groupObj.pool = 'main';
                groupObj.tier = 'fuzzy';
                groupObj.enteredAPoolDate = null;
                changed = true;
            }
        });

        if (changed) {
            saveData();
            updateDashboardUI();
        }
    }

    async function checkDraftOnStart(mode) {
        const draft = loadDraft();
        if (draft && draft.mode === mode) {
            const answeredCount = draft.groups.reduce((acc, g) =>
                acc + g.words.filter(w => w.userAnswer && w.userAnswer.trim()).length, 0
            );
            const totalCount = draft.groups.reduce((acc, g) => acc + g.words.length, 0);

            const confirmed = await openTestActionConfirm(
                '恢复草稿',
                `检测到未完成的测试（已答 ${answeredCount} / 共 ${totalCount} 题），是否继续？`
            );

            if (confirmed) {
                return draft.groups;
            } else {
                clearDraft();
            }
        }
        return null;
    }

    // 更新仪表盘显示
    function updateDashboardUI() {
        const mainPool = wordGroups.filter(g => g.pool === 'main');
        const aPool = wordGroups.filter(g => g.pool === 'a');

        mainPoolCount.textContent = mainPool.length;
        aPoolCount.textContent = aPool.length;

        const today = getTodayDateString();

        dailyStatus.textContent = systemState.lastDailyTestDate === today ? '已完成' : '未开始';
        dailyStatus.style.color = systemState.lastDailyTestDate === today ? '#28a745' : '#666';

        const weeklyElapsedDays = getElapsedDaysFromStoredDate(systemState.lastWeeklyReviewDate);
        if (!systemState.lastWeeklyReviewDate) {
            weeklyStatus.textContent = '待进行';
        } else if (weeklyElapsedDays === null) {
            weeklyStatus.textContent = `上次:${systemState.lastWeeklyReviewDate}`;
        } else if (weeklyElapsedDays >= SETTINGS.weeklyMinIntervalDays) {
            weeklyStatus.textContent = `可进行（上次:${systemState.lastWeeklyReviewDate}）`;
        } else {
            weeklyStatus.textContent = `冷却中，还差 ${SETTINGS.weeklyMinIntervalDays - weeklyElapsedDays} 天`;
        }

        const monthlyNextAvailableDate = getMonthlyNextAvailableDate(systemState.lastMonthlyTestDate);
        const monthlyRemainingDays = getRemainingDaysUntilDate(monthlyNextAvailableDate);
        if (!systemState.lastMonthlyTestDate) {
            monthlyStatus.textContent = '待进行';
        } else if (!monthlyNextAvailableDate || monthlyRemainingDays === null) {
            monthlyStatus.textContent = `上次:${systemState.lastMonthlyTestDate}`;
        } else if (monthlyRemainingDays === 0) {
            monthlyStatus.textContent = `可进行（上次:${systemState.lastMonthlyTestDate}）`;
        } else {
            monthlyStatus.textContent = `冷却中，还差 ${monthlyRemainingDays} 天`;
        }
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

    function shuffleArray(items) {
        if (!Array.isArray(items) || items.length <= 1) {
            return Array.isArray(items) ? [...items] : [];
        }

        const isSameOrder = (left, right) =>
            left.length === right.length && left.every((item, index) => item === right[index]);

        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        if (isSameOrder(shuffled, items)) {
            // 如果本轮随机结果和原顺序完全一致，至少做一次循环位移，避免“看起来没打乱”。
            shuffled.push(shuffled.shift());
        }

        return shuffled;
    }

    function shuffleWordsWithinGroups(groups) {
        groups.forEach(group => {
            group.words = shuffleArray(group.words || []);
        });
        return groups;
    }

    function syncCurrentTestGroupsBackToWordGroups() {
        currentTestGroups.forEach(testGroup => {
            const liveGroup = wordGroups.find(group => group === testGroup)
                || wordGroups.find(group => getGroupWordSignature(group) === getGroupWordSignature(testGroup))
                || wordGroups.find(group =>
                    group.groupId === testGroup.groupId
                    && getGroupWordListSignature(group) === getGroupWordListSignature(testGroup)
                );

            if (!liveGroup) {
                return;
            }

            liveGroup.pool = testGroup.pool;
            liveGroup.tier = testGroup.tier;
            liveGroup.correctRatesHistory = [...(testGroup.correctRatesHistory || [])];
            liveGroup.consecutiveQualified = testGroup.consecutiveQualified || 0;
            liveGroup.lastTestDate = testGroup.lastTestDate || null;
            liveGroup.enteredAPoolDate = testGroup.enteredAPoolDate || null;

            const liveWordsByKey = new Map(
                (liveGroup.words || []).map(word => [
                    (word?.word || '').trim().toLowerCase(),
                    word
                ])
            );

            testGroup.words.forEach(testWord => {
                const liveWord = liveWordsByKey.get((testWord.word || '').trim().toLowerCase());
                if (!liveWord) {
                    return;
                }

                liveWord.userAnswer = testWord.userAnswer || '';
                liveWord.isCorrect = typeof testWord.isCorrect === 'boolean' ? testWord.isCorrect : null;
                liveWord.errorCount = testWord.errorCount || 0;
            });
        });
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
            wordObj.judgeStatus = null;
            saveData();

            // 触发草稿自动保存
            if (currentTestMode) {
                saveDraft(currentTestMode, currentTestGroups);
            }

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
        awakenExpiredAPoolGroups();
        const today = new Date();
        const mainPoolGroups = wordGroups.filter(g => g.pool === 'main');
        const eligibleGroups = [];
        const forcedGroups = [];

        mainPoolGroups.forEach(groupObj => {
            if (!groupObj.lastTestDate) {
                eligibleGroups.push(groupObj);
                return;
            }

            const lastDate = new Date(groupObj.lastTestDate);
            const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);

            if (diffDays >= SETTINGS.stuckDays) {
                forcedGroups.push({ group: groupObj, diffDays });
                eligibleGroups.push(groupObj);
                return;
            }

            if (diffDays >= SETTINGS.minIntervalDays) {
                eligibleGroups.push(groupObj);
            }
        });

        if (eligibleGroups.length === 0) {
            openInfoModal('暂时无法开始', '总池中没有满足间隔要求的词组，请休息一下或尝试其他模式。');
            return [];
        }

        const count = Math.min(SETTINGS.dailyDrawCount, eligibleGroups.length);
        const selected = forcedGroups
            .sort((a, b) => b.diffDays - a.diffDays)
            .slice(0, count)
            .map(item => item.group);

        // 用原有权重逻辑补齐剩余题量
        const remainingGroups = eligibleGroups.filter(groupObj => !selected.includes(groupObj));
        const weightedPool = [];
        remainingGroups.forEach(g => {
            let weight = 1;

            // 基础权重判定
            if (g.tier === 'weak') weight = SETTINGS.weakTierWeight;
            else if (g.tier === 'new') weight = SETTINGS.newTierWeight;
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

        // 随机补齐剩余题量
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
        awakenExpiredAPoolGroups();
        const aPool = wordGroups.filter(g => g.pool === 'a');
        if (aPool.length === 0) {
            openInfoModal('当前无法开始', 'A池（熟练池）目前为空，请先完成每日轻测以积累熟练词。');
            return [];
        }

        const count = aPool.length < SETTINGS.weeklyAllThreshold
            ? aPool.length
            : Math.max(SETTINGS.weeklyMinGroups, Math.floor(aPool.length * SETTINGS.weeklyReviewRatio));
        const selected = [];
        const tempPool = [...aPool];

        for (let i = 0; i < Math.min(count, aPool.length); i++) {
            const idx = Math.floor(Math.random() * tempPool.length);
            selected.push(tempPool.splice(idx, 1)[0]);
        }
        return selected;
    }

    function generateMonthlyTest() {
        awakenExpiredAPoolGroups();

        // 月度总测抽取全部词组的约 60%
        const mainPool = [...wordGroups];
        const count = mainPool.length === 0 ? 0 : Math.max(1, Math.floor(mainPool.length * 0.6)); // 至少 1 题
        const selected = [];
        const tempPool = [...mainPool];

        for (let i = 0; i < Math.min(count, mainPool.length); i++) {
            const idx = Math.floor(Math.random() * tempPool.length);
            selected.push(tempPool.splice(idx, 1)[0]);
        }
        return selected;
    }

    // 绑定仪表盘按钮事件
    startDailyBtn.addEventListener('click', async () => {
        const draftGroups = await checkDraftOnStart('daily');
        if (draftGroups) {
            currentTestGroups = draftGroups;
            currentTestMode = 'daily';
            currentTestSnapshot = createCurrentTestSnapshot();
            updateTestActionPlacement(false);
            renderTable();
            dashboard.style.display = 'none';
            return;
        }

        const dailyMessage = buildRetestConfirmMessage(
            '每日轻测',
            `开始今日轻测？将从总池中加权抽取 ${SETTINGS.dailyDrawCount} 组词。`,
            systemState.lastDailyTestDate,
            SETTINGS.minIntervalDays
        );
        const confirmed = await openTestActionConfirm('今日轻测', dailyMessage);
        if (confirmed) {
            const nextGroups = shuffleWordsWithinGroups(generateDailyTest());
            if (nextGroups.length === 0) return;

            currentTestSnapshot = createCurrentTestSnapshot();
            currentTestGroups = nextGroups;
            currentTestMode = 'daily';
            resetCurrentTestAnswers();
            updateTestActionPlacement(false);
            renderTable();
            dashboard.style.display = 'none';
            saveDraft(currentTestMode, currentTestGroups);
        }
    });

    startWeeklyBtn.addEventListener('click', async () => {
        const draftGroups = await checkDraftOnStart('weekly');
        if (draftGroups) {
            currentTestGroups = draftGroups;
            currentTestMode = 'weekly';
            currentTestSnapshot = createCurrentTestSnapshot();
            updateTestActionPlacement(false);
            renderTable();
            dashboard.style.display = 'none';
            return;
        }

        const weeklyMessage = buildRetestConfirmMessage(
            '每周复盘',
            '开始每周复盘？将从 A 池中按动态题量抽取词组，检测是否退化。',
            systemState.lastWeeklyReviewDate,
            SETTINGS.weeklyMinIntervalDays
        );
        const confirmed = await openTestActionConfirm('每周复盘', weeklyMessage);
        if (confirmed) {
            const nextGroups = shuffleWordsWithinGroups(generateWeeklyReview());
            if (nextGroups.length === 0) return;

            currentTestSnapshot = createCurrentTestSnapshot();
            currentTestGroups = nextGroups;
            currentTestMode = 'weekly';
            resetCurrentTestAnswers();
            updateTestActionPlacement(false);
            renderTable();
            dashboard.style.display = 'none';
            saveDraft(currentTestMode, currentTestGroups);
        }
    });

    startMonthlyBtn.addEventListener('click', async () => {
        const draftGroups = await checkDraftOnStart('monthly');
        if (draftGroups) {
            currentTestGroups = draftGroups;
            currentTestMode = 'monthly';
            currentTestSnapshot = createCurrentTestSnapshot();
            updateTestActionPlacement(false);
            renderTable();
            dashboard.style.display = 'none';
            return;
        }

        const monthlyMessage = buildMonthlyRetestConfirmMessage(
            '确定开始月度总测吗？将从全部词组中抽取约 60% 进行筛查，并按成绩分层处理 A 池状态。',
            systemState.lastMonthlyTestDate
        );
        const confirmed = await openTestActionConfirm('月度总测', monthlyMessage);
        if (confirmed) {
            const nextGroups = shuffleWordsWithinGroups(generateMonthlyTest());
            if (nextGroups.length === 0) return;

            currentTestSnapshot = createCurrentTestSnapshot();
            currentTestGroups = nextGroups;
            currentTestMode = 'monthly';
            resetCurrentTestAnswers();
            updateTestActionPlacement(false);
            renderTable();
            dashboard.style.display = 'none';
            saveDraft(currentTestMode, currentTestGroups);
        }
    });

    // 绑定记录按钮事件
    recordBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mode = btn.dataset.mode;
            renderRecordsList(mode);
            recordsModal.classList.add('open');
        });
    });

    closeRecordsBtn.addEventListener('click', () => {
        recordsModal.classList.remove('open');
    });

    backToRecordsBtn.addEventListener('click', () => {
        recordDetailView.style.display = 'none';
        recordsList.style.display = 'flex';
    });

    function resetCurrentTestAnswers() {
        currentTestGroups.forEach(g => {
            g.words.forEach(w => {
                w.userAnswer = '';
                w.isCorrect = null;
                w.judgeStatus = null;
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

    if (refreshReviewBtn) {
        refreshReviewBtn.addEventListener('click', async () => {
            await fetchReviewQueue();
        });
    }

    reviewFilterButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const nextStatus = button.dataset.status || 'pending';
            if (nextStatus === currentReviewStatusFilter) return;
            currentReviewStatusFilter = nextStatus;
            updateReviewFilterButtons();
            await fetchReviewQueue();
        });
    });

    if (exitReviewBtn) {
        exitReviewBtn.addEventListener('click', () => {
            saveAdminSession(null);
            hideAdminReviewPanel();
        });
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
        tr.classList.remove('correct', 'synonym', 'pending', 'incorrect');
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

    function openInfoModal(title, message) {
        infoModalTitle.textContent = title;
        infoModalMessage.textContent = message;
        infoModal.classList.add('open');

        return new Promise((resolve) => {
            infoModalResolver = resolve;
        });
    }

    function closeInfoModal() {
        infoModal.classList.remove('open');
        if (infoModalResolver) {
            infoModalResolver(true);
            infoModalResolver = null;
        }
    }

    const COMPATIBILITY_CHAR_MAP = {
        '⺠': '民', '⻓': '长', '⻋': '车', '⻅': '见', '⻉': '贝', '⻔': '门',
        '⻆': '角', '⻛': '风', '⻝': '食', '⻢': '马', '⻜': '飞', '⻩': '黄',
        '⻥': '鱼', '⻦': '鸟', '⻬': '齐', '⻤': '鬼', '⻚': '页', '⻣': '骨',
        '⻘': '青', '⻰': '龙', '⻮': '齿', '⺓': '纟', '⻨': '麦'
    };

    function normalizeAnswerString(str) {
        if (!str) return '';
        return [...str.normalize('NFKC')]
            .map(char => COMPATIBILITY_CHAR_MAP[char] || char)
            .join('')
            .replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, '');
    }

    function expandNearSynonymVariants(str, options = {}) {
        const { useGlobalSynonyms = true } = options;
        const normalized = normalizeAnswerString(str);
        if (!normalized) return [];

        const queue = [normalized];
        const variants = new Set();

        while (queue.length > 0) {
            const current = queue.pop();
            if (!current || variants.has(current)) {
                continue;
            }

            variants.add(current);

            const withoutLeadingMarker = current.replace(/^(将|把|使|令)/, '');
            if (withoutLeadingMarker && withoutLeadingMarker !== current) {
                queue.push(withoutLeadingMarker);
            }

            if (current.endsWith('的')) {
                queue.push(current.slice(0, -1));
            }

            const synonymGroup = GLOBAL_SYN_DICT_MAP[current];
            if (useGlobalSynonyms && synonymGroup) {
                synonymGroup.forEach(item => queue.push(item));
            }

            const acceptedSynonymGroup = useGlobalSynonyms ? acceptedGlobalSynonymMap[current] : null;
            if (acceptedSynonymGroup) {
                acceptedSynonymGroup.forEach(item => queue.push(item));
            }
        }

        return [...variants];
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

    function expandMeaningVariants(str, options = {}) {
        return expandOptionalAnswerVariants(str)
            .flatMap(ans => expandNearSynonymVariants(ans, options))
            .filter(Boolean);
    }

    function getAcceptedWordAnswers(wordKey) {
        const entries = acceptedRules?.perWord?.[wordKey];
        if (!Array.isArray(entries)) return [];
        return [...new Set(
            entries.flatMap(item => expandMeaningVariants(item, { useGlobalSynonyms: false }))
        )];
    }

    function isBlockedAnswer(wordKey, userAnswer) {
        const normalizedUserVariants = new Set(expandMeaningVariants(userAnswer, { useGlobalSynonyms: true }));
        return (acceptedRules?.blockedPairs || []).some(item => {
            if (!item || item.wordKey !== wordKey) return false;
            const blockedVariants = expandMeaningVariants(item.answer, { useGlobalSynonyms: true });
            return blockedVariants.some(variant => normalizedUserVariants.has(variant));
        });
    }

    function getPossibleAnswers(wordObj) {
        return [...new Set(
            wordObj.expectedAnswer
                .split('/')
                .flatMap(ans => expandMeaningVariants(ans, { useGlobalSynonyms: false }))
                .filter(Boolean)
        )];
    }

    function getKaoyanDictEntry(wordKey) {
        const rawEntry = kaoyanDict?.[wordKey];
        if (!rawEntry) {
            return { translations: [], synonyms: [], collocations: [] };
        }

        if (Array.isArray(rawEntry)) {
            return { translations: rawEntry, synonyms: [], collocations: [] };
        }

        return {
            translations: Array.isArray(rawEntry.translations) ? rawEntry.translations : [],
            synonyms: Array.isArray(rawEntry.synonyms) ? rawEntry.synonyms : [],
            collocations: Array.isArray(rawEntry.collocations) ? rawEntry.collocations : []
        };
    }

    function getKaoyanDictAnswers(wordKey) {
        const entry = getKaoyanDictEntry(wordKey);
        return [...new Set(
            [...entry.translations, ...entry.synonyms]
                .flatMap(item => expandMeaningVariants(item, { useGlobalSynonyms: false }))
                .filter(Boolean)
        )];
    }

    function expandGlobalCandidateAnswers(candidateAnswers) {
        return [...new Set(
            candidateAnswers.flatMap(answer => expandNearSynonymVariants(answer, { useGlobalSynonyms: true }))
        )];
    }

    function isMeaningMatch(userAnswer, candidateAnswers, options = {}) {
        const { useGlobalSynonyms = false } = options;
        const userVariants = new Set(expandMeaningVariants(userAnswer, { useGlobalSynonyms }));
        const targetAnswers = useGlobalSynonyms
            ? expandGlobalCandidateAnswers(candidateAnswers)
            : candidateAnswers;
        return targetAnswers.some(answer => userVariants.has(answer));
    }

    function isPlausiblePendingAnswer(userAnswer) {
        const normalized = normalizeAnswerString(userAnswer);
        return normalized.length >= 2 && /[\u4e00-\u9fff]/.test(normalized);
    }

    async function reportPendingAnswer(wordObj, userAnswer) {
        if (!supabase) return;

        try {
            const { error } = await supabase.rpc('report_pending_answer', {
                p_word: wordObj.word,
                p_word_key: (wordObj.word || '').trim().toLowerCase(),
                p_group_id: wordObj.group || null,
                p_standard_answers: wordObj.expectedAnswer,
                p_user_answer_raw: userAnswer,
                p_user_answer_normalized: normalizeAnswerString(userAnswer),
                p_user_id: systemState.userId,
                p_user_name: systemState.nickname,
                p_test_mode: currentTestMode || 'unknown'
            });

            if (error) {
                console.warn('上报待审核答案失败:', error);
            }
        } catch (error) {
            console.warn('待审核答案上报异常:', error);
        }
    }

    function judgeWordAnswer(wordObj, userAnswer) {
        const wordKey = (wordObj.word || '').trim().toLowerCase();
        const possibleAnswers = getPossibleAnswers(wordObj);
        const acceptedWordAnswers = getAcceptedWordAnswers(wordKey);
        let dictAnswers = [];

        if (isBlockedAnswer(wordKey, userAnswer)) {
            return {
                status: JUDGE_STATUS.INCORRECT,
                possibleAnswers,
                dictAnswers,
                acceptedWordAnswers
            };
        }

        if (isMeaningMatch(userAnswer, possibleAnswers)) {
            return {
                status: JUDGE_STATUS.CORRECT,
                possibleAnswers,
                dictAnswers,
                acceptedWordAnswers
            };
        }

        if (kaoyanDict) {
            dictAnswers = getKaoyanDictAnswers(wordKey);
            if (isMeaningMatch(userAnswer, dictAnswers)) {
                return {
                    status: JUDGE_STATUS.CORRECT,
                    possibleAnswers,
                    dictAnswers,
                    acceptedWordAnswers
                };
            }
        }

        const synonymCandidates = [
            ...possibleAnswers,
            ...dictAnswers,
            ...acceptedWordAnswers
        ];
        if (isMeaningMatch(userAnswer, [...new Set(synonymCandidates)], { useGlobalSynonyms: true })) {
            return {
                status: JUDGE_STATUS.SYNONYM,
                possibleAnswers,
                dictAnswers,
                acceptedWordAnswers
            };
        }

        if (acceptedWordAnswers.length > 0 && isMeaningMatch(userAnswer, acceptedWordAnswers, { useGlobalSynonyms: true })) {
            return {
                status: JUDGE_STATUS.SYNONYM,
                possibleAnswers,
                dictAnswers,
                acceptedWordAnswers
            };
        }

        return {
            status: isPlausiblePendingAnswer(userAnswer) ? JUDGE_STATUS.PENDING : JUDGE_STATUS.INCORRECT,
            possibleAnswers,
            dictAnswers,
            acceptedWordAnswers
        };
    }

    function setAdminReviewStatus(type, message) {
        if (!adminReviewStatus) return;
        adminReviewStatus.className = 'dict-status';
        adminReviewStatus.style.display = message ? 'flex' : 'none';
        if (!message) {
            adminReviewStatus.textContent = '';
            return;
        }
        adminReviewStatus.classList.add(`dict-status-${type}`);
        adminReviewStatus.textContent = message;
    }

    function showAdminReviewPanel() {
        if (adminReviewPanel) {
            adminReviewPanel.classList.add('open');
        }
        updateReviewFilterButtons();
        dashboard.style.display = 'none';
        testerHeader.style.display = 'none';
        wordTable.style.display = 'none';
        testSummary.style.display = 'none';
        setFloatingNavVisible(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function hideAdminReviewPanel() {
        if (adminReviewPanel) {
            adminReviewPanel.classList.remove('open');
        }
        dashboard.style.display = 'block';
        renderTable();
    }

    function updateReviewFilterButtons() {
        reviewFilterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.status === currentReviewStatusFilter);
        });
    }

    function getReviewStatusLabel(status) {
        if (status === 'approved') return '已通过';
        if (status === 'rejected') return '已拒绝';
        return '待审核';
    }

    function getReviewScopeLabel(scope) {
        if (scope === 'global_synonym') return '全局近义';
        if (scope === 'per_word') return '仅本词正确';
        if (scope === 'blocked') return '已拦截';
        return '未设置';
    }

    function extractPrimaryMeaningKey(standardAnswers) {
        if (!standardAnswers) return '';
        const firstMeaning = String(standardAnswers)
            .split(/[\/；;|]/)
            .map(item => item.trim())
            .find(Boolean) || '';
        return normalizeAnswerString(firstMeaning);
    }

    function renderReviewList(rows) {
        if (!adminReviewList || !adminReviewMeta) return;

        adminReviewMeta.textContent = `${getReviewStatusLabel(currentReviewStatusFilter)}聚合项 ${rows.length} 条`;
        adminReviewList.innerHTML = '';

        if (!rows.length) {
            adminReviewList.innerHTML = `<div class="admin-review-empty">当前没有${getReviewStatusLabel(currentReviewStatusFilter)}项。</div>`;
            return;
        }

        rows.forEach(row => {
            const card = document.createElement('div');
            card.className = 'review-card';
            const primaryActionLabel = currentReviewStatusFilter === 'approved'
                ? '恢复待审核'
                : currentReviewStatusFilter === 'rejected'
                    ? '改判通过'
                    : '通过';
            const primaryActionStatus = currentReviewStatusFilter === 'approved'
                ? 'pending'
                : currentReviewStatusFilter === 'rejected'
                    ? 'approved'
                    : 'approved';
            const secondaryActionLabel = currentReviewStatusFilter === 'approved'
                ? '改判拒绝'
                : currentReviewStatusFilter === 'rejected'
                    ? '恢复待审核'
                    : '拒绝';
            const secondaryActionStatus = currentReviewStatusFilter === 'approved'
                ? 'rejected'
                : currentReviewStatusFilter === 'rejected'
                    ? 'pending'
                    : 'rejected';
            const tertiaryActionLabel = currentReviewStatusFilter === 'pending' ? '暂缓' : '';
            const currentScopeLabel = row.review_scope ? getReviewScopeLabel(row.review_scope) : '';
            card.innerHTML = `
                <div class="review-card-header">
                    <div>
                        <div class="review-card-title">${row.word || '-'}</div>
                        <div class="review-card-status ${currentReviewStatusFilter}">${getReviewStatusLabel(currentReviewStatusFilter)}</div>
                    </div>
                    <div class="review-card-count">累计 ${row.total_count || 0} 次</div>
                </div>
                <div class="review-card-line"><strong>标准答案：</strong>${row.standard_answers || '-'}</div>
                <div class="review-card-line"><strong>用户答案：</strong>${row.user_answer_raw || '-'}</div>
                <div class="review-card-line"><strong>涉及用户：</strong>${row.distinct_user_count || 0} 人</div>
                <div class="review-card-line"><strong>示例用户：</strong>${row.sample_user_names || '匿名'}</div>
                <div class="review-card-line"><strong>最近模式：</strong>${row.latest_test_mode || '-'}</div>
                ${currentScopeLabel ? `<div class="review-card-line"><strong>当前规则：</strong>${currentScopeLabel}</div>` : ''}
                ${currentReviewStatusFilter !== 'rejected' ? `
                <div class="review-card-scope-row">
                    <label class="review-card-scope-label" for="review-scope-${row.aggregate_key}">通过方式</label>
                    <select id="review-scope-${row.aggregate_key}" class="review-card-scope-select">
                        <option value="per_word" ${row.review_scope === 'per_word' || !row.review_scope ? 'selected' : ''}>仅本词正确</option>
                        <option value="global_synonym" ${row.review_scope === 'global_synonym' ? 'selected' : ''}>全局近义</option>
                    </select>
                </div>` : ''}
                <textarea class="review-card-note" placeholder="审核备注（可选）"></textarea>
                <div class="review-card-actions">
                    <button class="btn-primary-sm review-primary-btn">${primaryActionLabel}</button>
                    <button class="btn-secondary-sm review-secondary-btn">${secondaryActionLabel}</button>
                    ${tertiaryActionLabel ? `<button class="btn-secondary-sm review-tertiary-btn">${tertiaryActionLabel}</button>` : ''}
                </div>
            `;

            const noteInput = card.querySelector('.review-card-note');
            const primaryBtn = card.querySelector('.review-primary-btn');
            const secondaryBtn = card.querySelector('.review-secondary-btn');
            const tertiaryBtn = card.querySelector('.review-tertiary-btn');
            const scopeSelect = card.querySelector('.review-card-scope-select');

            primaryBtn.addEventListener('click', async () => {
                const nextScope = primaryActionStatus === 'approved'
                    ? (scopeSelect?.value || row.review_scope || 'per_word')
                    : null;
                await handleReviewDecision(row, primaryActionStatus, noteInput.value.trim(), nextScope);
            });
            secondaryBtn.addEventListener('click', async () => {
                const nextScope = secondaryActionStatus === 'approved'
                    ? (scopeSelect?.value || row.review_scope || 'per_word')
                    : null;
                await handleReviewDecision(row, secondaryActionStatus, noteInput.value.trim(), nextScope);
            });
            if (tertiaryBtn) {
                tertiaryBtn.addEventListener('click', async () => {
                    await handleReviewDecision(row, 'pending', noteInput.value.trim(), null);
                });
            }

            adminReviewList.appendChild(card);
        });
    }

    async function fetchReviewQueue() {
        if (!supabase) {
            setAdminReviewStatus('failed', 'Supabase 未连接，暂时无法读取审核列表。');
            renderReviewList([]);
            return;
        }
        if (!adminSession?.secret) {
            setAdminReviewStatus('failed', '管理员会话已失效，请重新验证密钥。');
            renderReviewList([]);
            return;
        }

        setAdminReviewStatus('loading', '待审核列表加载中...');
        try {
            const { data, error } = await supabase.rpc('fetch_review_aggregates_v2', {
                p_secret: adminSession.secret,
                p_review_status: currentReviewStatusFilter
            });

            if (error) throw error;
            renderReviewList(data || []);
            setAdminReviewStatus('ready', `${getReviewStatusLabel(currentReviewStatusFilter)}列表已就绪，共 ${data?.length || 0} 条聚合项。`);
        } catch (error) {
            console.error('获取审核队列失败:', error);
            if (String(error?.message || '').includes('invalid admin secret')) {
                saveAdminSession(null);
                setAdminReviewStatus('failed', '管理员会话已失效，请重新输入密钥验证。');
                renderReviewList([]);
                return;
            }
            renderReviewList([]);
            setAdminReviewStatus('failed', '获取审核列表失败，请稍后重试。');
        }
    }

    async function handleReviewDecision(row, status, note, ruleScope = null) {
        if (!supabase) {
            await openInfoModal('无法提交', 'Supabase 未连接，暂时无法提交审核结果。');
            return;
        }
        if (!adminSession?.secret) {
            await openInfoModal('会话失效', '管理员会话已失效，请重新验证后再操作。');
            return;
        }

        try {
            const globalCanonicalKey = ruleScope === 'global_synonym'
                ? (row.global_canonical_key || extractPrimaryMeaningKey(row.standard_answers))
                : (row.global_canonical_key || null);
            const { error } = await supabase.rpc('apply_review_decision_v2', {
                p_secret: adminSession.secret,
                p_word_key: row.word_key,
                p_user_answer_normalized: row.user_answer_normalized,
                p_status: status,
                p_note: note || null,
                p_rule_scope: ruleScope,
                p_global_canonical_key: globalCanonicalKey
            });

            if (error) throw error;
            await syncAcceptedRulesFromSupabase();
            await fetchReviewQueue();
        } catch (error) {
            console.error('提交审核结果失败:', error);
            if (String(error?.message || '').includes('invalid admin secret')) {
                saveAdminSession(null);
                await openInfoModal('会话失效', '管理员会话已失效，请重新验证后再操作。');
                return;
            }
            await openInfoModal('提交失败', '提交审核结果失败，请稍后重试。');
        }
    }

    // 提交检测所有单词
    submitTestBtn.addEventListener('click', async () => {
        if (kaoyanDictState.status === 'loading') {
            submitTestBtn.disabled = true;
            const originalText = submitTestBtn.textContent;
            submitTestBtn.textContent = '词库加载中...';
            try {
                await kaoyanDictReadyPromise;
            } finally {
                submitTestBtn.disabled = false;
                submitTestBtn.textContent = originalText;
            }
        }

        let globalCorrectCount = 0;
        let globalTotalCount = 0;
        const errorGroups = new Set();
        const pendingReportTasks = [];
        const today = new Date().toLocaleDateString();

        currentTestGroups.forEach(groupObj => {
            let groupCorrectCount = 0;
            const groupTotalCount = groupObj.words.length;

            groupObj.words.forEach(wordObj => {
                globalTotalCount++;
                const userAns = wordObj.userAnswer || '';
                wordObj.judgeStatus = null;

                if (userAns.trim() === '') {
                    wordObj.isCorrect = false;
                    wordObj.judgeStatus = JUDGE_STATUS.INCORRECT;
                } else {
                    const judgeResult = judgeWordAnswer(wordObj, userAns);
                    wordObj.judgeStatus = judgeResult.status;
                    wordObj.isCorrect = judgeResult.status === JUDGE_STATUS.CORRECT || judgeResult.status === JUDGE_STATUS.SYNONYM;
                    if (judgeResult.status === JUDGE_STATUS.PENDING) {
                        pendingReportTasks.push(reportPendingAnswer({
                            ...wordObj,
                            group: groupObj.groupId
                        }, userAns));
                    }
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
                } else if (currentRate < SETTINGS.graduationThreshold) {
                    groupObj.pool = 'main';
                    groupObj.tier = 'fuzzy';
                    groupObj.enteredAPoolDate = null;
                } else {
                    groupObj.pool = 'a';
                    if (!groupObj.enteredAPoolDate) {
                        groupObj.enteredAPoolDate = new Date().toISOString();
                    }
                }
            }
        });

        if (currentTestMode === 'daily') systemState.lastDailyTestDate = today;
        else if (currentTestMode === 'weekly') systemState.lastWeeklyReviewDate = today;
        else if (currentTestMode === 'monthly') systemState.lastMonthlyTestDate = today;

        if (pendingReportTasks.length > 0) {
            await Promise.allSettled(pendingReportTasks);
        }

        syncCurrentTestGroupsBackToWordGroups();
        saveData();

        if (globalTotalCount > 0) {
            const incorrectCount = globalTotalCount - globalCorrectCount;
            const accuracy = ((globalCorrectCount / globalTotalCount) * 100).toFixed(1);

            // 保存历史记录
            saveTestRecord(currentTestMode, {
                total: globalTotalCount,
                correct: globalCorrectCount,
                accuracy: accuracy,
                groups: currentTestGroups
            });

            // 清除草稿
            clearDraft();

            currentTestSnapshot = null;
            renderTable();
            updateDashboardUI();
            // 提交后仍停留在当前独立测试页，只有退出检测时才回主页面
            dashboard.style.display = 'none';

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

    infoModalConfirmBtn.addEventListener('click', () => {
        closeInfoModal();
    });

    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            closeInfoModal();
        }
    });

    resetTestBtn.addEventListener('click', async () => {
        const confirmed = await openTestActionConfirm('重新测试', '确定要清空当前页面答案并重新开始吗？');
        if (confirmed) {
            currentTestGroups.forEach(groupObj => {
                groupObj.words.forEach(wordObj => {
                    wordObj.userAnswer = '';
                    wordObj.isCorrect = null;
                    wordObj.judgeStatus = null;
                });
            });
            saveData();

            // 更新草稿
            if (currentTestMode) {
                saveDraft(currentTestMode, currentTestGroups);
            }

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

    userNicknameInput.addEventListener('change', () => {
        const draftNickname = userNicknameInput.value.trim();
        if (!draftNickname) return;
        userNicknameInput.value = normalizeNickname(draftNickname);
    });

    saveNicknameBtn.addEventListener('click', async () => {
        const nickname = userNicknameInput.value.trim();
        if (!nickname) {
            await openInfoModal('无法保存', '请先输入昵称后再保存。');
            return;
        }

        maimemoConfig.syncWeakness = false;
        maimemoConfig.token = '';
        systemState.nickname = normalizeNickname(nickname);
        userNicknameInput.value = systemState.nickname;

        ensureProfileIntegrity({ preferInput: true });
        saveData();

        let syncStatus = '（本地昵称已保存）';
        if (supabase) {
            try {
                const { data: updatedRows, error: updateError } = await supabase
                    .from('leaderboard')
                    .update({ nickname: systemState.nickname })
                    .eq('user_id', systemState.userId)
                    .select('id');

                if (updateError) throw updateError;

                if (Array.isArray(updatedRows) && updatedRows.length > 0) {
                    syncStatus = '（排行榜昵称已同步）';
                }
            } catch (err) {
                console.error('同步排行榜昵称失败:', err);
                syncStatus = '（排行榜同步失败，将在下次提交时重试）';
            }
        }

        settingsModal.classList.remove('open');
        await openInfoModal('已保存', `昵称已保存。${syncStatus}`);
    });

    saveTokenBtn.addEventListener('click', async () => {
        const adminSecret = maimemoTokenInput.value.trim();

        maimemoConfig.syncWeakness = false;
        maimemoConfig.token = '';

        ensureProfileIntegrity();
        saveData();

        if (!adminSecret) {
            await openInfoModal('无法验证', '请先输入管理员密钥后再验证。');
            return;
        }

        if (!supabase) {
            await openInfoModal('无法验证', 'Supabase 未连接，暂时无法验证管理员密钥。');
            return;
        }

        try {
            const { data, error } = await supabase.rpc('verify_admin_secret', {
                input_secret: adminSecret
            });

            if (error) throw error;
            if (!data || !data.valid) {
                await openInfoModal('验证失败', '管理员密钥验证失败，请检查输入后重试。');
                return;
            }

            saveAdminSession({
                verifiedAt: new Date().toISOString(),
                role: 'admin',
                secret: adminSecret
            });
            maimemoTokenInput.value = '';
            settingsModal.classList.remove('open');
            showAdminReviewPanel();
            await fetchReviewQueue();
        } catch (error) {
            console.error('管理员验证失败:', error);
            await openInfoModal('验证异常', '管理员验证失败，请检查 Supabase 函数或密钥配置。');
        }
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
            reader.onload = async (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (!imported.wordGroups) throw new Error('无效的备份文件');

                    // 执行智能合并与重置逻辑
                    await mergeAndResetData(
                        imported.wordGroups,
                        imported.systemState,
                        imported.maimemoConfig,
                        imported.maimemoWordStatusMap
                    );

                    await openInfoModal('恢复成功', '数据恢复成功，已根据新词插入逻辑自动调整进度。');
                    location.reload();
                } catch (err) {
                    await openInfoModal('恢复失败', '恢复失败：' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    async function mergeAndResetData(newGroups, newState, newConfig, newWordStatusMap) {
        // 如果是完全替换模式
        const confirmed = await openTestActionConfirm('导入数据', '是否完全替换当前数据？(选择“取消”将尝试合并新词组并保留旧进度)');
        if (confirmed) {
            wordGroups = newGroups;
            systemState = { ...systemState, ...(newState || {}) };
            maimemoConfig = { ...maimemoConfig, ...(newConfig || {}) };
            maimemoWordStatusMap = newWordStatusMap || {};
            ensureProfileIntegrity();
            saveData();
            return;
        }

        const remainingTargets = [...wordGroups];
        const mergedGroups = [];

        function takeRemainingGroupBySignature(signature) {
            if (!signature) return null;
            const matchIndex = remainingTargets.findIndex(group => getGroupWordSignature(group) === signature);
            if (matchIndex === -1) return null;
            return remainingTargets.splice(matchIndex, 1)[0];
        }

        function takeRemainingGroupByWordListSignature(signature) {
            if (!signature) return null;
            const matchIndex = remainingTargets.findIndex(group => getGroupWordListSignature(group) === signature);
            if (matchIndex === -1) return null;
            return remainingTargets.splice(matchIndex, 1)[0];
        }

        newGroups.forEach(newG => {
            const newSignature = getGroupWordSignature(newG);
            const newWordListSignature = getGroupWordListSignature(newG);
            const sameIdIndex = remainingTargets.findIndex(group => group.groupId === newG.groupId);
            const sameIdGroup = sameIdIndex === -1 ? null : remainingTargets[sameIdIndex];
            const sameIdSignature = sameIdGroup ? getGroupWordSignature(sameIdGroup) : '';

            if (sameIdGroup && sameIdSignature === newSignature) {
                remainingTargets.splice(sameIdIndex, 1);
                mergedGroups.push(cloneGroupStateFromExisting(newG, sameIdGroup));
                return;
            }

            const sameContentGroup = takeRemainingGroupBySignature(newSignature);
            if (sameContentGroup) {
                mergedGroups.push(cloneGroupStateFromExisting(newG, sameContentGroup));
                return;
            }

            const sameWordListGroup = takeRemainingGroupByWordListSignature(newWordListSignature);
            if (sameWordListGroup) {
                mergedGroups.push(resetGroupFromSource(newG));
                return;
            }

            if (sameIdGroup) {
                remainingTargets.splice(sameIdIndex, 1);
                mergedGroups.push(resetGroupFromSource(newG));
                return;
            }

            mergedGroups.push(resetGroupFromSource(newG));
        });

        wordGroups = mergedGroups;

        if (newWordStatusMap && typeof newWordStatusMap === 'object') {
            maimemoWordStatusMap = { ...maimemoWordStatusMap, ...newWordStatusMap };
        }

        ensureProfileIntegrity();
        saveData();
    }

    function getWordContentSignature(wordObj) {
        const wordKey = (wordObj?.word || '').trim().toLowerCase();
        const answerKey = (wordObj?.expectedAnswer || '')
            .split('/')
            .map(item => item.trim())
            .filter(Boolean)
            .sort()
            .join('/');
        return `${wordKey}::${answerKey}`;
    }

    function getGroupWordListSignature(group) {
        return (group?.words || [])
            .map(word => (word?.word || '').trim().toLowerCase())
            .filter(Boolean)
            .sort()
            .join('||');
    }

    function getGroupWordSignature(group) {
        return (group?.words || [])
            .map(word => getWordContentSignature(word))
            .filter(Boolean)
            .sort()
            .join('||');
    }

    function cloneGroupStateFromExisting(sourceGroup, existingGroup) {
        const existingWordsByKey = new Map(
            (existingGroup?.words || []).map(word => [
                (word?.word || '').trim().toLowerCase(),
                word
            ])
        );

        return {
            ...existingGroup,
            groupId: sourceGroup.groupId,
            words: sourceGroup.words.map(sourceWord => {
                const key = (sourceWord.word || '').trim().toLowerCase();
                const existingWord = existingWordsByKey.get(key);
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

    // 核心改进：同步代码中的 defaultWords 到当前状态
    function syncWithCodeSource() {
        const sourceGroups = createDefaultWordGroups();
        const remainingTargets = [...wordGroups];
        const syncedGroups = [];
        let modified = false;

        function takeRemainingGroupBySignature(signature) {
            if (!signature) return null;
            const matchIndex = remainingTargets.findIndex(group => getGroupWordSignature(group) === signature);
            if (matchIndex === -1) return null;
            return remainingTargets.splice(matchIndex, 1)[0];
        }

        function takeRemainingGroupByWordListSignature(signature) {
            if (!signature) return null;
            const matchIndex = remainingTargets.findIndex(group => getGroupWordListSignature(group) === signature);
            if (matchIndex === -1) return null;
            return remainingTargets.splice(matchIndex, 1)[0];
        }

        sourceGroups.forEach(srcG => {
            const sourceSignature = getGroupWordSignature(srcG);
            const sourceWordListSignature = getGroupWordListSignature(srcG);

            // 先尝试按 groupId 精准匹配；若组号漂移，再按词组内容迁移已有进度。
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
                modified = true;
                return;
            }

            const sameWordListGroup = takeRemainingGroupByWordListSignature(sourceWordListSignature);
            if (sameWordListGroup) {
                syncedGroups.push(resetGroupFromSource(srcG));
                modified = true;
                return;
            }

            if (sameIdGroup) {
                remainingTargets.splice(sameIdIndex, 1);
                syncedGroups.push(resetGroupFromSource(srcG));
                modified = true;
                return;
            }

            // 发现全新词组
            syncedGroups.push(srcG);
            modified = true;
        });

        if (remainingTargets.length > 0 || syncedGroups.length !== wordGroups.length) {
            modified = true;
        }

        if (modified) {
            backupDataBeforeCodeSync('syncWithCodeSource');
        }

        wordGroups = syncedGroups;

        if (modified) {
            saveData();
            console.log('检测到代码词库变动，已按词组内容自动迁移并同步进度。');
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

    if (syncMaimemoBtn) {
        syncMaimemoBtn.addEventListener('click', async () => {
            await openInfoModal('功能停用', '墨墨联动功能当前已停用，后续如需恢复将再接回。');
        });
    }

    // ==== 排行榜逻辑 (Supabase 驱动) ====
    function getDailyLeaderboardExpiryCutoffISO() {
        return new Date(
            Date.now() - SETTINGS.dailyLeaderboardRetentionDays * 24 * 60 * 60 * 1000
        ).toISOString();
    }

    async function pruneExpiredDailyLeaderboardRecords() {
        if (!supabase) return;

        try {
            const cutoffISO = getDailyLeaderboardExpiryCutoffISO();
            const { error } = await supabase
                .from('leaderboard')
                .delete()
                .eq('test_mode', 'daily')
                .lt('test_date', cutoffISO);

            if (error) throw error;
        } catch (err) {
            console.error('清理过期每日排行榜记录失败:', err);
        }
    }

    async function uploadScoreToSupabase(total, correct, accuracy, mode) {
        if (!supabase) return;

        ensureProfileIntegrity();
        saveData();

        try {
            if (mode === 'daily') {
                await pruneExpiredDailyLeaderboardRecords();
            }

            const { error } = await supabase
                .from('leaderboard')
                .insert([
                    {
                        user_id: systemState.userId,
                        nickname: systemState.nickname,
                        total_words: total,
                        correct_words: correct,
                        accuracy: parseFloat(accuracy),
                        test_mode: mode,
                        test_date: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
            console.log('成绩已成功上报至 Supabase 排行榜');
        } catch (err) {
            console.error('上报成绩失败:', err);
        }
    }

    function getLeaderboardMeta(mode) {
        const modeMap = {
            daily: {
                title: '🏆 每日排行',
                emptyText: `暂无近${SETTINGS.dailyLeaderboardRetentionDays}天的每日排行数据，快去完成每日轻测吧！`
            },
            monthly: {
                title: '📅 每月排行（前10名）',
                emptyText: '暂无每月排行数据，快去完成月度总测吧！'
            }
        };

        return modeMap[mode] || modeMap.daily;
    }

    async function fetchLeaderboard(mode) {
        if (!supabase) {
            leaderboardModal.classList.remove('open');
            await openInfoModal('连接失败', 'Supabase 连接未建立。请确保网络正常且已正确配置 API Key。');
            return;
        }

        const leaderboardMeta = getLeaderboardMeta(mode);
        if (leaderboardModalTitle) {
            leaderboardModalTitle.textContent = leaderboardMeta.title;
        }

        leaderboardLoading.style.display = 'block';
        leaderboardContent.style.display = 'none';
        leaderboardTbody.innerHTML = '';

        try {
            let query = supabase
                .from('leaderboard')
                .select('id,user_id,nickname,total_words,accuracy,test_date')
                .eq('test_mode', mode);

            if (mode === 'daily') {
                query = query.gte('test_date', getDailyLeaderboardExpiryCutoffISO());
            }

            const queryLimit = mode === 'daily' ? 100 : 10;

            const { data, error } = await query
                .order('accuracy', { ascending: false })
                .order('test_date', { ascending: false })
                .limit(queryLimit);
            if (error) throw error;

            let rows = Array.isArray(data) ? data : [];
            if (mode === 'daily') {
                const userEntryCounts = new Map();
                rows = rows.filter(row => {
                    const userKey = row.user_id || row.nickname || row.id;
                    const currentCount = userEntryCounts.get(userKey) || 0;
                    if (currentCount >= SETTINGS.dailyLeaderboardMaxSlotsPerUser) {
                        return false;
                    }

                    userEntryCounts.set(userKey, currentCount + 1);
                    return true;
                });
            }

            rows = rows.slice(0, 10);

            if (rows.length > 0) {
                rows.forEach((row, index) => {
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
                leaderboardTbody.innerHTML = `<tr><td colspan="4">${leaderboardMeta.emptyText}</td></tr>`;
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

    function openLeaderboard(mode) {
        leaderboardModal.classList.add('open');
        fetchLeaderboard(mode);
    }

    if (viewDailyLeaderboardBtn) {
        viewDailyLeaderboardBtn.addEventListener('click', () => {
            openLeaderboard('daily');
        });
    }

    if (viewMonthlyLeaderboardBtn) {
        viewMonthlyLeaderboardBtn.addEventListener('click', () => {
            openLeaderboard('monthly');
        });
    }

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
    syncAcceptedRulesFromSupabase();
    if (adminSession?.role === 'admin' && adminSession?.secret) {
        showAdminReviewPanel();
        fetchReviewQueue();
    }
});
