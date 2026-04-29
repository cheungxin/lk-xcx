import router from '../../../router/index'
import storage from '../../../utils/storage'
import {
  getDailyQuestions,
  getDailyRecordsMock,
  hasDailyQuestions,
} from '../../../mock/daily'

const tool = require('../../../toolbox/tool')

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const padNumber = (value) => String(value).padStart(2, '0')

const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

const normalizeQuestionPreview = (question = {}, index = 0) => ({
  id: question.id || question.questionId || `daily-question-${index + 1}`,
  index: index + 1,
  stem: question.stem || question.content || '',
  knowledgePoint:
    question.knowledgePoint ||
    [question.category, question.subCategory].filter(Boolean).join(' > '),
  type: question.type === 'single' ? '单选题' : (question.type || '单选题'),
})

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
      status = record && record.done ? 'done' : 'missed'
    } else if (currentDate === todayDate) {
      status = record && record.done ? 'done' : 'future'
    } else {
      status = 'future'
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

Page({
  data: {
    navBarHeight: 88,
    weekLabels: WEEK_LABELS,
    todayDate: '',
    todayDone: false,
    selectedPreviewDate: '',
    calendarYear: 0,
    calendarMonth: 0,
    calendarDays: [],
    previewQuestions: [],
    streak: 0,
    totalDone: 0,
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

  handleBack() {
    wx.navigateBack()
  },

  onShow() {
    this.refreshPage()
  },

  getMergedDailyRecords() {
    return {
      ...getDailyRecordsMock(),
      ...storage.getDailyRecords(),
    }
  },

  getQuestionsForDate(date) {
    const records = this.getMergedDailyRecords()
    const record = records[date] || null

    if (record && Array.isArray(record.questions) && record.questions.length) {
      return record.questions
    }

    if (!hasDailyQuestions(date)) {
      return []
    }

    return getDailyQuestions(date) || []
  },

  refreshPage() {
    const records = this.getMergedDailyRecords()
    const { todayDate, selectedPreviewDate, calendarYear, calendarMonth } = this.data
    const todayRecord = records[todayDate] || null
    const targetDate = selectedPreviewDate || todayDate
    const previewQuestions = this.getQuestionsForDate(targetDate).map((question, index) =>
      normalizeQuestionPreview(question, index),
    )
    const doneDates = Object.keys(records)
      .filter((date) => records[date] && records[date].done)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({ date }))

    this.setData({
      todayDone: !!(todayRecord && todayRecord.done),
      calendarDays: buildCalendarDays(calendarYear, calendarMonth, records, todayDate),
      previewQuestions,
      streak: storage.calculateStreak(doneDates),
      totalDone: doneDates.length,
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

    if (!date || status === 'none' || status === 'future') {
      return
    }

    if (!hasDailyQuestions(date) && !this.getMergedDailyRecords()[date]) {
      tool.toast('该日期暂无题目')
      return
    }

    this.setData({
      selectedPreviewDate: date,
    })
    this.refreshPage()
  },

  handlePrimaryAction() {
    const { todayDate, todayDone } = this.data

    if (!todayDone) {
      router.push('PRACTICE', {
        practiceType: 'daily',
        date: todayDate,
      })
      return
    }

    const records = this.getMergedDailyRecords()
    const todayRecord = records[todayDate]
    const questions = this.getQuestionsForDate(todayDate)

    if (!todayRecord || !Array.isArray(todayRecord.answerSheet) || !todayRecord.answerSheet.length) {
      tool.toast('今日解析数据暂未生成')
      return
    }

    storage.setPracticeResult({
      practiceType: 'daily',
      practiceDate: todayDate,
      paperTitle: todayRecord.paperTitle || `每日一练 ${todayDate}`,
      totalQuestions: todayRecord.totalQuestions || todayRecord.total || questions.length,
      correctCount: todayRecord.correctCount ?? todayRecord.correct ?? 0,
      wrongCount:
        todayRecord.wrongCount ??
        Math.max(
          (todayRecord.totalQuestions || todayRecord.total || questions.length) -
            (todayRecord.correctCount ?? todayRecord.correct ?? 0),
          0,
        ),
      unansweredCount: todayRecord.unansweredCount || 0,
      accuracy: String(todayRecord.accuracy ?? '0.0').replace('%', ''),
      duration: todayRecord.duration || 0,
      timerText: todayRecord.timerText || '',
      answerSheet: todayRecord.answerSheet,
      questions,
      finishedAt: todayRecord.finishedAt || new Date().toISOString(),
    })

    router.push('ANALYSIS', {
      practiceType: 'daily',
      resultSource: 'practice',
    })
  },
})
