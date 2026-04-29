/**
 * 学习统计页 - 图表展示学习数据（纯CSS实现图表）
 */

const tool = require('../../../toolbox/tool')
import storage from '../../../utils/storage'

// 保留部分没有记录的 Mock 统计数据作为 fallback
const MOCK_STATS = {
  subjectData: [
    { name: '言语理解', accuracy: 78, total: 320, color: '#1664FF' },
    { name: '数量关系', accuracy: 55, total: 180, color: '#FF6B00' },
    { name: '判断推理', accuracy: 75, total: 350, color: '#00A870' },
    { name: '资料分析', accuracy: 68, total: 210, color: '#7B66FF' },
    { name: '常识判断', accuracy: 82, total: 198, color: '#00B2FF' },
  ],
  typeData: [
    { name: '单选题', count: 1050, percent: 83 },
    { name: '多选题', count: 128, percent: 10 },
    { name: '判断题', count: 80, percent: 7 },
  ],
  weakPoints: [
    { name: '暂无薄弱点数据', accuracy: 100, total: 0 }
  ]
}

Page({
  data: {
    navBarHeight: 88,
    activeTab: 'week',

    overview: {
      totalQuestions: 0,
      correctRate: 0,
      continueDays: 0,
      todayQuestions: 0,
      totalTime: '0h 0m',
      totalDays: 0,
    },
    dailyData: [],
    subjectData: MOCK_STATS.subjectData,
    typeData: MOCK_STATS.typeData,
    weakPoints: MOCK_STATS.weakPoints,

    // 计算每日最大值用于柱状图高度
    dailyMax: 0,
    subjectMax: 0,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    this.setData({ navBarHeight: statusBarHeight + 44 })
    this.calculateStats()
  },

  onShow() {
    this.calculateStats()
  },

  calculateStats() {
    const records = storage.getPracticeRecords() || []
    let totalQuestions = 0
    let correctCount = 0
    let totalTimeMins = 0
    let todayCount = 0

    const todayObj = new Date()
    todayObj.setHours(todayObj.getHours() + 8) // Fix quick timezone diffs
    const todayDate = todayObj.toISOString().split('T')[0]
    const dailyMap = {}

    records.forEach(r => {
      totalQuestions += r.questions || 0
      correctCount += r.correct || 0
      totalTimeMins += parseInt(r.duration) || 0

      const dateStr = r.date || (r.createdAt && r.createdAt.split('T')[0]) || '未知'
      if (dateStr === todayDate) {
        todayCount += r.questions || 0
      }

      if (dateStr !== '未知') {
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = { count: 0, correct: 0 }
        }
        dailyMap[dateStr].count += r.questions || 0
        dailyMap[dateStr].correct += r.correct || 0
      }
    })

    const checkIn = storage.getDailyCheckIn()
    const overview = {
      totalQuestions,
      correctRate: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
      continueDays: checkIn.streak || Object.keys(dailyMap).length || 0,
      todayQuestions: todayCount,
      totalTime: `${Math.floor(totalTimeMins / 60)}h ${totalTimeMins % 60}m`,
      totalDays: Object.keys(dailyMap).length,
    }

    const dailyData = []
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(d.getHours() + 8)
      const ds = d.toISOString().split('T')[0]
      const mapVal = dailyMap[ds] || { count: 0, correct: 0 }
      dailyData.push({
        day: i === 0 ? '今天' : weekdays[d.getDay()],
        count: mapVal.count,
        correct: mapVal.correct,
      })
    }

    const wrongQuestions = storage.getWrongQuestions() || []
    const weakMap = {}
    wrongQuestions.forEach(q => {
      const point = q.knowledgePoint || `${q.category || ''} > ${q.subCategory || ''}`
      if (!weakMap[point]) {
        weakMap[point] = { name: point, wrong: 0, total: 0 }
      }
      weakMap[point].wrong += q.errorCount || 1
      weakMap[point].total += (q.errorCount || 1) + (q.mastered ? 1 : 0)
    })

    let weakPoints = Object.values(weakMap).map(w => ({
      name: w.name,
      accuracy: w.total > 0 ? 100 - Math.round(w.wrong / w.total * 100) : 0,
      total: w.total
    })).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5)

    if (weakPoints.length === 0) {
      weakPoints = MOCK_STATS.weakPoints
    }

    const dailyMax = Math.max(...dailyData.map(d => d.count), 10)
    const subjectMax = Math.max(...this.data.subjectData.map(s => s.total), 10)

    this.setData({
      overview,
      dailyData,
      weakPoints,
      dailyMax,
      subjectMax
    })
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.value })
  },

  handleBack() {
    wx.navigateBack({ delta: 1 })
  },
})
