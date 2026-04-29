/**
 * 背诵页 - 知识点背诵与记忆复习
 * 支持知识分类浏览、卡片翻转背诵、收藏记忆
 */

const tool = require('../../../toolbox/tool')

// Mock 知识点数据
const KNOWLEDGE_CATEGORIES = [
  { id: 'politics', name: '政治理论', icon: 'flag', color: '#E34D59', count: 15 },
  { id: 'law', name: '法律常识', icon: 'gavel', color: '#1664FF', count: 12 },
  { id: 'economy', name: '经济常识', icon: 'chart-bar', color: '#00A870', count: 10 },
  { id: 'culture', name: '文化常识', icon: 'book', color: '#FF6B00', count: 8 },
  { id: 'geography', name: '地理常识', icon: 'location', color: '#7B66FF', count: 9 },
  { id: 'history', name: '历史常识', icon: 'time', color: '#00B2FF', count: 11 },
]

const KNOWLEDGE_POINTS = {
  politics: [
    {
      id: 'kp001',
      title: '新发展理念',
      category: '政治理论',
      keywords: ['创新', '协调', '绿色', '开放', '共享'],
      content: '创新、协调、绿色、开放、共享的新发展理念，是在深刻总结国内外发展经验教训、深入分析国内外发展大势的基础上形成的，是关系我国发展全局的一场深刻变革。',
      mastery: 0, // 0:未背, 1:已背, 2:已掌握
    },
    {
      id: 'kp002',
      title: '社会主义核心价值观',
      category: '政治理论',
      keywords: ['富强', '民主', '文明', '和谐', '自由', '平等', '公正', '法治', '爱国', '敬业', '诚信', '友善'],
      content: '富强、民主、文明、和谐是国家层面的价值目标；自由、平等、公正、法治是社会层面的价值取向；爱国、敬业、诚信、友善是公民个人层面的价值准则。',
      mastery: 1,
    },
    {
      id: 'kp003',
      title: '四个全面',
      category: '政治理论',
      keywords: ['全面建成小康社会', '全面深化改革', '全面依法治国', '全面从严治党'],
      content: '"四个全面"战略布局：全面建设社会主义现代化国家、全面深化改革、全面依法治国、全面从严治党。',
      mastery: 0,
    },
  ],
  law: [
    {
      id: 'kp004',
      title: '宪法基本特征',
      category: '法律常识',
      keywords: ['根本法', '最高效力', '制定修改严格'],
      content: '宪法是国家的根本法，具有最高的法律效力。一切法律、行政法规和地方性法规都不得同宪法相抵触。宪法的修改由全国人大常委会或五分之一以上全国人大代表提议，并由全国人大全体代表三分之二以上多数通过。',
      mastery: 0,
    },
    {
      id: 'kp005',
      title: '公民基本权利',
      category: '法律常识',
      keywords: ['平等权', '政治权利', '人身自由', '社会经济权利'],
      content: '我国公民的基本权利包括：平等权、政治权利和自由（选举权和被选举权、言论出版集会结社游行示威的自由）、宗教信仰自由、人身自由（人格尊严、住宅不受侵犯、通信自由和通信秘密）、社会经济权利（财产权、劳动权、休息权、获得物质帮助权）、文化教育权利等。',
      mastery: 2,
    },
  ],
  economy: [
    {
      id: 'kp006',
      title: 'GDP与GNP的区别',
      category: '经济常识',
      keywords: ['GDP', 'GNP', '国土原则', '国民原则'],
      content: 'GDP（国内生产总值）：按国土原则计算，一定时期内一国领土范围内生产的最终产品和服务的市场价值。GNP（国民生产总值）：按国民原则计算，一定时期内本国公民生产的最终产品和服务的市场价值。GDP = GNP + 外国公民在本国生产 - 本国公民在外国生产。',
      mastery: 0,
    },
  ],
  culture: [],
  geography: [],
  history: [],
}

Page({
  data: {
    navBarHeight: 88,
    tabBarHeight: 120,
    categories: KNOWLEDGE_CATEGORIES,
    selectedCategory: 'all',
    searchValue: '',

    // 知识点列表
    allPoints: Object.values(KNOWLEDGE_POINTS).flat(),
    displayPoints: Object.values(KNOWLEDGE_POINTS).flat(),

    // 背诵模式
    isReciting: false,
    currentPoint: null,
    showAnswer: false,

    // 统计
    totalPoints: 0,
    memorizedCount: 0,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const safeBottom = systemInfo.safeAreaInsets?.bottom || 0

    const allPoints = Object.values(KNOWLEDGE_POINTS).flat()
    const memorizedCount = allPoints.filter(p => p.mastery > 0).length

    this.setData({
      navBarHeight: statusBarHeight + 44,
      tabBarHeight: 116 + safeBottom * 2,
      totalPoints: allPoints.length,
      memorizedCount,
    })
  },

  onShow() {
    // 从背诵模式返回时刷新列表
    if (this.data.isReciting) {
      this.setData({ isReciting: false })
    }
  },

  // ============ 搜索 ============

  onSearch(e) {
    const value = e.detail.value
    this.setData({ searchValue: value })
    this.filterPoints()
  },

  // ============ 分类筛选 ============

  handleCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ selectedCategory: id })
    this.filterPoints()
  },

  filterPoints() {
    let points = [...this.data.allPoints]

    // 按分类筛选
    if (this.data.selectedCategory !== 'all') {
      points = points.filter(p => KNOWLEDGE_POINTS[this.data.selectedCategory]?.some(kp => kp.id === p.id))
    }

    // 按搜索词筛选
    if (this.data.searchValue) {
      const keyword = this.data.searchValue.toLowerCase()
      points = points.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.keywords.some(k => k.toLowerCase().includes(keyword)) ||
        p.content.toLowerCase().includes(keyword)
      )
    }

    this.setData({ displayPoints: points })
  },

  // ============ 背诵模式 ============

  handleStartRecite(e) {
    const { index } = e.currentTarget.dataset
    const point = this.data.displayPoints[index]
    this.setData({
      isReciting: true,
      currentPoint: { ...point },
      showAnswer: false,
    })
  },

  handleFlip() {
    this.setData({ showAnswer: !this.data.showAnswer })
  },

  handleMarkMemorized() {
    const point = this.data.currentPoint
    const newMastery = point.mastery === 2 ? 0 : 2

    // 更新本地数据
    const allPoints = this.data.allPoints.map(p => {
      if (p.id === point.id) return { ...p, mastery: newMastery }
      return p
    })

    this.setData({
      'currentPoint.mastery': newMastery,
      allPoints,
    })

    tool.toast(newMastery === 2 ? '已标记为掌握' : '已取消标记')
  },

  handleMarkReviewing() {
    const point = this.data.currentPoint
    const newMastery = point.mastery === 1 ? 0 : 1

    const allPoints = this.data.allPoints.map(p => {
      if (p.id === point.id) return { ...p, mastery: newMastery }
      return p
    })

    this.setData({
      'currentPoint.mastery': newMastery,
      allPoints,
    })

    tool.toast(newMastery === 1 ? '已标记为背诵中' : '已取消标记')
  },

  handleNextPoint() {
    const points = this.data.displayPoints
    const currentIdx = points.findIndex(p => p.id === this.data.currentPoint.id)
    if (currentIdx < points.length - 1) {
      this.setData({
        currentPoint: { ...points[currentIdx + 1] },
        showAnswer: false,
      })
    } else {
      tool.toast('已经是最后一个知识点了')
    }
  },

  handlePrevPoint() {
    const points = this.data.displayPoints
    const currentIdx = points.findIndex(p => p.id === this.data.currentPoint.id)
    if (currentIdx > 0) {
      this.setData({
        currentPoint: { ...points[currentIdx - 1] },
        showAnswer: false,
      })
    } else {
      tool.toast('已经是第一个知识点了')
    }
  },

  handleExitRecite() {
    this.setData({
      isReciting: false,
      currentPoint: null,
    })
    this.filterPoints()
  },

  handleBack() {
    if (this.data.isReciting) {
      this.handleExitRecite()
    } else {
      wx.navigateBack({ delta: 1 })
    }
  },
})
