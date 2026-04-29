/**
 * 数资数算答题页 - 图表公式与草稿纸
 * 专门针对数量关系和资料分析的答题页面
 * 提供草稿纸、常用公式参考等辅助功能
 */

const tool = require('../../../toolbox/tool')

// Mock 数资题目
const MATH_QUESTIONS = [
  {
    id: 'm001',
    type: '数量关系',
    stem: '某工程队甲组单独完成一项工程需要12天，乙组单独完成需要18天。甲、乙两组合作，几天可以完成这项工程？',
    options: [
      { id: 'A', text: '6天' },
      { id: 'B', text: '7.2天' },
      { id: 'C', text: '8天' },
      { id: 'D', text: '9天' },
    ],
    correctAnswer: 'B',
    explanation: '甲组效率1/12，乙组效率1/18，合作效率 = 1/12 + 1/18 = 5/36。完成时间 = 36/5 = 7.2天。',
    formula: '1/T = 1/T₁ + 1/T₂',
  },
  {
    id: 'm002',
    type: '资料分析',
    stem: '根据下表，2022年该市进出口总额同比增长了多少亿元？\n\n2022年该市出口额为2800亿元，同比增长8.5%；进口额为1800亿元，同比增长5.2%。',
    options: [
      { id: 'A', text: '286.6' },
      { id: 'B', text: '312.4' },
      { id: 'C', text: '298.8' },
      { id: 'D', text: '305.2' },
    ],
    correctAnswer: 'A',
    explanation: '2021年出口额 = 2800/1.085 ≈ 2580.6亿元，进口额 = 1800/1.052 ≈ 1711.0亿元。2021年总额 = 4291.6亿元。2022年总额 = 4600亿元。增长 = 4600 - 4291.6 ≈ 308.4亿元。（简化算法：增量 ≈ 2800×8.5% + 1800×5.2% = 238 + 93.6 = 331.6，选最接近的A）',
    formula: '增量 = 现期值 × 增长率',
    hasTable: true,
  },
  {
    id: 'm003',
    type: '数量关系',
    stem: '某商品原价200元，先提价20%，再打八折出售，最终售价是多少元？',
    options: [
      { id: 'A', text: '192' },
      { id: 'B', text: '180' },
      { id: 'C', text: '168' },
      { id: 'D', text: '160' },
    ],
    correctAnswer: 'A',
    explanation: '提价20%后 = 200 × 1.2 = 240元，再打八折 = 240 × 0.8 = 192元。',
    formula: '最终价 = 原价 × (1 + a%) × b%',
  },
  {
    id: 'm004',
    type: '数量关系',
    stem: '甲、乙两人从A、B两地同时出发相向而行。甲速60km/h，乙速40km/h，两人在距离中点30km处相遇。求A、B两地距离。',
    options: [
      { id: 'A', text: '150km' },
      { id: 'B', text: '180km' },
      { id: 'C', text: '200km' },
      { id: 'D', text: '300km' },
    ],
    correctAnswer: 'D',
    explanation: '相遇时甲比乙多走30×2=60km。设相遇时间t，则60t - 40t = 60，t = 3h。A、B距离 = (60+40) × 3 = 300km。',
    formula: '路程差 = 速度差 × 时间',
  },
  {
    id: 'm005',
    type: '资料分析',
    stem: '某省2023年GDP为52000亿元，同比增长6.8%。若2024年保持相同增速，则2024年GDP预计约为多少亿元？',
    options: [
      { id: 'A', text: '54536' },
      { id: 'B', text: '55536' },
      { id: 'C', text: '56280' },
      { id: 'D', text: '57800' },
    ],
    correctAnswer: 'B',
    explanation: '2024年GDP = 52000 × (1 + 6.8%) = 52000 × 1.068 = 55536亿元。',
    formula: '预计值 = 基期值 × (1 + 增长率)',
  },
]

// 常用公式参考
const FORMULAS = [
  { category: '工程问题', items: ['合作效率 = 1/T₁ + 1/T₂ + ...', '工作总量 = 效率 × 时间'] },
  { category: '行程问题', items: ['路程 = 速度 × 时间', '相遇问题：S = (V₁ + V₂) × T', '追及问题：S = (V₁ - V₂) × T'] },
  { category: '利润问题', items: ['利润 = 售价 - 成本', '利润率 = 利润 / 成本 × 100%', '售价 = 成本 × (1 + 利润率)'] },
  { category: '浓度问题', items: ['浓度 = 溶质 / 溶液 × 100%', '混合浓度 = (C₁V₁ + C₂V₂) / (V₁ + V₂)'] },
  { category: '增长率', items: ['增长率 = (现期 - 基期) / 基期 × 100%', '基期值 = 现期值 / (1 + 增长率)', '增长量 = 基期值 × 增长率'] },
]

Page({
  data: {
    navBarHeight: 88,
    draftSceneKey: 'draft:math:default',

    // 答题状态
    questions: MATH_QUESTIONS,
    currentIndex: 0,
    selectedAnswer: '',
    submitted: false,
    isCorrect: null,
    totalQuestions: MATH_QUESTIONS.length,

    // 公式参考
    showFormulas: false,
    showDraftSheet: false,
    formulas: FORMULAS,

    // 当前公式分类
    expandedFormula: '',

    // 计时
    timerText: '00:00',
    startTime: 0,
    timerInterval: null,
    
    themeMode: 'light',
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    this.setData({ navBarHeight: statusBarHeight + 44, startTime: Date.now() })
    this.startTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000)
      const m = Math.floor(elapsed / 60)
      const s = elapsed % 60
      this.setData({ timerText: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` })
    }, 1000)
  },

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null }
  },

  // ============ 答题 ============

  handleOptionTap(e) {
    const { id } = e.currentTarget.dataset
    if (this.data.submitted) return

    const question = this.data.questions[this.data.currentIndex]
    const isCorrect = question.correctAnswer === id
    this.setData({ selectedAnswer: id, submitted: true, isCorrect })
    wx.vibrateShort({ type: isCorrect ? 'light' : 'medium' })
  },

  handleNext() {
    if (this.data.currentIndex >= this.data.totalQuestions - 1) {
      tool.toast('已经是最后一题')
      return
    }
    this.setData({
      currentIndex: this.data.currentIndex + 1,
      selectedAnswer: '',
      submitted: false,
      isCorrect: null,
    })
  },

  handlePrev() {
    if (this.data.currentIndex <= 0) {
      tool.toast('已经是第一题')
      return
    }
    this.setData({
      currentIndex: this.data.currentIndex - 1,
      selectedAnswer: '',
      submitted: false,
      isCorrect: null,
    })
  },

  // ============ 草稿纸 ============

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

  // ============ 公式参考 ============

  handleShowFormulas() {
    this.setData({ showFormulas: true })
  },

  handleCloseFormulas() {
    this.setData({ showFormulas: false })
  },

  handleFormulasChange(e) {
    this.setData({ showFormulas: e.detail.visible })
  },

  handleToggleFormula(e) {
    const { category } = e.currentTarget.dataset
    this.setData({
      expandedFormula: this.data.expandedFormula === category ? '' : category,
    })
  },

  // ============ 导航 ============

  handleBack() {
    wx.navigateBack({ delta: 1 })
  },
})
