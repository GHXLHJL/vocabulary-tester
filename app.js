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
    const kaoyanDictStatusHint = document.getElementById('kaoyan-dict-status');

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
            const response = await fetch('kaoyan_dict.json');
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

    const APP_VERSION = 'v26.7.20';
    const STORAGE_KEY = 'vocabulary_tester_data_v26.7.9'; // 保持存储键稳定，避免版本号变更导致本地数据丢失
    const MAIMEMO_RESPONSE_WEIGHTS = {
        FORGET: 3,
        VAGUE: 2,
        CANCEL_WELL_FAMILIAR: 2,
        FAMILIAR: 0,
        WELL_FAMILIAR: -1
    };
    const CHINESE_NEAR_SYNONYM_GROUPS = [
        ['方法', '办法', '方式', '手段', '途径'],
        ['聪明', '机灵', '巧妙', '灵巧'],
        ['聪明的', '机灵的', '巧妙的', '灵巧的'],
        ['水平', '水准', '程度', '等级'],
        ['不可避免', '不可避免的', '无法避免', '无法避免的'],
        ['必然发生', '必然发生的', '必然', '必然的']
    ];
    const CHINESE_NEAR_SYNONYM_MAP = CHINESE_NEAR_SYNONYM_GROUPS.reduce((accumulator, group) => {
        group.forEach(item => {
            accumulator[item] = group;
        });
        return accumulator;
    }, {});

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
    let kaoyanDict = null; // 离线考研词库
    let kaoyanDictState = {
        status: 'loading',
        wordCount: 0
    };
    let kaoyanDictReadyPromise = null;
    let currentTestMode = null; // null | 'daily' | 'weekly' | 'monthly'
    let currentTestGroups = []; // 当前正在测试的词组引用
    let currentTestSnapshot = null; // 进入测试前的快照，用于退出时回滚

    let confirmActionResolver = null;

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
        { id: generateId(), group: 1, word: 'describe', expectedAnswer: '描述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'gun', expectedAnswer: '枪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'guy', expectedAnswer: '家伙/男人', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'gum', expectedAnswer: '口香糖/牙龈', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'gym', expectedAnswer: '健身房/体育馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 2, word: 'gay', expectedAnswer: '同性恋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'leather', expectedAnswer: '皮革', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 3, word: 'feather', expectedAnswer: '羽毛', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'shortcoming', expectedAnswer: '缺点/缺陷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'shortage', expectedAnswer: '短缺/不足', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'shortcut', expectedAnswer: '捷径/近路', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'undercut', expectedAnswer: '削减/压低', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'short', expectedAnswer: '短的/矮的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'shortly', expectedAnswer: '立刻/简短的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'shorten', expectedAnswer: '缩短', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 4, word: 'shortlist', expectedAnswer: '候选名单', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'elusive', expectedAnswer: '难以捉摸的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 5, word: 'exclusive', expectedAnswer: '独有的/排外的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'coach', expectedAnswer: '教练', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'couch', expectedAnswer: '长沙发/表达', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 6, word: 'cough', expectedAnswer: '咳嗽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'lever', expectedAnswer: '杠杆/撬动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'clever', expectedAnswer: '聪明的/灵巧的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 7, word: 'level', expectedAnswer: '水平/齐平的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'bottom', expectedAnswer: '底部（的）/尽头（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 8, word: 'button', expectedAnswer: '按钮/纽扣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'hose', expectedAnswer: '水管/软管', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'horse', expectedAnswer: '马', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'house', expectedAnswer: '房子/大楼/议院', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 9, word: 'hoarse', expectedAnswer: '嘶哑的/嘶哑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'magnificent', expectedAnswer: '宏伟的/壮丽的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 10, word: 'malignant', expectedAnswer: '（病）恶性的/恶毒的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'patrol', expectedAnswer: '巡逻/巡查', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'patriot', expectedAnswer: '爱国者', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'petrol', expectedAnswer: '汽油', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'petroleum', expectedAnswer: '石油', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'patron', expectedAnswer: '赞助人/顾客', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 11, word: 'pardon', expectedAnswer: '原谅/宽恕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'suit', expectedAnswer: '诉讼/适合', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 12, word: 'suite', expectedAnswer: '套房/一套（东西）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'block', expectedAnswer: '阻碍/一块', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 13, word: 'flock', expectedAnswer: '聚集/一群', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'shadow', expectedAnswer: '影子/阴影', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 14, word: 'shallow', expectedAnswer: '（肤）浅的/浅薄的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'handicap', expectedAnswer: '障碍/残疾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 15, word: 'kidnap', expectedAnswer: '绑架/劫持', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shake', expectedAnswer: '摇动/握手/摆脱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shock', expectedAnswer: '震惊（的）/电击', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'sharp', expectedAnswer: '急剧的/锋利的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shape', expectedAnswer: '形成/形状/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 16, word: 'shade', expectedAnswer: '阴凉处/遮光', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'heel', expectedAnswer: '脚后跟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'heal', expectedAnswer: '愈合/治愈', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'hell', expectedAnswer: '地狱/该死', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'hall', expectedAnswer: '大厅/礼堂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 17, word: 'hill', expectedAnswer: '小山/山丘', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'war', expectedAnswer: '战争/竞争', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'ware', expectedAnswer: '商品/制品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'wary', expectedAnswer: '谨慎的/小心的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'warn', expectedAnswer: '提醒/警告', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'warm', expectedAnswer: '暖和（的）/热情的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 18, word: 'warp', expectedAnswer: '（使）扭曲/弯曲', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'cession', expectedAnswer: '割让/转让', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'concession', expectedAnswer: '让步/特许权', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'recession', expectedAnswer: '经济衰退/退后', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'succession', expectedAnswer: '继承（权）/一连串', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'procession', expectedAnswer: '游行/队列', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 19, word: 'possession', expectedAnswer: '拥有/财产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'ward', expectedAnswer: '病房/防止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'award', expectedAnswer: '奖品/授予', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'reward', expectedAnswer: '奖赏/酬金', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'coward', expectedAnswer: '胆小鬼/懦夫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 20, word: 'awkward', expectedAnswer: '尴尬的/难办的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'beat', expectedAnswer: '击败/跳动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'beast', expectedAnswer: '野兽/凶残的人', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'breast', expectedAnswer: '胸部/乳房', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'bear', expectedAnswer: '承受/带有/熊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 21, word: 'beard', expectedAnswer: '胡子/胡须', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'rut', expectedAnswer: '刻板乏味/车辙', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 22, word: 'nut', expectedAnswer: '螺母/坚果/疯子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'needle', expectedAnswer: '针头/激怒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 23, word: 'needy', expectedAnswer: '贫穷的/贫困的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'scoop', expectedAnswer: '获得/一勺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'troop', expectedAnswer: '军队/一群', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'group', expectedAnswer: '团体/组', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 24, word: 'troupe', expectedAnswer: '表演团/剧团', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'ready', expectedAnswer: '准备好的/乐意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'greedy', expectedAnswer: '贪婪的/贪心的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'tragedy', expectedAnswer: '悲剧/遗憾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'remedy', expectedAnswer: '解决方法/补救', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 25, word: 'comedy', expectedAnswer: '喜剧（片）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'mantle', expectedAnswer: '覆盖（物）/地幔', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'mortal', expectedAnswer: '凡人/致命的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'mental', expectedAnswer: '精神（健康）的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'metal', expectedAnswer: '金属', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'medal', expectedAnswer: '奖章/奖牌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 26, word: 'motel', expectedAnswer: '汽车旅馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'ethic', expectedAnswer: '道德观/道德规范', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 27, word: 'ethnic', expectedAnswer: '民族的/种族的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'cannon', expectedAnswer: '猛撞/大炮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 28, word: 'canon', expectedAnswer: '标准/真作集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'light', expectedAnswer: '光线/鉴于/点燃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'alight', expectedAnswer: '点亮/落下', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'slight', expectedAnswer: '轻微的/轻视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'plight', expectedAnswer: '困境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'delight', expectedAnswer: '愉快/高兴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 29, word: 'flight', expectedAnswer: '航班/飞行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'delete', expectedAnswer: '删除/删去', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 30, word: 'deplete', expectedAnswer: '耗尽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'volume', expectedAnswer: '容量/一卷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 31, word: 'column', expectedAnswer: '专栏/支柱/列', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'seem', expectedAnswer: '似乎', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'deem', expectedAnswer: '认为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'esteem', expectedAnswer: '尊敬', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 32, word: 'redeem', expectedAnswer: '弥补/兑换', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'feed', expectedAnswer: '喂养/提供/饲料', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'deed', expectedAnswer: '行为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'indeed', expectedAnswer: '确实', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'need', expectedAnswer: '需要', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'reed', expectedAnswer: '芦苇', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 33, word: 'seed', expectedAnswer: '种子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'stuff', expectedAnswer: '东西/填充', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'staff', expectedAnswer: '职工/任职于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 34, word: 'stiff', expectedAnswer: '艰难的/（僵）硬的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'drill', expectedAnswer: '练习/钻（孔）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'drift', expectedAnswer: '漂流/移动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'draft', expectedAnswer: '草稿/草拟（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 35, word: 'thrift', expectedAnswer: '节俭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'essential', expectedAnswer: '基本的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 36, word: 'eccentric', expectedAnswer: '古怪的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'notion', expectedAnswer: '概念/观念', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 37, word: 'notice', expectedAnswer: '注意/通知', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'type', expectedAnswer: '类型/打字', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'tape', expectedAnswer: '录音/磁带/卷尺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 38, word: 'tap', expectedAnswer: '利用/水龙头', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'desert', expectedAnswer: '沙漠/丢弃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 39, word: 'dessert', expectedAnswer: '甜点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'cherish', expectedAnswer: '珍爱/怀念', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'perish', expectedAnswer: '死亡', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 40, word: 'nourish', expectedAnswer: '滋养', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'perspective', expectedAnswer: '观点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'prospective', expectedAnswer: '可能的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'perceptive', expectedAnswer: '有洞察力的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'respective', expectedAnswer: '分别的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'susceptive', expectedAnswer: '敏感的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'retrospective', expectedAnswer: '回想的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 41, word: 'introspective', expectedAnswer: '自省的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'gene', expectedAnswer: '基因', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'genesis', expectedAnswer: '起源', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'general', expectedAnswer: '普通的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'generic', expectedAnswer: '一般的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'genetic', expectedAnswer: '基因的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'generate', expectedAnswer: '产生', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'generation', expectedAnswer: '一代（人）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'generalize', expectedAnswer: '概括/推广', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'generous', expectedAnswer: '慷慨的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'genre', expectedAnswer: '类型', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 42, word: 'generalization', expectedAnswer: '概括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'climax', expectedAnswer: '高潮/顶点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'claim', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'acclaim', expectedAnswer: '称赞', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'declaim', expectedAnswer: '演讲', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'disclaim', expectedAnswer: '否认', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'exclaim', expectedAnswer: '呼喊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'proclaim', expectedAnswer: '宣布', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 43, word: 'reclaim', expectedAnswer: '回收/开垦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'hub', expectedAnswer: '中心/轮轴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'pub', expectedAnswer: '酒馆', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'sub', expectedAnswer: '替补/潜水艇', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'tub', expectedAnswer: '浴缸', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'rub', expectedAnswer: '摩擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'dub', expectedAnswer: '给…起绰号', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 44, word: 'cub', expectedAnswer: '幼崽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'device', expectedAnswer: '设备', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'devise', expectedAnswer: '发明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'advise', expectedAnswer: '建议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'advice', expectedAnswer: '建议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 45, word: 'revise', expectedAnswer: '校阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'evolution', expectedAnswer: '进化', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'resolution', expectedAnswer: '决定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'revelation', expectedAnswer: '揭露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 46, word: 'revolution', expectedAnswer: '革命', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'allege', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'allegation', expectedAnswer: '指控', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'allegiance', expectedAnswer: '忠诚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'alien', expectedAnswer: '外国的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'align', expectedAnswer: '使一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'alliance', expectedAnswer: '联盟', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'ally', expectedAnswer: '盟友', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'allay', expectedAnswer: '减轻', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'alloy', expectedAnswer: '合金', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'alley', expectedAnswer: '小巷', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 47, word: 'rally', expectedAnswer: '集合', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'alleviate', expectedAnswer: '缓解', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'alienate', expectedAnswer: '使疏远', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'affiliate', expectedAnswer: '隶属于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 48, word: 'allocate', expectedAnswer: '分配', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'formal', expectedAnswer: '形式的/正规的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'formality', expectedAnswer: '例行公事', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'format', expectedAnswer: '格式(化)', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'formative', expectedAnswer: '影响形成的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'former', expectedAnswer: '以前的/前者（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'formula', expectedAnswer: '方案/配方', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 49, word: 'formulate', expectedAnswer: '制定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'trip', expectedAnswer: '旅行', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'trap', expectedAnswer: '困住/陷阱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'strap', expectedAnswer: '捆绑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'strip', expectedAnswer: '剥夺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'stripe', expectedAnswer: '条纹', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'spite', expectedAnswer: '怨恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 50, word: 'spit', expectedAnswer: '吐（口水）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'confide', expectedAnswer: '透露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'confidence', expectedAnswer: '信心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'confident', expectedAnswer: '自信的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 51, word: 'confidant', expectedAnswer: '知己', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'tramp', expectedAnswer: '远足/流浪汉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'damp', expectedAnswer: '潮湿的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'dumb', expectedAnswer: '愚蠢的/哑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'dump', expectedAnswer: '倾销/垃圾场', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'jump', expectedAnswer: '跳跃', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'bump', expectedAnswer: '撞上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'pump', expectedAnswer: '抽水（机）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 52, word: 'lump', expectedAnswer: '把…混为一谈/肿块', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'bravery', expectedAnswer: '勇敢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'gravity', expectedAnswer: '重力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 53, word: 'brevity', expectedAnswer: '简洁', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'fate', expectedAnswer: '命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'fade', expectedAnswer: '逐渐消失/褪色', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'fame', expectedAnswer: '声誉/名声', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'feat', expectedAnswer: '功绩/技艺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'feast', expectedAnswer: '盛宴/尽情享用', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'fake', expectedAnswer: '假的/赝品', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'fare', expectedAnswer: '车费/船费', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 54, word: 'fear', expectedAnswer: '害怕/惧怕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'scare', expectedAnswer: '害怕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'scarce', expectedAnswer: '缺乏的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'score', expectedAnswer: '分数', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'scorn', expectedAnswer: '蔑视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'corn', expectedAnswer: '玉米', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'ore', expectedAnswer: '矿', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'sore', expectedAnswer: '痛处', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'core', expectedAnswer: '核心', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 55, word: 'scar', expectedAnswer: '伤痕', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'stationary', expectedAnswer: '静止的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 56, word: 'stationery', expectedAnswer: '文具', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'fuse', expectedAnswer: '融合/保险丝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'confuse', expectedAnswer: '迷惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'effuse', expectedAnswer: '流出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'refuse', expectedAnswer: '拒绝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'refute', expectedAnswer: '反驳', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'defuse', expectedAnswer: '使缓和', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'infuse', expectedAnswer: '注入', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'diffuse', expectedAnswer: '传播（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 57, word: 'transfuse', expectedAnswer: '输（血）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'test', expectedAnswer: '测试/检验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'text', expectedAnswer: '文本/短信', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'taste', expectedAnswer: '喜好/品味', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 58, word: 'task', expectedAnswer: '任务/工作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'elect', expectedAnswer: '选举', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'erect', expectedAnswer: '建立', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 59, word: 'enact', expectedAnswer: '制定法律/实施', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'cardinal', expectedAnswer: '最重要的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 60, word: 'cordial', expectedAnswer: '热情友好的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'expect', expectedAnswer: '期待/预计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'expert', expectedAnswer: '专家（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'export', expectedAnswer: '出口（物）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'exert', expectedAnswer: '运用/努力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'except', expectedAnswer: '除…之外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'excerpt', expectedAnswer: '摘录', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'expend', expectedAnswer: '花钱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'expand', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'extend', expectedAnswer: '延长/包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'extent', expectedAnswer: '程度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'expire', expectedAnswer: '过期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 61, word: 'expose', expectedAnswer: '暴露', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'week', expectedAnswer: '星期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'weed', expectedAnswer: '杂草', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'weep', expectedAnswer: '流出/哭泣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 62, word: 'sweep', expectedAnswer: '扫过/迅速传播', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'wipe', expectedAnswer: '擦', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'wife', expectedAnswer: '妻子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 63, word: 'whip', expectedAnswer: '党鞭/鞭子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'ventilate', expectedAnswer: '使通风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'versatile', expectedAnswer: '多才多艺的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 64, word: 'volatile', expectedAnswer: '易发挥的/易变的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'gratitude', expectedAnswer: '感谢', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'attitude', expectedAnswer: '态度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'altitude', expectedAnswer: '高度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'latitude', expectedAnswer: '纬度/自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'longitude', expectedAnswer: '经度', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'aptitude', expectedAnswer: '天赋/天资', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 65, word: 'multitude', expectedAnswer: '大量/人群', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'talent', expectedAnswer: '才能/天才', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'latent', expectedAnswer: '潜伏的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'patent', expectedAnswer: '专利/专利权', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'tenant', expectedAnswer: '租户/佃户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'lantern', expectedAnswer: '灯笼', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 66, word: 'lateral', expectedAnswer: '侧面的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'vote', expectedAnswer: '投票/表决', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 67, word: 'veto', expectedAnswer: '否决/反对', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'row', expectedAnswer: '争吵/一排', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'raw', expectedAnswer: '未经加工的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'law', expectedAnswer: '法律/司法界/警方', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'paw', expectedAnswer: '爪子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'jaw', expectedAnswer: '下巴', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'saw', expectedAnswer: '锯子/锯开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'sew', expectedAnswer: '缝（制）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 68, word: 'sow', expectedAnswer: '播（种）/散布', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'quota', expectedAnswer: '配额/定额', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'quote', expectedAnswer: '引用/引文', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'quoth', expectedAnswer: '说', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'quotient', expectedAnswer: '商', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 69, word: 'quotidian', expectedAnswer: '每日的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'parade', expectedAnswer: '游行/阅兵（式）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'paradox', expectedAnswer: '悖论/矛盾', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'paralyse', expectedAnswer: '（使）麻痹/（使）瘫痪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 70, word: 'paradise', expectedAnswer: '天堂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'alter', expectedAnswer: '改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'alert', expectedAnswer: '警惕（的）/警报', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'avert', expectedAnswer: '防止/避免', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'advert', expectedAnswer: '广告/提及', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'advent', expectedAnswer: '到来/出现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'overt', expectedAnswer: '公开的/明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'invert', expectedAnswer: '（使）颠倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'convert', expectedAnswer: '转换/改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 71, word: 'divert', expectedAnswer: '转向/转移', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'principal', expectedAnswer: '主要的/校长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 72, word: 'principle', expectedAnswer: '原则/原理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'ecological', expectedAnswer: '生态的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'physiological', expectedAnswer: '生理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'psychological', expectedAnswer: '心理的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 73, word: 'philosophical', expectedAnswer: '哲学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'erupt', expectedAnswer: '爆发/喷发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'abrupt', expectedAnswer: '突然的/意外的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'disrupt', expectedAnswer: '（使）扰乱/中断', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'corrupt', expectedAnswer: '破坏/腐败（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'interrupt', expectedAnswer: '打断/打扰', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 74, word: 'bankrupt', expectedAnswer: '破产的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'sentiment', expectedAnswer: '观点/情绪', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'sensible', expectedAnswer: '明智的/理智的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 75, word: 'sensitive', expectedAnswer: '敏感的/体贴的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'product', expectedAnswer: '产品/产物', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'conduct', expectedAnswer: '实施/举止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'instruct', expectedAnswer: '指示/教授（v）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'obstruct', expectedAnswer: '阻碍/妨碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'destruct', expectedAnswer: '毁坏/摧毁', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 76, word: 'construct', expectedAnswer: '建造/构想', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'board', expectedAnswer: '董事会/木板', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'aboard', expectedAnswer: '在（船/飞机/火车）上', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'broad', expectedAnswer: '宽阔的/广泛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 77, word: 'abroad', expectedAnswer: '在国外/到国外', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'circulation', expectedAnswer: '发行量/流通', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'curriculum', expectedAnswer: '课程', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 78, word: 'circumstance', expectedAnswer: '情况/命运', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'recent', expectedAnswer: '最近的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'resent', expectedAnswer: '愤恨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'consent', expectedAnswer: '同意', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'context', expectedAnswer: '背景/语境', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'contest', expectedAnswer: '比赛/争辩', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'contend', expectedAnswer: '声称', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 79, word: 'content', expectedAnswer: '内容/满意的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'operate', expectedAnswer: '经营/运转', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'cooperate', expectedAnswer: '合作', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'corporate', expectedAnswer: '公司的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'incorporate', expectedAnswer: '包括', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 80, word: 'coordinate', expectedAnswer: '（使）协调', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'protest', expectedAnswer: '抗议', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'pretext', expectedAnswer: '借口', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'process', expectedAnswer: '过程/处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'progress', expectedAnswer: '进步/进展', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 81, word: 'congress', expectedAnswer: '国会/代表大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'deform', expectedAnswer: '（使）畸形', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'inform', expectedAnswer: '通知', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'perform', expectedAnswer: '表现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'uniform', expectedAnswer: '制服/统一的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'conform', expectedAnswer: '遵守/相一致', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'inform', expectedAnswer: '通知/影响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'reform', expectedAnswer: '改革', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'reformation', expectedAnswer: '革新', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'reformer', expectedAnswer: '改革者', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 82, word: 'reformatory', expectedAnswer: '改革的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'confer', expectedAnswer: '授予/商讨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'infer', expectedAnswer: '推断/暗示', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'refer', expectedAnswer: '涉及/查阅', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 83, word: 'defer', expectedAnswer: '推迟/听从', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'chase', expectedAnswer: '追逐/追求', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'phase', expectedAnswer: '阶段/时期', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'phrase', expectedAnswer: '短语/叙述', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 84, word: 'purchase', expectedAnswer: '购买', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'assume', expectedAnswer: '假设', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'reassume', expectedAnswer: '重新假定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'resume', expectedAnswer: '继续/简历', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'presume', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'consume', expectedAnswer: '消耗/吃喝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 85, word: 'subsume', expectedAnswer: '包含', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'clash', expectedAnswer: '冲突/分歧', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'crash', expectedAnswer: '撞车/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'crack', expectedAnswer: '破裂/打压', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 86, word: 'crush', expectedAnswer: '压坏/迷恋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'genuine', expectedAnswer: '真正的/真诚的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'genius', expectedAnswer: '天才/天赋', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'ingenious', expectedAnswer: '精巧的/巧妙的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'ingenuity', expectedAnswer: '创造力/聪明才智', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 87, word: 'ingenuous', expectedAnswer: '单纯的/天真的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'serve', expectedAnswer: '服务/用于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'reserve', expectedAnswer: '预订/保护区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'observe', expectedAnswer: '观察/评论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'deserve', expectedAnswer: '值得', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'preserve', expectedAnswer: '维护/专属领域', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 88, word: 'conserve', expectedAnswer: '节约/保护', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'congregate', expectedAnswer: '集合/聚集', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 89, word: 'segregate', expectedAnswer: '（使）隔离/分开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'convention', expectedAnswer: '习俗/大会', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 90, word: 'contention', expectedAnswer: '争论/观点', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'contract', expectedAnswer: '合同', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'contrast', expectedAnswer: '差异', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'contrary', expectedAnswer: '相反的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 91, word: 'controversy', expectedAnswer: '争论', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'mount', expectedAnswer: '发起', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'amount', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 92, word: 'account', expectedAnswer: '账户', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'literate', expectedAnswer: '识字的/有文化的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'illiterate', expectedAnswer: '文盲（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'literacy', expectedAnswer: '读写能力/专业能力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'literature', expectedAnswer: '文学/文献', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'literal', expectedAnswer: '字面上的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'literary', expectedAnswer: '文学的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'liberal', expectedAnswer: '开放的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 93, word: 'liberty', expectedAnswer: '自由', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'property', expectedAnswer: '财产', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'poverty', expectedAnswer: '贫穷的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'proper', expectedAnswer: '恰当的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'prosper', expectedAnswer: '繁荣', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'prospect', expectedAnswer: '可能性', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 94, word: 'propel', expectedAnswer: '推进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'reproach', expectedAnswer: '责备', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'approach', expectedAnswer: '接近', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'approval', expectedAnswer: '赞成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 95, word: 'appear', expectedAnswer: '出现', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'inflict', expectedAnswer: '（使）遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 96, word: 'conflict', expectedAnswer: '冲突', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'delicate', expectedAnswer: '精美的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'dedicate', expectedAnswer: '献身于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 97, word: 'indicate', expectedAnswer: '表明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'distinguish', expectedAnswer: '区分', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'distinguished', expectedAnswer: '卓著的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'extinguish', expectedAnswer: '熄灭', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'extinct', expectedAnswer: '已灭绝的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'distinction', expectedAnswer: '差别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'distinct', expectedAnswer: '截然不同的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 98, word: 'instinct', expectedAnswer: '本能', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'attempt', expectedAnswer: '尝试', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'contempt', expectedAnswer: '鄙视', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'tempt', expectedAnswer: '引诱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'temptation', expectedAnswer: '诱惑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'temple', expectedAnswer: '寺院', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'template', expectedAnswer: '模版', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'contemplate', expectedAnswer: '思考', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'tempo', expectedAnswer: '节奏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'temporal', expectedAnswer: '短暂的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'temporary', expectedAnswer: '暂时的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 99, word: 'hamper', expectedAnswer: '阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'cape', expectedAnswer: '披风', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'cap', expectedAnswer: '帽子', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'cope', expectedAnswer: '处理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'cop', expectedAnswer: '警察', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'rap', expectedAnswer: '说唱/敲击', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 100, word: 'rape', expectedAnswer: '强奸/抢夺', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'lapse', expectedAnswer: '疏忽', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'elapse', expectedAnswer: '流逝', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 101, word: 'collapse', expectedAnswer: '倒塌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'precious', expectedAnswer: '珍贵的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'previous', expectedAnswer: '先前的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 102, word: 'precise', expectedAnswer: '精确的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'conceive', expectedAnswer: '想象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'perceive', expectedAnswer: '看待', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'receive', expectedAnswer: '收到', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 103, word: 'deceive', expectedAnswer: '欺骗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'sufficient', expectedAnswer: '充足的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 104, word: 'efficient', expectedAnswer: '效率高的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'evaporate', expectedAnswer: '消失/蒸发', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'escalate', expectedAnswer: '扩大', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'evaluate', expectedAnswer: '评价', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'estimate', expectedAnswer: '估计', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'eliminate', expectedAnswer: '消除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'simulate', expectedAnswer: '假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'stimulate', expectedAnswer: '刺激', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'calculate', expectedAnswer: '计算', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'speculate', expectedAnswer: '推测', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 105, word: 'stipulate', expectedAnswer: '规定', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'spectrum', expectedAnswer: '光谱/范围', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'spectacle', expectedAnswer: '景象/眼镜', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'spectacular', expectedAnswer: '壮观的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 106, word: 'speculative', expectedAnswer: '猜测的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'repeal', expectedAnswer: '废止', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'repel', expectedAnswer: '驱逐', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'rebel', expectedAnswer: '反抗', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'dispel', expectedAnswer: '驱散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'impel', expectedAnswer: '促使', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'compel', expectedAnswer: '强迫', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'propel', expectedAnswer: '推动', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'expel', expectedAnswer: '开除', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 107, word: 'excel', expectedAnswer: '擅长', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'gas', expectedAnswer: '气体', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'gasp', expectedAnswer: '喘气', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'gape', expectedAnswer: '裂开', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'grasp', expectedAnswer: '理解', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'grape', expectedAnswer: '葡萄', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 108, word: 'gossip', expectedAnswer: '流言', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 109, word: 'inventive', expectedAnswer: '善于创新的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 109, word: 'incentive', expectedAnswer: '激励', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 109, word: 'intensive', expectedAnswer: '密集的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 109, word: 'inclusive', expectedAnswer: '包括的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'assure', expectedAnswer: '（人）保证', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'insure', expectedAnswer: '（钱）给…买保险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'ensure', expectedAnswer: '（事）确保', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 110, word: 'secure', expectedAnswer: '（资源）获得/（使）安全', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'equality', expectedAnswer: '平等', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'quantity', expectedAnswer: '数量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'quality', expectedAnswer: '质量', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 111, word: 'qualify', expectedAnswer: '使合格', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'vigorous', expectedAnswer: '精力旺盛的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'rigorous', expectedAnswer: '严厉的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'humorous', expectedAnswer: '幽默的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'victorious', expectedAnswer: '获胜的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'curious', expectedAnswer: '好奇的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'nervous', expectedAnswer: '紧张的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'obvious', expectedAnswer: '明显的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'dubious', expectedAnswer: '怀疑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 112, word: 'serious', expectedAnswer: '严重的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'district', expectedAnswer: '地区/区', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'distribute', expectedAnswer: '分发/（使）分散', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'contribute', expectedAnswer: '捐献/有助于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 113, word: 'attribute', expectedAnswer: '将...归因于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'substance', expectedAnswer: '物质/主旨', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'substitute', expectedAnswer: '代替（的）', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'institute', expectedAnswer: '制定/机构', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 114, word: 'constitute', expectedAnswer: '构成/被视为', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'dense', expectedAnswer: '密集的/迟钝的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'sense', expectedAnswer: '意识到/感觉/意义', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'tense', expectedAnswer: '紧张的/焦虑的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 115, word: 'tease', expectedAnswer: '戏弄/梳理', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 116, word: 'inhabit', expectedAnswer: '居住于/身处于', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 116, word: 'inhibit', expectedAnswer: '抑制/阻碍', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 117, word: 'define', expectedAnswer: '定义/说明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 117, word: 'confine', expectedAnswer: '限制/监禁', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 117, word: 'refine', expectedAnswer: '提炼/改进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'ascend', expectedAnswer: '上升/攀登', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'descend', expectedAnswer: '下降', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transcend', expectedAnswer: '超出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transition', expectedAnswer: '过渡/转变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transaction', expectedAnswer: '交易/业务', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transparent', expectedAnswer: '明显的/透明的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transient', expectedAnswer: '短暂的/暂住的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transmission', expectedAnswer: '传输/发射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'translate', expectedAnswer: '转变/翻译', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transform', expectedAnswer: '转化/改变', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transport', expectedAnswer: '运输/交通方式', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 118, word: 'transplant', expectedAnswer: '移植/移居', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'assist', expectedAnswer: '帮助/促进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'persist', expectedAnswer: '坚持/持续', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'resist', expectedAnswer: '抵制/忍住', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'consist', expectedAnswer: '由...组成', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'roast', expectedAnswer: '烘烤/烤肉', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'boast', expectedAnswer: '自夸/拥有', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 119, word: 'boost', expectedAnswer: '增长/促进', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'complement', expectedAnswer: '补足/（使）完美', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 120, word: 'compliment', expectedAnswer: '称赞/恭维', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'trail', expectedAnswer: '追踪/路线', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 121, word: 'trial', expectedAnswer: '审判/试验', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'state', expectedAnswer: '国家（的）/状况/说明', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'statue', expectedAnswer: '雕塑/塑像', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'status', expectedAnswer: '状况/地位', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'statute', expectedAnswer: '法令/法规', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'stature', expectedAnswer: '身材/名望', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 122, word: 'saturate', expectedAnswer: '（使）浸透/充满', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'crumple', expectedAnswer: '起皱/瘫倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'crumble', expectedAnswer: '坍塌/破裂', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'grumble', expectedAnswer: '抱怨/轰隆声', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'humble', expectedAnswer: '谦逊的/卑微的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'bumble', expectedAnswer: '弄糟/语无伦次', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'fumble', expectedAnswer: '摸索/笨手笨脚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'jumble', expectedAnswer: '（使）混乱', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'rumble', expectedAnswer: '隆隆作响', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'tumble', expectedAnswer: '跌倒/暴跌', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'stumble', expectedAnswer: '绊倒', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'gamble', expectedAnswer: '赌博/冒险', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'shamble', expectedAnswer: '蹒跚', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'assemble', expectedAnswer: '集合/组装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'resemble', expectedAnswer: '与…相似', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'dissemble', expectedAnswer: '掩饰/假装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 123, word: 'ensemble', expectedAnswer: '剧团/套装', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'render', expectedAnswer: '（使）成为/表达', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'tender', expectedAnswer: '温柔的/提交', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'wonder', expectedAnswer: '想知道/奇观/惊讶', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'gender', expectedAnswer: '性别', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 124, word: 'ponder', expectedAnswer: '考虑', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'abstract', expectedAnswer: '抽象的/摘要', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'subject', expectedAnswer: '主题/（使）遭受', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'object', expectedAnswer: '物体/反对/对象', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'inject', expectedAnswer: '注射/增添', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'project', expectedAnswer: '项目/计划/投射', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 125, word: 'eject', expectedAnswer: '驱逐/喷出', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'polish', expectedAnswer: '擦亮/修改', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'astonish', expectedAnswer: '（使）惊讶/（使）震惊', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'abolish', expectedAnswer: '废除/取消', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 126, word: 'foolish', expectedAnswer: '愚蠢的/尴尬的', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'consensus', expectedAnswer: '共识', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'census', expectedAnswer: '官方统计/人口普查', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 127, word: 'versus', expectedAnswer: '以...为对手', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'aid', expectedAnswer: '援助/帮助', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'lid', expectedAnswer: '盖子/眼皮', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'bid', expectedAnswer: '出价/努力', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'hid(hide)', expectedAnswer: '躲藏', userAnswer: '', isCorrect: null },
        { id: generateId(), group: 128, word: 'rid', expectedAnswer: '摆脱/除去', userAnswer: '', isCorrect: null },
























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

    function expandNearSynonymVariants(str) {
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

            const synonymGroup = CHINESE_NEAR_SYNONYM_MAP[current];
            if (synonymGroup) {
                synonymGroup.forEach(item => queue.push(item));
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

    function expandMeaningVariants(str) {
        return expandOptionalAnswerVariants(str)
            .flatMap(ans => expandNearSynonymVariants(ans))
            .filter(Boolean);
    }

    function getPossibleAnswers(wordObj) {
        return [...new Set(
            wordObj.expectedAnswer
                .split('/')
                .flatMap(ans => expandMeaningVariants(ans))
                .filter(Boolean)
        )];
    }

    function isMeaningMatch(userAnswer, candidateAnswers) {
        const userVariants = new Set(expandNearSynonymVariants(userAnswer));
        return candidateAnswers.some(answer => userVariants.has(answer));
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
                    const possibleAnswers = getPossibleAnswers(wordObj);
                    let isMatch = isMeaningMatch(userAns, possibleAnswers);

                    // 如果本地词库没匹配上，尝试大库匹配
                    if (!isMatch && kaoyanDict) {
                        const wordKey = wordObj.word.toLowerCase();
                        const dictTranslations = (kaoyanDict[wordKey] || [])
                            .flatMap(translation => expandNearSynonymVariants(translation));
                        isMatch = isMeaningMatch(userAns, [...new Set(dictTranslations)]);
                    }

                    wordObj.isCorrect = isMatch;
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
