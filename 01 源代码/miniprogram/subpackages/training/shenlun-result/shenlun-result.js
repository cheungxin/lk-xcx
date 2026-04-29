import router from '../../../router/index'
import storage from '../../../utils/storage'

const padNumber = (value) => String(value).padStart(2, '0')

const formatDateTime = (value) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`
}

Page({
  data: {
    navBarHeight: 88,
    hasResult: false,
    result: null,
    totalQuestions: 0,
    totalWords: 0,
    currentIndex: 0,
    currentQuestion: null,
    currentAnswer: '',
    currentWordCount: 0,
    finishedAtText: '--',
    durationText: '--',
    practiceLabel: '--',
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0

    this.setData({
      navBarHeight: statusBarHeight + 44,
    })
    this.loadResult()
  },

  onShow() {
    this.loadResult()
  },

  handleGoBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      router.back()
      return
    }

    router.switchTab('INDEX')
  },

  loadResult() {
    const result = storage.getShenlunResult()
    const questions = Array.isArray(result?.questions) ? result.questions : []
    const answers = Array.isArray(result?.answers) ? result.answers : []
    const wordCounts = Array.isArray(result?.wordCounts) ? result.wordCounts : []

    if (!result || !questions.length) {
      this.setData({
        hasResult: false,
        result: null,
        totalQuestions: 0,
        totalWords: 0,
        currentIndex: 0,
        currentQuestion: null,
        currentAnswer: '',
        currentWordCount: 0,
        finishedAtText: '--',
        durationText: '--',
        practiceLabel: '--',
      })
      return
    }

    const totalWords = wordCounts.reduce((sum, count) => sum + Number(count || 0), 0)
    const currentIndex = Math.min(this.data.currentIndex, questions.length - 1)

    this.setData({
      hasResult: true,
      result,
      totalQuestions: questions.length,
      totalWords,
      currentIndex,
      currentQuestion: questions[currentIndex] || null,
      currentAnswer: answers[currentIndex] || '',
      currentWordCount: wordCounts[currentIndex] || 0,
      finishedAtText: formatDateTime(result.finishedAt),
      durationText: result.timerText || '--',
      practiceLabel: result.practiceType === 'daily' ? '每日一练' : result.practiceType === 'exam' ? '限时训练' : '专项练习',
    })
  },

  handleQuestionTabTap(e) {
    const index = Number(e.currentTarget.dataset.index)
    const questions = Array.isArray(this.data.result?.questions) ? this.data.result.questions : []
    const answers = Array.isArray(this.data.result?.answers) ? this.data.result.answers : []
    const wordCounts = Array.isArray(this.data.result?.wordCounts) ? this.data.result.wordCounts : []

    if (index < 0 || index >= questions.length) {
      return
    }

    this.setData({
      currentIndex: index,
      currentQuestion: questions[index] || null,
      currentAnswer: answers[index] || '',
      currentWordCount: wordCounts[index] || 0,
    })
  },

  handleRetry() {
    const result = this.data.result

    if (!result) {
      router.back()
      return
    }

    if (result.practiceType === 'daily') {
      router.push('SHENLUN', {
        practiceType: 'daily',
        date: result.practiceDate,
      })
      return
    }

    router.push('SHENLUN', {
      practiceType: result.practiceType || 'practice',
      type: result.questionType,
      count: result.totalQuestions,
    })
  },

  handleBackHome() {
    router.switchTab('INDEX')
  },
})
