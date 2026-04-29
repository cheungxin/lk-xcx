/**
 * 学习记录页 - 答题历史时间线
 */
const app = getApp();
const { statusBarHeight, titleBarHeight, navigationBarHeight, capsule } = app.globalData;
const tool = require('../../../toolbox/tool')

import storage from '../../../utils/storage'
import router from '../../../router/index'

const getWeekday = (dateStr) => {
  const dateStrParts = dateStr.split('-')
  const date = new Date(dateStrParts[0], parseInt(dateStrParts[1]) - 1, dateStrParts[2])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - date.getTime()
  const MathRoundFloor = Math.floor
  const diffDays = MathRoundFloor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

const inferRecordResultSource = (record = {}) =>
  record.resultSource || (record.type === '模拟刷题' ? 'exam' : 'practice')

const inferRecordPracticeType = (record = {}) => {
  if (record.practiceType) {
    return record.practiceType
  }

  if (record.type === '模拟刷题') {
    return 'exam'
  }

  if (record.type === '每日一练') {
    return 'daily'
  }

  return 'practice'
}

const buildHistoryCandidates = () => {
  const practiceHistories = (storage.getPracticeResultHistory() || []).map((item) => ({
    ...item,
    resultSource: 'practice',
    practiceType: item.practiceType || 'practice',
    resultTitle: item.paperTitle || item.paperName || '',
  }))
  const examHistories = (storage.getExamResultHistory() || []).map((item) => ({
    ...item,
    resultSource: 'exam',
    practiceType: 'exam',
    resultTitle: item.paperTitle || item.paperName || '',
  }))

  return [...examHistories, ...practiceHistories]
}

const matchHistoryRecord = (record = {}, historyCandidates = []) =>
  historyCandidates.find((item) => {
    const sameDate = !record.date || !item.date || record.date === item.date
    const sameTitle = !record.title || !item.resultTitle || record.title === item.resultTitle
    const sameQuestions =
      !record.questions || !item.totalQuestions || Number(record.questions) === Number(item.totalQuestions)
    const sameCorrect =
      record.correct === undefined ||
      item.correctCount === undefined ||
      Number(record.correct) === Number(item.correctCount)

    return sameDate && sameTitle && sameQuestions && sameCorrect
  }) || null

Page({
  data: {
    navigationBarHeight,
    records: [],
    filteredRecords: [],
    // 筛选标签
    filterTabs: [
      { label: '全部', value: 'all' },
      { label: '快练', value: 'quick' },
      { label: '行测', value: 'xingce' },
      { label: '申论', value: 'shenlun' },
    ],
    activeTab: 'all',
  },

  onLoad() {
    this.setData({
      navBarHeight: navigationBarHeight,
    })
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const practiceRecords = storage.getPracticeRecords() || []
    const historyCandidates = buildHistoryCandidates()

    // 按日期分组
    const groupMap = {}
    practiceRecords.forEach(record => {
      const recordDate = record.date || (record.createdAt && record.createdAt.split('T')[0]) || '未知'
      const matchedHistory = record.resultId ? null : matchHistoryRecord(record, historyCandidates)
      
      // 识别分类
      let category = 'xingce'
      if (record.type === '快练' || (record.title && record.title.includes('快练'))) {
        category = 'quick'
      } else if (record.subject === 'shenlun' || (record.type && record.type.includes('申论')) || (record.title && record.title.includes('申论'))) {
        category = 'shenlun'
      }

      if (!groupMap[recordDate]) {
        groupMap[recordDate] = {
          date: recordDate,
          weekday: recordDate !== '未知' ? getWeekday(recordDate) : '',
          records: [],
          summary: { total: 0, correct: 0, time: 0 }
        }
      }
      groupMap[recordDate].records.push({
        ...record,
        category,
        resultSource: inferRecordResultSource(record),
        practiceType: inferRecordPracticeType(record),
        resultId: record.resultId || (matchedHistory || {}).id || '',
        detailAvailable: !!(record.resultId || matchedHistory),
        // UI 需要展示用
        accuracy: record.accuracy || 0,
      })
      groupMap[recordDate].summary.total += record.questions || 0
      groupMap[recordDate].summary.correct += record.correct || 0

      const durationNum = parseInt(record.duration) || 0
      groupMap[recordDate].summary.time += durationNum
    })

    const recordsList = Object.values(groupMap).sort((a, b) => {
      if (a.date === '未知') return 1
      if (b.date === '未知') return -1
      return new Date(b.date) - new Date(a.date)
    })

    recordsList.forEach(group => {
      group.summary.time = group.summary.time + '分钟'
    })

    this.setData({
      records: recordsList,
      filteredRecords: recordsList
    }, () => {
      if (this.data.activeTab !== 'all') {
        this.filterData(this.data.activeTab)
      }
    })
  },

  onTabChange(e) {
    const value = e.detail.value
    this.setData({ activeTab: value })
    this.filterData(value)
  },

  filterData(value) {
    const { records } = this.data
    if (value === 'all') {
      this.setData({ filteredRecords: records })
    } else {
      const filtered = records.map(day => {
        const filteredDaysRecords = day.records.filter(r => r.category === value)
        const summary = { total: 0, correct: 0, time: 0 }
        
        filteredDaysRecords.forEach(r => {
          summary.total += r.questions || 0
          summary.correct += r.correct || 0
          summary.time += parseInt(r.duration) || 0
        })

        return {
          ...day,
          summary: {
            ...summary,
            time: summary.time + '分钟'
          },
          records: filteredDaysRecords
        }
      }).filter(day => day.records.length > 0)
      
      this.setData({ filteredRecords: filtered })
    }
  },

  handleBack() {
    wx.navigateBack({ delta: 1 })
  },

  handleRecordTap(e) {
    const record = e.currentTarget.dataset.record || {}

    if (!record.resultId) {
      tool.toast('该记录暂无详情数据，请完成一次新的练习后查看')
      return
    }

    router.push('EXAM_REPORT', {
      practiceType: record.practiceType || 'practice',
      resultSource: record.resultSource || 'practice',
      historyId: record.resultId,
    })
  },
})
