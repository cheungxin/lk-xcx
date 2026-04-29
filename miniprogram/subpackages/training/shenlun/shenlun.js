import router from '../../../router/index'
import storage from '../../../utils/storage'
import {
  getDailyShenlunQuestions,
  getQuestionTypeNames,
  getShenlunQuestions,
} from '../../../mock/shenlun'

const tool = require('../../../toolbox/tool')

const QUESTION_TYPE_NAMES = getQuestionTypeNames()

const padNumber = (value) => String(value).padStart(2, '0')

const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

const formatDurationText = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainSeconds = seconds % 60
  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(remainSeconds)}`
}

const formatMinutesText = (seconds) => `${Math.max(Math.floor(seconds / 60), 1)}分钟`

const normalizeQuestion = (question = {}, index = 0) => {
  const id = question.id || `shenlun-${Date.now()}-${index + 1}`

  return {
    ...question,
    id,
    typeName: QUESTION_TYPE_NAMES[question.type] || '申论题',
    tags: Array.isArray(question.tags) ? question.tags : [],
    scoringPoints: Array.isArray(question.scoringPoints) ? question.scoringPoints : [],
    wordLimit: Number(question.wordLimit || 0),
  }
}

const buildPageTitle = (practiceType, type) => {
  const typeName = QUESTION_TYPE_NAMES[type] || '申论'

  if (practiceType === 'daily') {
    return '申论每日一练'
  }

  if (practiceType === 'exam') {
    return `${typeName}限时训练`
  }

  return `${typeName}练习`
}

Page({
  data: {
    navBarHeight: 88,
    practiceType: 'practice',
    practiceDate: '',
    questionType: 'summary',
    pageTitle: '申论练习',
    currentIndex: 0,
    totalQuestions: 0,
    timerText: '00:00:00',
    startTime: 0,
    questions: [],
    answers: [],
    wordCounts: [],
    currentQuestion: null,
    currentAnswer: '',
    currentWordCount: 0,
    materialCollapsed: false,
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const practiceType = options?.practiceType || 'practice'
    const practiceDate = options?.date || formatDate()
    const questionType = options?.type || 'summary'
    const questionCount = Number.parseInt(options?.count, 10) || 3
    const questions = this.loadShenlunQuestions(questionType, questionCount, practiceDate, practiceType)

    if (!questions.length) {
      tool.toast('暂无可用申论题目')
      setTimeout(() => {
        router.back()
      }, 300)
      return
    }

    const finalQuestionType = questions[0].type || questionType
    const answers = questions.map(() => '')
    const wordCounts = questions.map(() => 0)

    this.setData({
      navBarHeight: statusBarHeight + 44,
      practiceType,
      practiceDate,
      questionType: finalQuestionType,
      pageTitle: buildPageTitle(practiceType, finalQuestionType),
      currentIndex: 0,
      totalQuestions: questions.length,
      timerText: '00:00:00',
      startTime: Date.now(),
      questions,
      answers,
      wordCounts,
      currentQuestion: questions[0],
      currentAnswer: '',
      currentWordCount: 0,
      materialCollapsed: false,
    })

    this.startTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  loadShenlunQuestions(type, count, date, practiceType) {
    if (practiceType === 'daily') {
      return (getDailyShenlunQuestions(date) || []).map((item, index) =>
        normalizeQuestion(item, index),
      )
    }

    return (getShenlunQuestions(type, count) || []).map((item, index) =>
      normalizeQuestion(item, index),
    )
  },

  startTimer() {
    this.stopTimer()
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.data.startTime) / 1000)
      this.setData({
        timerText: formatDurationText(elapsed),
      })
    }, 1000)
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  handleGoBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      router.back()
      return
    }

    router.switchTab('INDEX')
  },

  onAnswerInput(e) {
    const value = e.detail.value || ''
    const currentIndex = this.data.currentIndex
    const answers = [...this.data.answers]
    const wordCounts = [...this.data.wordCounts]

    answers[currentIndex] = value
    wordCounts[currentIndex] = value.trim().length

    this.setData({
      answers,
      wordCounts,
      currentAnswer: value,
      currentWordCount: wordCounts[currentIndex],
    })
  },

  switchQuestion(nextIndex) {
    if (nextIndex < 0 || nextIndex >= this.data.totalQuestions) {
      return
    }

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex] || null,
      currentAnswer: this.data.answers[nextIndex] || '',
      currentWordCount: this.data.wordCounts[nextIndex] || 0,
    })
  },

  handlePrev() {
    if (this.data.currentIndex <= 0) {
      tool.toast('当前已经是第一题')
      return
    }

    this.switchQuestion(this.data.currentIndex - 1)
  },

  handleNext() {
    if (this.data.currentIndex >= this.data.totalQuestions - 1) {
      tool.toast('当前已经是最后一题')
      return
    }

    this.switchQuestion(this.data.currentIndex + 1)
  },

  handleQuestionTabTap(e) {
    const index = Number(e.currentTarget.dataset.index)
    this.switchQuestion(index)
  },

  toggleMaterial() {
    this.setData({
      materialCollapsed: !this.data.materialCollapsed,
    })
  },

  buildResult() {
    const duration = Math.floor((Date.now() - this.data.startTime) / 1000)

    return {
      practiceType: this.data.practiceType,
      practiceDate: this.data.practiceDate,
      questionType: this.data.questionType,
      questionTypeName: QUESTION_TYPE_NAMES[this.data.questionType] || '申论',
      totalQuestions: this.data.totalQuestions,
      timerText: formatDurationText(duration),
      duration,
      questions: this.data.questions,
      answers: this.data.answers,
      wordCounts: this.data.wordCounts,
      finishedAt: new Date().toISOString(),
    }
  },

  handleFinish() {
    const unansweredCount = this.data.answers.filter((item) => !String(item).trim()).length

    if (unansweredCount > 0) {
      wx.showModal({
        title: '提示',
        content: `还有 ${unansweredCount} 题未作答，确定现在提交吗？`,
        confirmText: '继续作答',
        cancelText: '确认提交',
        success: (res) => {
          if (!res.confirm) {
            this.submitShenlun()
          }
        },
      })
      return
    }

    this.submitShenlun()
  },

  submitShenlun() {
    const result = this.buildResult()
    const recordTitle =
      result.practiceType === 'daily'
        ? `申论每日一练 ${result.practiceDate}`
        : `${result.questionTypeName}练习`

    this.stopTimer()
    storage.setShenlunResult(result)
    storage.addShenlunRecord({
      mode: result.practiceType,
      practiceDate: result.practiceDate,
      questionType: result.questionType,
      title: recordTitle,
      questions: result.totalQuestions,
      correct: 0,
      accuracy: 0,
      duration: formatMinutesText(result.duration),
      subject: 'shenlun',
      finishedAt: result.finishedAt,
      result,
    })
    storage.appendRecord({
      type:
        result.practiceType === 'daily'
          ? '申论每日一练'
          : result.practiceType === 'exam'
            ? '申论限时训练'
            : '申论专项练习',
      title: recordTitle,
      questions: result.totalQuestions,
      correct: 0,
      accuracy: 0,
      duration: formatMinutesText(result.duration),
      subject: 'shenlun',
    })

    router.push('SHENLUN_RESULT')
  },
})
