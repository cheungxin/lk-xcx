import router from '../../../router/index'
import storage from '../../../utils/storage'
import {
  getDailyShenlunQuestions,
  getQuestionTypeNames,
} from '../../../mock/shenlun'

const QUESTION_TYPE_NAMES = getQuestionTypeNames()
const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const padNumber = (value) => String(value).padStart(2, '0')

const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

const buildCalendarDays = (year, month, records = {}, todayDate = '') => {
  const days = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDate = new Date(year, month, 0).getDate()
  const startWeekday = firstDay.getDay()

  for (let index = 0; index < startWeekday; index += 1) {
    days.push({
      date: '',
      day: '',
      isToday: false,
      isCurrentMonth: false,
      status: 'none',
    })
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const currentDate = formatDate(new Date(year, month - 1, day))
    const record = records[currentDate] || null
    let status = 'future'

    if (currentDate < todayDate) {
      status = record ? 'done' : 'missed'
    } else if (currentDate === todayDate) {
      status = record ? 'done' : 'future'
    }

    days.push({
      date: currentDate,
      day,
      isToday: currentDate === todayDate,
      isCurrentMonth: true,
      status,
    })
  }

  while (days.length % 7 !== 0) {
    days.push({
      date: '',
      day: '',
      isToday: false,
      isCurrentMonth: false,
      status: 'none',
    })
  }

  return days
}

const normalizePreviewQuestion = (question = {}) => ({
  id: question.id || `daily-shenlun-${Date.now()}`,
  title: question.title || '申论每日一练',
  typeName: QUESTION_TYPE_NAMES[question.type] || '申论题',
  materialTitle: question.materialTitle || '给定材料',
  questionText: question.question || '',
  wordLimit: Number(question.wordLimit || 0),
  source: question.source || '',
})

Page({
  data: {
    navBarHeight: 88,
    weekLabels: WEEK_LABELS,
    todayDate: '',
    selectedPreviewDate: '',
    calendarYear: 0,
    calendarMonth: 0,
    calendarDays: [],
    todayDone: false,
    previewQuestion: null,
    streak: 0,
    totalDone: 0,
    actionText: '开始今日练习',
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const todayDate = formatDate(new Date())
    const today = new Date(todayDate)

    this.setData({
      navBarHeight: statusBarHeight + 44,
      todayDate,
      selectedPreviewDate: todayDate,
      calendarYear: today.getFullYear(),
      calendarMonth: today.getMonth() + 1,
    })

    this.refreshPage()
  },

  onShow() {
    this.refreshPage()
  },

  getDailyRecordMap() {
    return storage.getShenlunRecords().reduce((result, item) => {
      if (item.mode !== 'daily' || !item.practiceDate || !item.result) {
        return result
      }

      const current = result[item.practiceDate]
      if (!current || new Date(item.finishedAt || 0).getTime() >= new Date(current.finishedAt || 0).getTime()) {
        result[item.practiceDate] = item
      }

      return result
    }, {})
  },

  refreshPage() {
    const records = this.getDailyRecordMap()
    const targetDate = this.data.selectedPreviewDate || this.data.todayDate
    const currentRecord = records[targetDate] || null
    const previewQuestion = normalizePreviewQuestion((getDailyShenlunQuestions(targetDate) || [])[0] || {})
    const doneDates = Object.keys(records)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({ date }))

    this.setData({
      todayDone: !!records[this.data.todayDate],
      calendarDays: buildCalendarDays(
        this.data.calendarYear,
        this.data.calendarMonth,
        records,
        this.data.todayDate,
      ),
      previewQuestion,
      streak: storage.calculateStreak(doneDates),
      totalDone: doneDates.length,
      actionText: currentRecord ? '查看参考答案' : targetDate === this.data.todayDate ? '开始今日练习' : '练习这一天',
    })
  },

  handlePrevMonth() {
    const currentMonth = new Date(this.data.calendarYear, this.data.calendarMonth - 2, 1)
    this.setData({
      calendarYear: currentMonth.getFullYear(),
      calendarMonth: currentMonth.getMonth() + 1,
    })
    this.refreshPage()
  },

  handleNextMonth() {
    const currentMonth = new Date(this.data.calendarYear, this.data.calendarMonth, 1)
    this.setData({
      calendarYear: currentMonth.getFullYear(),
      calendarMonth: currentMonth.getMonth() + 1,
    })
    this.refreshPage()
  },

  handleCalendarDayTap(e) {
    const { date, status } = e.currentTarget.dataset

    if (!date || status === 'none') {
      return
    }

    this.setData({
      selectedPreviewDate: date,
    })
    this.refreshPage()
  },

  handlePrimaryAction() {
    const targetDate = this.data.selectedPreviewDate || this.data.todayDate
    const currentRecord = this.getDailyRecordMap()[targetDate]

    if (currentRecord?.result) {
      storage.setShenlunResult(currentRecord.result)
      router.push('SHENLUN_RESULT')
      return
    }

    router.push('SHENLUN', {
      practiceType: 'daily',
      date: targetDate,
    })
  },
})
