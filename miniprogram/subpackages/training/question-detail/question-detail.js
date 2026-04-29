import router from '../../../router/index'
import storage from '../../../utils/storage'
import {
  decodeRouteParam,
  normalizeQuestion,
  normalizeAnswerItem,
  decorateQuestionForAnalysis,
} from '../../../utils/analysis-viewer'

const QUESTION_SOURCE_TITLE_MAP = {
  wrong: '错题详情',
  favorite: '收藏详情',
}

const formatDisplayTime = (value = '') => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 16)
  }

  const pad = (item) => String(item).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

Page({
  data: {
    navBarHeight: 88,
    pageTitle: '题目详情',
    source: 'wrong',
    question: null,
    hasQuestion: false,
    emptyTitle: '题目不存在',
    emptyDesc: '该题目可能已被移除，请返回列表重新选择。',
    showMaterial: false,
    currentMaterial: {},
    materialScrollTop: 0,
    materialPopupHeight: 420,
  },

  onLoad(options = {}) {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const materialPopupHeight = Math.max(
      Math.round((systemInfo.windowHeight || 667) * 0.82),
      420,
    )

    this.setData({
      navBarHeight: statusBarHeight + 44,
      materialPopupHeight,
    })

    this.loadQuestion(options)
  },

  getQuestionBySource(source = 'wrong', questionId = '') {
    if (!questionId) {
      return null
    }

    if (source === 'favorite') {
      return (storage.getFavoriteQuestions() || []).find((item) => item.id === questionId) || null
    }

    return (storage.getWrongQuestions() || []).find((item) => item.id === questionId) || null
  },

  loadQuestion(options = {}) {
    const source = decodeRouteParam(options.source || 'wrong')
    const questionId = decodeRouteParam(options.questionId || options.id || '')
    const title = decodeRouteParam(options.title || '')
    const rawQuestion = this.getQuestionBySource(source, questionId)

    if (!rawQuestion) {
      this.setData({
        source,
        pageTitle: title || QUESTION_SOURCE_TITLE_MAP[source] || '题目详情',
        question: null,
        hasQuestion: false,
      })
      return
    }

    const normalizedQuestion = normalizeQuestion(rawQuestion, 0)
    const answerItem = normalizeAnswerItem(
      {
        selectedAnswers: rawQuestion.selectedAnswers || [],
        userAnswer: rawQuestion.userAnswer || rawQuestion.selectedAnswers || '',
        status: rawQuestion.status || '',
      },
      normalizedQuestion,
    )
    const question = {
      ...decorateQuestionForAnalysis(normalizedQuestion, answerItem, 1),
      errorCount: rawQuestion.errorCount || 1,
      addedAt: formatDisplayTime(rawQuestion.addedAt || rawQuestion.lastErrorAt || ''),
      sourceLabel: source === 'favorite' ? '收藏题目' : '错题本',
    }

    this.setData({
      source,
      pageTitle: title || QUESTION_SOURCE_TITLE_MAP[source] || '题目详情',
      question,
      hasQuestion: true,
    })
  },

  handleGoBack() {
    const pages = getCurrentPages()

    if (pages.length > 1) {
      router.back()
      return
    }

    router.switchTab('INDEX')
  },

  handleShowMaterial() {
    const question = this.data.question

    if (!question || (!question.material && !question.materialImage)) {
      return
    }

    this.setData({
      showMaterial: true,
      materialScrollTop: 0,
      currentMaterial: {
        title: question.materialTitle || '给定材料',
        text: question.material,
        image: question.materialImage,
      },
    })
  },

  handleCloseMaterial() {
    this.setData({ showMaterial: false })
  },

  handleMaterialChange(e) {
    this.setData({ showMaterial: e.detail.visible })
  },
})
