/**
 * 快练页 - 随机抽题快速练习模式
 * 支持按科目、题型、难度随机抽题，快速刷题
 */

import storage from '../../../utils/storage'

const tool = require('../../../toolbox/tool')

// Mock 数据 - 题库
const QUESTION_BANK = [
  {
    id: 'qk001',
    type: '单选题',
    category: '言语理解',
    stem: '古人云："君子和而不同，小人同而不和。"对这段话理解最准确的是：',
    options: [
      { id: 'A', text: '君子和谐相处但不盲目附和，小人盲目附和但不和谐' },
      { id: 'B', text: '君子与小人的性格完全不同' },
      { id: 'C', text: '君子喜欢与众不同，小人喜欢随波逐流' },
      { id: 'D', text: '君子和小人都不喜欢与他人相处' },
    ],
    correctAnswer: 'A',
    explanation: '这句话的意思是：君子能够与他人和谐相处，但不会盲目附和；小人虽然表面上一致，但内心并不和谐。',
  },
  {
    id: 'qk002',
    type: '单选题',
    category: '数量关系',
    stem: '某商店以相同的进价进了一批衣服，按期望获得50%的利润定价。结果只卖掉了70%，为了尽早收回资金，剩下的打八折出售。卖完这批衣服后，实际获得的利润率是多少？',
    options: [
      { id: 'A', text: '31%' },
      { id: 'B', text: '34%' },
      { id: 'C', text: '38%' },
      { id: 'D', text: '41%' },
    ],
    correctAnswer: 'A',
    explanation: '设每件衣服进价为100元，则定价150元。70%按150元售出，30%按120元（八折）售出。总收入 = 0.7×150 + 0.3×120 = 105 + 36 = 141元。利润率 = (141 - 100) / 100 = 31%。',
  },
  {
    id: 'qk003',
    type: '单选题',
    category: '判断推理',
    stem: '所有的诗人都是文学家，有的文学家是画家。由此可以推出：',
    options: [
      { id: 'A', text: '有的诗人是画家' },
      { id: 'B', text: '有的画家是诗人' },
      { id: 'C', text: '所有文学家都是诗人' },
      { id: 'D', text: '以上都不对' },
    ],
    correctAnswer: 'D',
    explanation: '由"所有诗人都是文学家"和"有的文学家是画家"这两个前提，不能推出任何确定的结论。A、B都是可能性，但不是必然性。',
  },
  {
    id: 'qk004',
    type: '单选题',
    category: '资料分析',
    stem: '2023年，某省GDP为5.2万亿元，同比增长6.5%。其中第一产业增加值0.8万亿元，增长3.2%；第二产业增加值2.1万亿元，增长5.8%；第三产业增加值2.3万亿元，增长8.1%。则2022年该省GDP约为多少万亿元？',
    options: [
      { id: 'A', text: '4.76' },
      { id: 'B', text: '4.88' },
      { id: 'C', text: '5.03' },
      { id: 'D', text: '4.65' },
    ],
    correctAnswer: 'B',
    explanation: '2023年GDP = 2022年GDP × (1 + 6.5%)，所以2022年GDP = 5.2 / 1.065 ≈ 4.88万亿元。',
  },
  {
    id: 'qk005',
    type: '单选题',
    category: '常识判断',
    stem: '下列关于我国地理常识的说法，正确的是：',
    options: [
      { id: 'A', text: '我国最大的岛屿是海南岛' },
      { id: 'B', text: '我国最长的河流是黄河' },
      { id: 'C', text: '我国最大的淡水湖是鄱阳湖' },
      { id: 'D', text: '我国面积最大的省级行政区是西藏自治区' },
    ],
    correctAnswer: 'C',
    explanation: '我国最大的岛屿是台湾岛，最长的河流是长江，面积最大的省级行政区是新疆维吾尔自治区。鄱阳湖是我国最大的淡水湖。',
  },
  {
    id: 'qk006',
    type: '单选题',
    category: '言语理解',
    stem: '依次填入下列各句横线处的词语，最恰当的一组是：①这部作品虽然情节____，但思想内涵深刻。②面对困难，我们要____信心，勇往直前。',
    options: [
      { id: 'A', text: '简单 / 坚定' },
      { id: 'B', text: '简单 / 坚决' },
      { id: 'C', text: '简略 / 坚定' },
      { id: 'D', text: '简略 / 坚决' },
    ],
    correctAnswer: 'A',
    explanation: '"情节简单"搭配恰当，"坚定信心"是固定搭配。"坚决"通常搭配"态度""决定"等。',
  },
  {
    id: 'qk007',
    type: '单选题',
    category: '数量关系',
    stem: '一个水池有两个进水管和一个排水管。单开A管6小时注满，单开B管8小时注满，单开排水管12小时排空。若三管同时打开，几小时能注满水池？',
    options: [
      { id: 'A', text: '3.6小时' },
      { id: 'B', text: '4.8小时' },
      { id: 'C', text: '5.2小时' },
      { id: 'D', text: '6小时' },
    ],
    correctAnswer: 'B',
    explanation: 'A管效率1/6，B管效率1/8，排水管效率1/12。三管同时开：1/6 + 1/8 - 1/12 = 4/24 + 3/24 - 2/24 = 5/24。注满时间 = 24/5 = 4.8小时。',
  },
  {
    id: 'qk008',
    type: '单选题',
    category: '判断推理',
    stem: '图书：书店：文具 与 下列哪组词语逻辑关系最相近？',
    options: [
      { id: 'A', text: '服装：商场：鞋帽' },
      { id: 'B', text: '水果：果园：蔬菜' },
      { id: 'C', text: '电脑：办公室：打印机' },
      { id: 'D', text: '药品：医院：器械' },
    ],
    correctAnswer: 'A',
    explanation: '图书和文具都是商品，书店是销售图书的场所（同时文具可能也有销售）。服装和鞋帽都是商品，商场是销售服装的场所。D中药店主要卖药，器械不是药店的主要商品。',
  },
  {
    id: 'qk009',
    type: '单选题',
    category: '资料分析',
    stem: '某市2023年社会消费品零售总额为12580亿元，同比增长7.8%。其中城镇消费品零售额为9820亿元，增长6.9%；乡村消费品零售额为2760亿元，增长11.2%。则2023年城镇消费品零售额占总零售额的比重比上年约：',
    options: [
      { id: 'A', text: '上升了1.2个百分点' },
      { id: 'B', text: '下降了1.2个百分点' },
      { id: 'C', text: '上升了0.8个百分点' },
      { id: 'D', text: '下降了0.8个百分点' },
    ],
    correctAnswer: 'B',
    explanation: '部分增长率(6.9%) < 整体增长率(7.8%)，比重下降。下降量 ≈ 6.9% - 7.8% = -0.9%，即下降约0.9个百分点，最接近B选项的1.2个百分点。',
  },
  {
    id: 'qk010',
    type: '单选题',
    category: '常识判断',
    stem: '被誉为"中国航天之父"的是：',
    options: [
      { id: 'A', text: '钱三强' },
      { id: 'B', text: '钱学森' },
      { id: 'C', text: '邓稼先' },
      { id: 'D', text: '孙家栋' },
    ],
    correctAnswer: 'B',
    explanation: '钱学森被誉为"中国航天之父"和"火箭之王"，是中国载人航天奠基人。',
  },
]

// 科目分类
const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'verbal', name: '言语理解' },
  { id: 'math', name: '数量关系' },
  { id: 'logic', name: '判断推理' },
  { id: 'data', name: '资料分析' },
  { id: 'common', name: '常识判断' },
]

// 难度选项
const DIFFICULTIES = [
  { id: 'all', name: '全部难度' },
  { id: 'easy', name: '简单' },
  { id: 'medium', name: '中等' },
  { id: 'hard', name: '困难' },
]

// 每组题数选项
const COUNT_OPTIONS = [5, 10, 15, 20]

const buildQuickDraftSceneKey = () => `draft:quick:${Date.now()}`

// 随机洗牌
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

Page({
  data: {
    navBarHeight: 88,
    tabBarHeight: 120,

    // 快练配置面板
    showConfig: true,
    categories: CATEGORIES,
    selectedCategory: 'all',
    difficulties: DIFFICULTIES,
    selectedDifficulty: 'all',
    questionCount: 10,
    countOptions: COUNT_OPTIONS,

    // 答题状态
    isPracticing: false,
    questions: [],
    currentIndex: 1,
    totalQuestions: 10,
    selectedAnswer: '',
    submitted: false,
    isCorrect: null,
    answerSheet: [],

    // 计时
    timerText: '00:00',
    startTime: 0,
    timerInterval: null,

    // 结果面板
    showResult: false,
    resultData: {
      totalCount: 0,
      correctCount: 0,
      wrongCount: 0,
      accuracy: '0%',
      totalTime: '00:00',
      categoryBreakdown: [],
    },

    // 答题卡
    showAnswerCard: false,
    showDraftSheet: false,
    draftSceneKey: '',
    themeMode: 'light',
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const safeBottom = systemInfo.safeAreaInsets?.bottom || 0
    this.setData({
      navBarHeight: statusBarHeight + 44,
      tabBarHeight: 116 + safeBottom * 2,
    })
  },

  onUnload() {
    this.stopTimer()
    storage.clearDraftSheet(this.data.draftSceneKey)
  },

  // ============ 配置面板操作 ============

  onCategoryChange(e) {
    this.setData({ selectedCategory: e.detail.id })
  },

  onDifficultyChange(e) {
    this.setData({ selectedDifficulty: e.detail.id })
  },

  onCountMinus() {
    const idx = this.data.countOptions.indexOf(this.data.questionCount)
    if (idx > 0) {
      this.setData({ questionCount: this.data.countOptions[idx - 1] })
    }
  },

  onCountPlus() {
    const idx = this.data.countOptions.indexOf(this.data.questionCount)
    if (idx < this.data.countOptions.length - 1) {
      this.setData({ questionCount: this.data.countOptions[idx + 1] })
    }
  },

  // ============ 开始快练 ============

  handleStartPractice() {
    storage.clearDraftSheet(this.data.draftSceneKey)

    let filtered = [...QUESTION_BANK]

    // 按科目筛选
    if (this.data.selectedCategory !== 'all') {
      const catMap = { verbal: '言语理解', math: '数量关系', logic: '判断推理', data: '资料分析', common: '常识判断' }
      filtered = filtered.filter(q => q.category === catMap[this.data.selectedCategory])
    }

    // 按难度筛选（mock数据暂不区分难度）
    if (this.data.selectedDifficulty !== 'all') {
      // 目前 mock 数据没有难度字段，跳过
    }

    // 随机抽题
    const shuffled = shuffle(filtered)
    const count = Math.min(this.data.questionCount, shuffled.length)
    const questions = shuffled.slice(0, count)

    if (questions.length === 0) {
      tool.toast('暂无符合条件的题目')
      return
    }

    const answerSheet = questions.map((item, index) => ({
      id: item.id,
      index: index + 1,
      status: index === 0 ? 'current' : 'pending',
      userAnswer: '',
    }))

    this.setData({
      isPracticing: true,
      showConfig: false,
      questions,
      totalQuestions: questions.length,
      currentIndex: 1,
      selectedAnswer: '',
      submitted: false,
      isCorrect: null,
      answerSheet,
      startTime: Date.now(),
      timerText: '00:00',
      draftSceneKey: buildQuickDraftSceneKey(),
    })
    this.startTimer()
  },

  // ============ 计时器 ============

  startTimer() {
    this.stopTimer()
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      this.setData({
        timerText: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      })
    }, 1000)
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  // ============ 答题逻辑 ============

  handleOptionTap(e) {
    const { id } = e.currentTarget.dataset
    const { currentIndex, questions, answerSheet, submitted } = this.data

    if (submitted) return

    const question = questions[currentIndex - 1]
    const isCorrect = question.correctAnswer === id

    const newSheet = answerSheet.map((item, idx) => {
      if (idx !== currentIndex - 1) return item
      return { ...item, status: isCorrect ? 'correct' : 'wrong', userAnswer: id }
    })

    this.setData({
      selectedAnswer: id,
      submitted: true,
      isCorrect,
      answerSheet: newSheet,
    })

    wx.vibrateShort({ type: isCorrect ? 'light' : 'medium' })
  },

  handleNext() {
    const { currentIndex, totalQuestions, questions, answerSheet } = this.data

    if (currentIndex >= totalQuestions) {
      // 最后一题，自动交卷
      this.handleFinish()
      return
    }

    const nextIndex = currentIndex + 1
    const nextItem = answerSheet[nextIndex - 1]
    const newSheet = answerSheet.map((item, idx) => {
      if (idx === nextIndex - 1) return { ...item, status: nextItem.userAnswer ? item.status : 'current' }
      return item
    })

    this.setData({
      currentIndex: nextIndex,
      selectedAnswer: nextItem.userAnswer || '',
      submitted: !!nextItem.userAnswer,
      isCorrect: nextItem.status === 'correct' ? true : nextItem.status === 'wrong' ? false : null,
      answerSheet: newSheet,
    })
  },

  handleFinish() {
    this.stopTimer()
    const { questions, answerSheet, draftSceneKey } = this.data
    const correctCount = answerSheet.filter(a => a.status === 'correct').length
    const wrongCount = answerSheet.filter(a => a.status === 'wrong').length
    const unanswered = answerSheet.filter(a => a.status === 'pending').length

    // 按科目统计
    const catMap = {}
    questions.forEach((q, i) => {
      const cat = q.category
      if (!catMap[cat]) catMap[cat] = { name: cat, total: 0, correct: 0 }
      catMap[cat].total++
      if (answerSheet[i].status === 'correct') catMap[cat].correct++
    })

    const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60

    storage.clearDraftSheet(draftSceneKey)
    this.setData({
      showResult: true,
      draftSceneKey: '',
      resultData: {
        totalCount: questions.length,
        correctCount,
        wrongCount,
        unanswered,
        accuracy: questions.length > 0 ? `${Math.round((correctCount / questions.length) * 100)}%` : '0%',
        totalTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        categoryBreakdown: Object.values(catMap),
      },
    })
  },

  // ============ 答题卡 ============

  handleOpenAnswerCard() {
    this.setData({ showAnswerCard: true })
  },

  handleOpenDraft() {
    const draftSheet = this.selectComponent('#draftSheet')
    if (draftSheet) {
      draftSheet.open()
    }
  },

  handleDraftOpenState() {
    this.setData({ showDraftSheet: true })
  },

  handleDraftCloseState() {
    this.setData({ showDraftSheet: false })
  },

  handleCloseAnswerCard() {
    this.setData({ showAnswerCard: false })
  },

  handleAnswerCardChange(e) {
    this.setData({ showAnswerCard: e.detail.visible })
  },

  handleSelectQuestion(e) {
    const { index } = e.detail
    const item = this.data.answerSheet[index - 1]
    const newSheet = this.data.answerSheet.map((a, i) => {
      if (i === index - 1) return { ...a, status: a.userAnswer ? a.status : 'current' }
      return a
    })

    this.setData({
      currentIndex: index,
      selectedAnswer: item.userAnswer || '',
      submitted: !!item.userAnswer,
      isCorrect: item.status === 'correct' ? true : item.status === 'wrong' ? false : null,
      answerSheet: newSheet,
      showAnswerCard: false,
    })
  },

  // ============ 重新开始 ============

  handleRestart() {
    this.stopTimer()
    storage.clearDraftSheet(this.data.draftSceneKey)
    this.setData({
      isPracticing: false,
      showConfig: true,
      showResult: false,
      questions: [],
      answerSheet: [],
      selectedAnswer: '',
      submitted: false,
      isCorrect: null,
      draftSceneKey: '',
    })
  },

  // ============ 首页 ============

  handleGoHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },
})
