import router from '../../../router/index'
import storage from '../../../utils/storage'
import {
  getKnowledgeLeafName,
  getQuestionKnowledgeSegments,
  getQuestionSectionName,
} from '../../../utils/question-schema'

const tool = require('../../../toolbox/tool')

const EXAM_PRACTICE_TYPE = 'exam'

const parseAccuracyValue = (value) => {
  const normalized = String(value === undefined || value === null ? '' : value).replace('%', '')
  const parsedValue = Number.parseFloat(normalized)
  return Number.isNaN(parsedValue) ? 0 : parsedValue
}

const formatAccuracyText = (value) => `${parseAccuracyValue(value)}%`

const formatFinishedAt = (value = '') => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 19)
  }

  const pad = (item) => String(item).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const buildKnowledgeTree = (questions = [], answerSheet = []) => {
  if (!Array.isArray(questions) || !questions.length) {
    return []
  }

  const rootNodes = []

  questions.forEach((question, index) => {
    const segments = getQuestionKnowledgeSegments(question)

    if (!segments.length) {
      return
    }

    const answerItem = answerSheet[index] || {}
    const isCorrect = answerItem.status === 'correct'
    let currentNodes = rootNodes
    let currentPath = []

    segments.forEach((segment) => {
      currentPath = [...currentPath, segment]

      let currentNode = currentNodes.find((item) => item.name === segment)

      if (!currentNode) {
        currentNode = {
          id: currentPath.join(' > '),
          name: segment,
          examPoint: segment,
          total: 0,
          correct: 0,
          children: [],
        }
        currentNodes.push(currentNode)
      }

      currentNode.total += 1
      if (isCorrect) {
        currentNode.correct += 1
      }

      currentNodes = currentNode.children
    })
  })

  const finalizeNodes = (nodes = []) =>
    nodes
      .map((node) => {
        const total = Number(node.total || 0)
        const correct = Number(node.correct || 0)
        const accuracy = total ? Math.round((correct / total) * 100) : 0
        const children = finalizeNodes(node.children || [])

        return {
          id: node.id,
          name: node.name,
          examPoint: node.examPoint,
          total,
          correct,
          wrong: Math.max(total - correct, 0),
          accuracy,
          answerDesc: `共${total}题，答对${correct}题，正确率${accuracy}%`,
          children,
        }
      })
      .filter((node) => node.total > 0)

  return finalizeNodes(rootNodes)
}

const buildSectionStats = (questions = [], answerSheet = [], sectionMetas = []) => {
  if (!Array.isArray(questions) || !questions.length) {
    return []
  }

  const sections =
    Array.isArray(sectionMetas) && sectionMetas.length
      ? sectionMetas.map((item) => ({ name: item.name || '综合' }))
      : Array.from(new Set(questions.map((question) => getQuestionSectionName(question)))).map(
          (name) => ({ name }),
        )

  return sections
    .map((section) => {
      let total = 0
      let correct = 0

      questions.forEach((question, index) => {
        if (getQuestionSectionName(question) !== section.name) {
          return
        }

        total += 1
        if ((answerSheet[index] || {}).status === 'correct') {
          correct += 1
        }
      })

      return {
        name: section.name,
        total,
        correct,
        wrong: Math.max(total - correct, 0),
        accuracy: total ? Math.round((correct / total) * 100) : 0,
      }
    })
    .filter((item) => item.total > 0)
}

const getReportPageTitle = (reportType = 'practice') =>
  reportType === EXAM_PRACTICE_TYPE ? '考试报告' : '练习报告'

const getModeLabel = (reportType = 'practice', examMode = '') => {
  if (reportType !== EXAM_PRACTICE_TYPE) {
    return '专项练习'
  }

  if (examMode === 'special') {
    return '专项模式'
  }

  if (examMode === 'hybrid') {
    return '混合模式'
  }

  return '考场模式'
}

const getHeadlineText = (reportType = 'practice', accuracyValue = 0, rank = '') => {
  if (rank) {
    return rank
  }

  if (reportType === EXAM_PRACTICE_TYPE) {
    if (accuracyValue >= 85) {
      return '这次发挥很稳，已经接近高分节奏。'
    }

    if (accuracyValue >= 70) {
      return '状态不错，再把错题吃透会更稳。'
    }

    return '先把错题过一遍，下一次会更好。'
  }

  if (accuracyValue >= 85) {
    return '这组专项掌握得很扎实，可以继续提速。'
  }

  if (accuracyValue >= 60) {
    return '知识点已经有感觉了，再刷一轮会更顺。'
  }

  return '先把薄弱点再过一遍，稳住正确率最重要。'
}

Page({
  data: {
    navBarHeight: 88,
    hasReport: false,
    reportType: 'practice',
    pageTitle: '练习报告',
    reportData: {
      paperName: '',
      modeLabel: '',
      score: 0,
      totalScore: 100,
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      unanswered: 0,
      accuracy: '0%',
      accuracyValue: 0,
      totalTime: '0分0秒',
      finishedAtText: '--',
      sectionStats: [],
      knowledgeTree: [],
      headline: '',
    },
  },

  onLoad(options) {
    this.routeOptions = options || {}

    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0

    this.setData({
      navBarHeight: statusBarHeight + 44,
    })

    this.loadReport(this.routeOptions)
  },

  onShow() {
    this.loadReport(this.routeOptions || {})
  },

  getAnalysisTitle(filter = 'all', scopeName = '') {
    if (scopeName) {
      return `${scopeName}题目`
    }

    return filter === 'wrong' ? '错题解析' : '全部解析'
  },

  buildAnalysisRouteParams(filter = 'all', options = {}) {
    const { section = '', knowledgePath = '', scopeName = '' } = options
    const practiceType =
      this.data.reportType === EXAM_PRACTICE_TYPE ? EXAM_PRACTICE_TYPE : 'practice'
    const resolvedScopeName = scopeName || section || getKnowledgeLeafName(knowledgePath)

    return {
      practiceType,
      resultSource: this.data.reportType,
      historyId: this.routeOptions.historyId || '',
      filter,
      section,
      knowledgePath,
      analysisTitle: this.getAnalysisTitle(filter, resolvedScopeName),
    }
  },

  buildReportData(reportType = 'practice', result = null, cache = {}) {
    const rawQuestions =
      result && Array.isArray(result.questions) && result.questions.length
        ? result.questions
        : Array.isArray(cache.questions)
          ? cache.questions
          : []
    const rawAnswerSheet =
      result && Array.isArray(result.answerSheet) && result.answerSheet.length
        ? result.answerSheet
        : Array.isArray(cache.answerSheet)
          ? cache.answerSheet
          : []
    const fallbackCorrectCount = rawAnswerSheet.filter((item) => item.status === 'correct').length
    const fallbackWrongCount = rawAnswerSheet.filter((item) => item.status === 'wrong').length
    const fallbackUnansweredCount = rawAnswerSheet.filter(
      (item) => !item || (!item.selectedAnswers || !item.selectedAnswers.length) && !item.userAnswer,
    ).length
    const totalQuestions =
      Number(result && result.totalQuestions) ||
      Number(cache.totalQuestions) ||
      rawQuestions.length ||
      0
    const correctCount = Number(result && result.correctCount) || fallbackCorrectCount
    const wrongCount = Number(result && result.wrongCount) || fallbackWrongCount
    const unanswered =
      result && result.unanswered !== undefined
        ? Number(result.unanswered || 0)
        : result && result.unansweredCount !== undefined
          ? Number(result.unansweredCount || 0)
          : fallbackUnansweredCount || Math.max(totalQuestions - correctCount - wrongCount, 0)
    const accuracyValue = parseAccuracyValue(
      result && result.accuracy !== undefined
        ? result.accuracy
        : totalQuestions
          ? ((correctCount / totalQuestions) * 100).toFixed(1)
          : 0,
    )
    const sectionStats =
      result && Array.isArray(result.sectionStats) && result.sectionStats.length
        ? result.sectionStats
        : buildSectionStats(rawQuestions, rawAnswerSheet, cache.practiceSections)
    const knowledgeTree = buildKnowledgeTree(rawQuestions, rawAnswerSheet)
    const paperName =
      (result && (result.paperName || result.paperTitle)) ||
      cache.paperTitle ||
      (reportType === EXAM_PRACTICE_TYPE ? '考场模式' : '专项练习')

    if (!paperName && !totalQuestions) {
      return null
    }

    return {
      paperName,
      modeLabel: getModeLabel(
        reportType,
        (result && result.examMode) || cache.practiceExamMode || '',
      ),
      score: Number(result && result.score) || Math.round(accuracyValue),
      totalScore: Number(result && result.totalScore) || 100,
      totalQuestions,
      correctCount,
      wrongCount,
      unanswered,
      accuracy: formatAccuracyText(
        result && result.accuracy !== undefined ? result.accuracy : accuracyValue,
      ),
      accuracyValue,
      totalTime:
        (result && (result.totalTime || result.timerText)) ||
        cache.timerText ||
        '0分0秒',
      finishedAtText: formatFinishedAt(
        (result && result.finishedAt) || cache.finishedAt || '',
      ),
      sectionStats,
      knowledgeTree,
      headline: getHeadlineText(
        reportType,
        accuracyValue,
        (result && result.rank) || '',
      ),
    }
  },

  loadReport(options = {}) {
    const cache = storage.getPracticeCache() || {}
    const routeReportType = options.reportType || ''
    const historyId = options.historyId || ''

    let reportType = routeReportType
    let result = null

    // 如果提供了 historyId，优先从历史记录中加载
    if (historyId) {
      result = storage.getExamResultById(historyId)
      if (result) {
        reportType = EXAM_PRACTICE_TYPE
      } else {
        result = storage.getPracticeResultById(historyId)
        if (result) {
          reportType = 'practice'
        }
      }
    }

    // 如果没有 historyId 或未找到历史记录，回退到当前缓存/结果
    if (!result) {
      reportType =
        routeReportType ||
        (cache.practiceType === EXAM_PRACTICE_TYPE || cache.practiceExamMode
          ? EXAM_PRACTICE_TYPE
          : 'practice')
      result =
        reportType === EXAM_PRACTICE_TYPE
          ? storage.getExamResult() || cache.examReport || null
          : storage.getPracticeResult() || null
    }

    const reportData = this.buildReportData(reportType, result, cache)

    if (!reportData) {
      this.setData({
        hasReport: false,
        reportType,
        pageTitle: getReportPageTitle(reportType),
      })
      return
    }

    this.setData({
      hasReport: true,
      reportType,
      pageTitle: getReportPageTitle(reportType),
      reportData,
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

  handleViewAnalysis() {
    router.push('ANALYSIS', this.buildAnalysisRouteParams('all'))
  },

  handleViewWrongAnalysis() {
    if (Number(this.data.reportData.wrongCount || 0) <= 0) {
      tool.toast('本次没有错题')
      return
    }

    router.push('ANALYSIS', this.buildAnalysisRouteParams('wrong'))
  },

  handleViewSectionAnalysis(e) {
    const section = e.currentTarget.dataset.section || ''

    if (!section) {
      return
    }

    router.push(
      'ANALYSIS',
      this.buildAnalysisRouteParams('all', {
        section,
        scopeName: section,
      }),
    )
  },

  handleViewKnowledgeAnalysis(e) {
    const detail = e.detail || {}
    const knowledgePath = detail.id || ''
    const scopeName = detail.name || getKnowledgeLeafName(knowledgePath)

    if (!knowledgePath) {
      return
    }

    router.push(
      'ANALYSIS',
      this.buildAnalysisRouteParams('all', {
        knowledgePath,
        scopeName,
      }),
    )
  },

  handleRetry() {
    const cache = storage.getPracticeCache() || {}

    if (cache.practiceType === EXAM_PRACTICE_TYPE || cache.practiceExamMode) {
      router.reLaunch('PRACTICE', {
        practiceType: EXAM_PRACTICE_TYPE,
        examMode: cache.practiceExamMode || 'full',
        subject: cache.practiceSubject || 'xingce',
        categoryIds: Array.isArray(cache.practiceCategoryIds)
          ? cache.practiceCategoryIds.join(',')
          : cache.practiceCategoryIds || '',
        paperId: cache.practicePaperId || '',
        duration: cache.practiceDuration || '',
        count: cache.practiceCount || '',
        categoryPlan: cache.practiceCategoryPlan || '',
      })
      return
    }

    if (cache.practiceType === 'practice') {
      router.reLaunch('PRACTICE', {
        practiceType: 'practice',
        subject: cache.practiceSubject || 'xingce',
        focus: cache.practiceFocus || '',
        count: cache.practiceCount || cache.totalQuestions || 20,
        year: cache.practiceYear || 'all',
      })
      return
    }

    router.switchTab('INDEX')
  },

  handleGoHome() {
    router.switchTab('INDEX')
  },
})
