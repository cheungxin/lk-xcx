import router from '../../../router/index'
import storage from '../../../utils/storage'
import { getDailyQuestions } from '../../../mock/daily'
import { getPaperDetail } from '../../../mock/papers'
import { getPracticeCategories, getQuestionsByFocus } from '../../../mock/questions'
import { normalizeQuestionRecord } from '../../../utils/question-schema'

const tool = require('../../../toolbox/tool')

const APP_SETTINGS_KEY = 'appSettings'
const EXAM_PRACTICE_TYPE = 'exam'
const DEFAULT_EXAM_DURATION = 120
const DEFAULT_CUSTOM_EXAM_DURATION = 20
const MATERIAL_POPUP_HEIGHT_RATIO = 0.82
const MATERIAL_POPUP_MIN_HEIGHT = 420

const DISPLAY_MODE = {
  answer: 'answer',
  analysis: 'analysis',
}

const QUESTION_TYPE_META = {
  single: {
    id: 'single',
    label: '单选题',
    allowMultiple: false,
  },
  multi: {
    id: 'multi',
    label: '多选题',
    allowMultiple: true,
  },
  judge: {
    id: 'judge',
    label: '判断题',
    allowMultiple: false,
  },
}

const YEAR_THRESHOLD_MAP = {
  '3y': 2024,
  '5y': 2022,
  '10y': 2017,
}

const PRACTICE_PAGE_TITLE_MAP = {
  practice: '答题练习',
  daily: '每日一练',
  exam: '考场模式',
}

const READONLY_ANALYSIS_TITLE_MAP = {
  all: '全部解析',
  wrong: '错题解析',
  correct: '正确题目',
  unanswered: '未答题目',
}

const buildDraftKeyPart = (value, fallback = 'default') =>
  encodeURIComponent(String(value || fallback))

const decodeRouteParam = (value = '') => {
  if (typeof value !== 'string' || !value) {
    return ''
  }

  let decoded = value
  for (let index = 0; index < 2; index += 1) {
    if (!/%[0-9A-Fa-f]{2}/.test(decoded)) {
      break
    }

    try {
      const nextValue = decodeURIComponent(decoded)
      if (nextValue === decoded) {
        break
      }
      decoded = nextValue
    } catch (error) {
      break
    }
  }

  return decoded
}

const getPracticeFocusName = (subject = 'xingce', focusId = '') => {
  if (!focusId) {
    return ''
  }

  const pendingNodes = [...getPracticeCategories(subject)]
  while (pendingNodes.length) {
    const node = pendingNodes.shift()
    if (!node) {
      continue
    }

    if (node.id === focusId) {
      return node.examPoint || node.name || ''
    }

    if (Array.isArray(node.children) && node.children.length) {
      pendingNodes.push(...node.children)
    }
  }

  return ''
}

const resolveDurationValue = (value, fallback = DEFAULT_EXAM_DURATION) => {
  const parsedValue = Number.parseInt(value, 10)

  if (Number.isNaN(parsedValue)) {
    return fallback
  }

  return Math.max(parsedValue, 0)
}

const normalizeCategoryIds = (value = []) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const serializeCategoryPlan = (plans = []) =>
  (Array.isArray(plans) ? plans : [])
    .filter((item) => item && item.id && Number(item.count || 0) > 0)
    .map((item) => `${item.id}:${Number(item.count || 0)}`)
    .join(',')

const parseCategoryPlan = (value = '') =>
  String(value || '')
    .split(',')
    .map((item) => {
      const [id, count] = item.split(':')
      return {
        id,
        count: Number.parseInt(count, 10) || 0,
      }
    })
    .filter((item) => item.id && item.count > 0)

const createRepeatedQuestions = (questions = [], count = 0, sectionName = '综合') => {
  if (!Array.isArray(questions) || !questions.length || count <= 0) {
    return []
  }

  const result = []

  for (let index = 0; index < count; index += 1) {
    const question = questions[index % questions.length]
    const baseId = question.id || question.questionId || `${sectionName}-${index + 1}`
    const suffix = index >= questions.length ? `-${index + 1}` : ''

    result.push({
      ...question,
      id: `${baseId}${suffix}`,
      questionId: `${question.questionId || baseId}${suffix}`,
      section: sectionName,
    })
  }

  return result
}

const createCustomPaper = (mode, subject, categoryIds, count, duration, categoryPlan = []) => {
  const timestamp = Date.now()
  const focusIds =
    Array.isArray(categoryIds) && categoryIds.length ? categoryIds : ['politics', 'common']
  const plans =
    Array.isArray(categoryPlan) && categoryPlan.length
      ? categoryPlan
      : (() => {
          const totalCount = Math.max(count || 20, focusIds.length)
          const averageCount = Math.floor(totalCount / focusIds.length)
          const remainder = totalCount % focusIds.length

          return focusIds.map((focusId, index) => ({
            id: focusId,
            count: averageCount + (index < remainder ? 1 : 0),
          }))
        })()

  const sections = plans
    .map((plan) => {
      const focusId = plan.id
      const sectionCount = Number(plan.count || 0)
      const sectionQuestions = createRepeatedQuestions(
        getQuestionsByFocus(subject, focusId, sectionCount),
        sectionCount,
      )

      if (!sectionQuestions.length) {
        return null
      }

      return {
        name:
          sectionQuestions[0].subCategory ||
          sectionQuestions[0].category ||
          sectionQuestions[0].section ||
          '综合',
        questions: sectionQuestions,
      }
    })
    .filter(Boolean)

  return {
    id: `custom-${mode}-${timestamp}`,
    paperId: `custom-${mode}-${timestamp}`,
    name: mode === 'special' ? '专项考试' : '混合考试',
    totalDuration: resolveDurationValue(duration, DEFAULT_CUSTOM_EXAM_DURATION),
    sections,
  }
}

const buildPracticeDraftSceneKey = ({
  practiceType,
  subject,
  focus,
  year,
  date,
  paperTitle,
  paperId,
  examMode,
  duration,
  categoryIds,
  categoryPlan,
  count,
}) =>
  [
    'draft',
    'practice',
    buildDraftKeyPart(practiceType, 'practice'),
    buildDraftKeyPart(subject, 'xingce'),
    buildDraftKeyPart(focus, 'general'),
    buildDraftKeyPart(year, 'all'),
    buildDraftKeyPart(date, 'common'),
    buildDraftKeyPart(paperTitle, '专项练习'),
    buildDraftKeyPart(paperId, 'paper'),
    buildDraftKeyPart(examMode, 'normal'),
    buildDraftKeyPart(duration, '0'),
    buildDraftKeyPart(categoryIds, 'general'),
    buildDraftKeyPart(categoryPlan, 'auto'),
    buildDraftKeyPart(count, '0'),
  ].join(':')

const FONT_SIZE_LABEL_MAP = {
  small: '小',
  standard: '标准',
  large: '大',
}

const THEME_TOKENS_MAP = {
  light: {
    modeLabel: '日间',
    modeIcon: 'sunny-filled',
    iconPrimary: '#1664FF',
    iconSecondary: '#86909C',
    iconTertiary: '#4E5969',
    iconQuaternary: '#C9CDD4',
    markActive: '#FF6B00',
    collectActive: '#FFB020',
    navbarStyle:
      '--td-navbar-background: #FFFFFF; --td-navbar-color: #1D2129; --td-navbar-capsule-border-color: #E5E6EB;',
  },
  dark: {
    modeLabel: '夜间',
    modeIcon: 'mode-dark-filled',
    iconPrimary: '#7AB8FF',
    iconSecondary: '#93A1B5',
    iconTertiary: '#C7D2E3',
    iconQuaternary: '#6D7C92',
    markActive: '#FFB357',
    collectActive: '#FFD76A',
    navbarStyle:
      '--td-navbar-background: #111827; --td-navbar-color: #F3F7FF; --td-navbar-capsule-border-color: rgba(148, 163, 184, 0.28);',
  },
}

const padNumber = (value) => String(value).padStart(2, '0')

const formatDurationText = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainSeconds = seconds % 60

  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(remainSeconds)}`
}

const formatSpentTime = (seconds) => `${Math.floor(seconds / 60)}分${seconds % 60}秒`

const formatMinutesText = (seconds) => `${Math.floor(seconds / 60)}分钟`

const getQuestionSectionName = (question = {}) =>
  question.section || question.subCategory || question.category || '综合'

const normalizePathText = (value = '') =>
  String(value === undefined || value === null ? '' : value).trim()

const splitKnowledgePath = (value = '') =>
  normalizePathText(value)
    .split('>')
    .map((item) => item.trim())
    .filter(Boolean)

const compactKnowledgeSegments = (segments = []) =>
  segments.reduce((result, item) => {
    const normalized = normalizePathText(item)

    if (!normalized || result[result.length - 1] === normalized) {
      return result
    }

    result.push(normalized)
    return result
  }, [])

const getQuestionKnowledgeSegments = (question = {}) => {
  const knowledgeSegments = splitKnowledgePath(question.knowledgePoint)

  if (knowledgeSegments.length) {
    return compactKnowledgeSegments(knowledgeSegments)
  }

  return compactKnowledgeSegments([
    question.category,
    question.subCategory,
    getQuestionSectionName(question),
  ])
}

const getQuestionKnowledgePath = (question = {}) => getQuestionKnowledgeSegments(question).join(' > ')

const getKnowledgeLeafName = (value = '') => {
  const segments = splitKnowledgePath(value)
  return segments[segments.length - 1] || ''
}

const matchesQuestionKnowledgePath = (question = {}, knowledgePath = '') => {
  const normalizedPath = normalizePathText(knowledgePath)

  if (!normalizedPath) {
    return true
  }

  const questionKnowledgePath = getQuestionKnowledgePath(question)

  return (
    questionKnowledgePath === normalizedPath ||
    questionKnowledgePath.startsWith(`${normalizedPath} > `)
  )
}

const buildSectionStats = (finalAnswerSheet = [], finalQuestions = [], sectionMetas = []) => {
  const sections =
    Array.isArray(sectionMetas) && sectionMetas.length
      ? sectionMetas.map((item) => ({
          name: item.name || '综合',
        }))
      : Array.from(
          new Set(finalQuestions.map((question) => getQuestionSectionName(question))),
        ).map((name) => ({ name }))

  return sections
    .map((section) => {
      let total = 0
      let correct = 0

      finalQuestions.forEach((question, index) => {
        if (getQuestionSectionName(question) !== section.name) {
          return
        }

        total += 1
        if ((finalAnswerSheet[index] || {}).status === 'correct') {
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

const resolveReadonlyAnalysisTitle = (
  filter = 'all',
  section = '',
  knowledgePath = '',
  fallback = '',
) => {
  if (fallback) {
    return fallback
  }

  const scopeName = getKnowledgeLeafName(knowledgePath) || section

  if (scopeName) {
    return `${scopeName}题目`
  }

  return READONLY_ANALYSIS_TITLE_MAP[filter] || READONLY_ANALYSIS_TITLE_MAP.all
}

const normalizeAnswerIds = (value) => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => String(item || '').trim()).filter(Boolean)),
    )
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return []
    }

    if (/[、,，/|\s]/.test(trimmed)) {
      return Array.from(
        new Set(trimmed.split(/[、,，/|\s]+/).map((item) => item.trim()).filter(Boolean)),
      )
    }

    return [trimmed]
  }

  if (value === undefined || value === null || value === '') {
    return []
  }

  return [String(value)]
}

const formatAnswerText = (value, fallback = '') => {
  const normalized = normalizeAnswerIds(value)
  return normalized.length ? normalized.join('、') : fallback
}

const resolveQuestionType = (question = {}) => {
  const rawType = question.typeId || question.rawType || question.type
  const correctAnswerList = normalizeAnswerIds(
    question.correctAnswer !== undefined ? question.correctAnswer : question.answer,
  )

  if (rawType === QUESTION_TYPE_META.multi.id || correctAnswerList.length > 1) {
    return QUESTION_TYPE_META.multi
  }

  if (rawType === QUESTION_TYPE_META.judge.id) {
    return QUESTION_TYPE_META.judge
  }

  return QUESTION_TYPE_META.single
}

const getStoredAnswerValue = (answerIds = [], question = {}) => {
  const normalized = normalizeAnswerIds(answerIds)
  return resolveQuestionType(question).allowMultiple ? normalized : normalized[0] || ''
}

const isSameAnswer = (left = [], right = []) => {
  const normalizedLeft = normalizeAnswerIds(left).sort()
  const normalizedRight = normalizeAnswerIds(right).sort()

  if (normalizedLeft.length !== normalizedRight.length) {
    return false
  }

  return normalizedLeft.every((item, index) => item === normalizedRight[index])
}

const hasSelectedAnswer = (answerItem = {}) =>
  normalizeAnswerIds(answerItem.selectedAnswers).length > 0 ||
  normalizeAnswerIds(answerItem.userAnswer).length > 0

const countAnsweredQuestions = (answerSheet = []) =>
  answerSheet.filter((item) => hasSelectedAnswer(item)).length

const countConfirmedQuestions = (answerSheet = []) =>
  answerSheet.filter((item) => !!item.confirmed).length

const getAnswerResultStatus = (question = {}, answerIds = []) => {
  const normalized = normalizeAnswerIds(answerIds)
  if (!normalized.length) {
    return 'pending'
  }

  return isSameAnswer(normalized, question.correctAnswerList || question.correctAnswer)
    ? 'correct'
    : 'wrong'
}

const normalizeQuestion = (question = {}, index = 0) => {
  const normalizedQuestion = normalizeQuestionRecord(question, index)
  const id =
    normalizedQuestion.id ||
    normalizedQuestion.questionId ||
    `practice-${Date.now()}-${index + 1}`
  const correctAnswerList = normalizeAnswerIds(
    normalizedQuestion.correctAnswer !== undefined
      ? normalizedQuestion.correctAnswer
      : normalizedQuestion.answer,
  )
  const questionType = resolveQuestionType({
    ...normalizedQuestion,
    correctAnswer: correctAnswerList,
  })

  return {
    ...normalizedQuestion,
    id,
    questionId: normalizedQuestion.questionId || id,
    typeId: questionType.id,
    type: questionType.label,
    rawType: normalizedQuestion.rawType || normalizedQuestion.type || questionType.id,
    allowMultiple: questionType.allowMultiple,
    stem: normalizedQuestion.stem || normalizedQuestion.content || '',
    content: normalizedQuestion.content || normalizedQuestion.stem || '',
    correctAnswer: getStoredAnswerValue(correctAnswerList, { typeId: questionType.id }),
    correctAnswerList,
    correctAnswerText: formatAnswerText(correctAnswerList),
    answer: getStoredAnswerValue(correctAnswerList, { typeId: questionType.id }),
    explanation: normalizedQuestion.explanation || normalizedQuestion.analysis || '',
    analysis: normalizedQuestion.analysis || normalizedQuestion.explanation || '',
    knowledgePoint: normalizedQuestion.knowledgePoint || '',
    material: normalizedQuestion.material || '',
    materialTitle: normalizedQuestion.materialTitle || '给定材料',
    materialPreview: normalizedQuestion.materialPreview || normalizedQuestion.material || '',
    materialImage: normalizedQuestion.materialImage || '',
    questionImage: normalizedQuestion.questionImage || '',
    collected:
      normalizedQuestion.collected !== undefined
        ? !!normalizedQuestion.collected
        : storage.isQuestionFavorited(id),
    options: Array.isArray(normalizedQuestion.options) ? normalizedQuestion.options : [],
  }
}

const buildEmptyAnswerSheet = (questions = []) =>
  questions.map((question, index) => ({
    id: question.id,
    index: index + 1,
    status: 'pending',
    selectedAnswers: [],
    selectedAnswerText: '',
    userAnswer: getStoredAnswerValue([], question),
    userAnswerText: '',
    confirmed: false,
    marked: false,
  }))

const normalizeAnswerSheet = (answerSheet = [], questions = []) =>
  questions.map((question, index) => {
    const item = answerSheet[index] || {}
    const selectedAnswers = normalizeAnswerIds(
      item.selectedAnswers !== undefined ? item.selectedAnswers : item.userAnswer,
    )
    const userAnswerList = normalizeAnswerIds(
      item.confirmed
        ? item.userAnswer !== undefined
          ? item.userAnswer
          : item.selectedAnswers
        : item.userAnswer,
    )
    const confirmed = item.confirmed !== undefined ? !!item.confirmed : userAnswerList.length > 0
    const finalUserAnswerList = confirmed
      ? userAnswerList.length
        ? userAnswerList
        : selectedAnswers
      : []
    const status = confirmed
      ? getAnswerResultStatus(question, finalUserAnswerList)
      : selectedAnswers.length
        ? 'answered'
        : 'pending'

    return {
      id: item.id || question.id,
      index: index + 1,
      status,
      selectedAnswers,
      selectedAnswerText: formatAnswerText(selectedAnswers),
      userAnswer: getStoredAnswerValue(finalUserAnswerList, question),
      userAnswerText: formatAnswerText(finalUserAnswerList),
      confirmed,
      marked: !!item.marked,
    }
  })

const decorateQuestion = (question = {}, answerItem = {}, displayMode = DISPLAY_MODE.answer) => {
  const selectedAnswers = normalizeAnswerIds(answerItem.selectedAnswers)
  const showAnalysis = displayMode === DISPLAY_MODE.analysis && !!answerItem.confirmed
  const correctAnswerList = question.correctAnswerList || normalizeAnswerIds(question.correctAnswer)

  return {
    ...question,
    selectedAnswerText: formatAnswerText(selectedAnswers),
    userAnswerText: formatAnswerText(answerItem.userAnswer),
    analysisVisible: showAnalysis,
    options: (question.options || []).map((option) => {
      const isSelected = selectedAnswers.includes(option.id)
      const isCorrectOption = showAnalysis && correctAnswerList.includes(option.id)
      const isWrongSelection = showAnalysis && isSelected && !correctAnswerList.includes(option.id)

      return {
        ...option,
        isSelected,
        isCorrectOption,
        isWrongSelection,
      }
    }),
  }
}

const decorateQuestions = (questions = [], answerSheet = [], displayMode = DISPLAY_MODE.answer) =>
  questions.map((question, index) =>
    decorateQuestion(question, answerSheet[index] || {}, displayMode),
  )

const getAnswerState = (answerSheet = [], currentIndex = 1) => {
  const currentAnswer = answerSheet[currentIndex - 1] || {}
  return {
    selectedAnswers: normalizeAnswerIds(currentAnswer.selectedAnswers),
    selectedAnswer: formatAnswerText(currentAnswer.selectedAnswers),
    submitted: !!currentAnswer.confirmed,
    isCorrect:
      currentAnswer.status === 'correct'
        ? true
        : currentAnswer.status === 'wrong'
          ? false
          : null,
  }
}

const rebuildPracticeState = ({
  practiceState = {},
  answerSheet = [],
  currentIndex = 1,
  displayMode = DISPLAY_MODE.answer,
}) => {
  const questions = Array.isArray(practiceState.questions)
    ? practiceState.questions.map((question, index) => normalizeQuestion(question, index))
    : []
  const normalizedAnswerSheet = normalizeAnswerSheet(answerSheet, questions)
  const safeCurrentIndex = questions.length
    ? Math.min(Math.max(Number(currentIndex) || 1, 1), questions.length)
    : 0
  const answerState = getAnswerState(normalizedAnswerSheet, safeCurrentIndex || 1)

  return {
    ...practiceState,
    totalQuestions: questions.length,
    currentIndex: safeCurrentIndex,
    ...answerState,
    questions: decorateQuestions(questions, normalizedAnswerSheet, displayMode),
    answerSheet: normalizedAnswerSheet,
    answeredCount: countAnsweredQuestions(normalizedAnswerSheet),
    confirmedCount: countConfirmedQuestions(normalizedAnswerSheet),
  }
}

const buildPracticeState = (
  questions = [],
  paperTitle = '专项练习',
  displayMode = DISPLAY_MODE.answer,
) => {
  const normalizedQuestions = questions.map((question, index) => normalizeQuestion(question, index))
  return rebuildPracticeState({
    practiceState: {
      paperTitle,
      totalQuestions: normalizedQuestions.length,
      currentIndex: normalizedQuestions.length ? 1 : 0,
      questions: normalizedQuestions,
      answerSheet: buildEmptyAnswerSheet(normalizedQuestions),
    },
    answerSheet: buildEmptyAnswerSheet(normalizedQuestions),
    currentIndex: normalizedQuestions.length ? 1 : 0,
    displayMode,
  })
}

const finalizeAnswerSheet = (answerSheet = [], questions = []) =>
  normalizeAnswerSheet(
    answerSheet.map((item, index) => {
      const question = questions[index] || {}
      const selectedAnswers = normalizeAnswerIds(item.selectedAnswers)
      if (!selectedAnswers.length) {
        return {
          ...item,
          confirmed: false,
          status: 'pending',
          userAnswer: getStoredAnswerValue([], question),
          userAnswerText: '',
        }
      }

      return {
        ...item,
        confirmed: true,
        status: getAnswerResultStatus(question, selectedAnswers),
        selectedAnswers,
        selectedAnswerText: formatAnswerText(selectedAnswers),
        userAnswer: getStoredAnswerValue(selectedAnswers, question),
        userAnswerText: formatAnswerText(selectedAnswers),
      }
    }),
    questions,
  )

const getPracticeModeTip = (displayMode = DISPLAY_MODE.answer) =>
  displayMode === DISPLAY_MODE.analysis
    ? '解析模式下每题都需要先确认答案，确认后立即显示解析，且不能再修改。'
    : '答题模式下只记录你的选择，不显示正确答案和解析，可继续调整作答。'

Page({
  data: {
    practiceType: 'practice',
    pageTitle: PRACTICE_PAGE_TITLE_MAP.practice,
    isReadonly: false,
    resultSource: '',
    analysisFilterType: 'all',
    analysisSectionName: '',
    analysisKnowledgePath: '',
    analysisScopeName: '',
    practiceDate: '',
    practiceSubject: 'xingce',
    practiceFocus: '',
    practiceYear: 'all',
    practiceExamMode: '',
    practicePaperId: '',
    practiceDuration: 0,
    practiceCount: 0,
    practiceCategoryIds: [],
    practiceCategoryPlan: '',
    practiceSections: [],
    practiceDisplayMode: DISPLAY_MODE.answer,
    practiceModeTip: getPracticeModeTip(DISPLAY_MODE.answer),
    draftSceneKey: '',
    themeMode: 'light',
    themeTokens: THEME_TOKENS_MAP.light,
    fontSize: 'standard',
    fontSizeLabel: '标准',
    fontSizeScale: 1.0,
    showFontSizeSelector: false,
    showDraftSheet: false,
    practiceState: buildPracticeState(),
    showAnswerCard: false,
    showMorePopup: false,
    showMaterial: false,
    currentMaterial: {},
    materialPopupHeight: MATERIAL_POPUP_MIN_HEIGHT,
    materialScrollTop: 0,
    navBarHeight: 88,
    timerText: '00:00:00',
    remainTime: 0,
    startTime: 0,
    timerInterval: null,
  },

  onLoad(options) {
    if (this.isReadonlyAnalysisScene(options)) {
      this.initReadonlyPractice(options)
      return
    }

    const {
      practiceType,
      subject,
      focus,
      focusName,
      count,
      year,
      date,
      examMode,
      categoryIds,
      paperId,
      duration,
      categoryPlan,
    } = options || {}

    const finalPracticeType = practiceType || 'practice'
    const parsedQuestionCount = Number.parseInt(count, 10)
    const questionCount = Number.isNaN(parsedQuestionCount) ? 20 : parsedQuestionCount
    let practiceDate = date || ''
    let practiceYear = year || 'all'
    let practiceSubject = subject || 'xingce'
    const resolvedFocusName =
      decodeRouteParam(focusName) || getPracticeFocusName(practiceSubject, focus)

    let questions = []
    let paperTitle = '专项练习'
    let practiceExamMode = ''
    let practicePaperId = ''
    let practiceDuration = 0
    let practiceCategoryIds = []
    let practiceCategoryPlan = ''
    let practiceSections = []

    if (finalPracticeType === EXAM_PRACTICE_TYPE) {
      const examSession = this.loadExamQuestions({
        examMode,
        subject: practiceSubject,
        categoryIds,
        paperId,
        duration,
        count: questionCount,
        categoryPlan,
      })

      questions = examSession.questions
      paperTitle = examSession.paperTitle
      practiceSubject = examSession.subject
      practiceExamMode = examSession.examMode
      practicePaperId = examSession.paperId
      practiceDuration = examSession.duration
      practiceCategoryIds = examSession.categoryIds
      practiceCategoryPlan = examSession.categoryPlan
      practiceSections = examSession.sections
      practiceYear = 'all'
      practiceDate = ''
    } else if (finalPracticeType === 'daily' && practiceDate) {
      questions = this.loadDailyQuestions(practiceDate)
      paperTitle = `每日一练 ${practiceDate}`
    } else {
      questions = this.loadPracticeQuestions(practiceSubject, focus, questionCount, practiceYear)
      paperTitle = resolvedFocusName || '专项练习'
    }

    const initialDisplayMode =
      finalPracticeType === EXAM_PRACTICE_TYPE
        ? DISPLAY_MODE.answer
        : this.data.practiceDisplayMode

    const practiceState = buildPracticeState(
      questions,
      paperTitle,
      initialDisplayMode,
    )
    const draftSceneKey = buildPracticeDraftSceneKey({
      practiceType: finalPracticeType,
      subject: practiceSubject,
      focus,
      year: practiceYear,
      date: practiceDate,
      paperTitle,
      paperId: practicePaperId,
      examMode: practiceExamMode,
      duration: practiceDuration,
      categoryIds: practiceCategoryIds.join(','),
      categoryPlan: practiceCategoryPlan,
      count: questionCount,
    })

    if (!practiceState.totalQuestions) {
      tool.toast('暂无可用题目')
      setTimeout(() => {
        router.back()
      }, 300)
      return
    }

    const app = getApp()
    const { statusBarHeight, clientHeight: windowHeight } = app.globalData
    const navBarHeight = (statusBarHeight || 0) + 44
    const materialPopupHeight = Math.max(
      Math.round((windowHeight || 667) * MATERIAL_POPUP_HEIGHT_RATIO),
      MATERIAL_POPUP_MIN_HEIGHT,
    )
    const appSettings = this.getAppSettings()
    const themeMode = this.getThemeMode(appSettings)

    this.setData({
      practiceType: finalPracticeType,
      pageTitle: PRACTICE_PAGE_TITLE_MAP[finalPracticeType] || PRACTICE_PAGE_TITLE_MAP.practice,
      practiceDate,
      practiceSubject,
      practiceFocus: focus || '',
      practiceYear,
      practiceExamMode,
      practicePaperId,
      practiceDuration,
      practiceCount: questionCount,
      practiceCategoryIds,
      practiceCategoryPlan,
      practiceSections,
      practiceDisplayMode: initialDisplayMode,
      practiceModeTip: getPracticeModeTip(initialDisplayMode),
      draftSceneKey,
      themeMode,
      themeTokens: THEME_TOKENS_MAP[themeMode],
      fontSizeLabel: this.getFontSizeLabel(appSettings),
      practiceState,
      materialPopupHeight,
      navBarHeight,
      startTime: Date.now(),
      timerText:
        finalPracticeType === EXAM_PRACTICE_TYPE && practiceDuration > 0
          ? formatDurationText(practiceDuration * 60)
          : finalPracticeType === EXAM_PRACTICE_TYPE
            ? '不限时'
            : '00:00:00',
      remainTime: finalPracticeType === EXAM_PRACTICE_TYPE ? practiceDuration * 60 : 0,
    })

    this.isSubmittingPractice = false
    this.startTimer()
    this.syncPracticeCache()
  },

  onShow() {
    this.applyAppearanceSettings()

    if (this.data.isReadonly) {
      return
    }

    const cache = storage.getPracticeCache()
    if (
      !cache ||
      cache.paperTitle !== this.data.practiceState.paperTitle ||
      cache.practiceType !== this.data.practiceType
    ) {
      return
    }

    const cachedQuestions =
      Array.isArray(cache.questions) && cache.questions.length
        ? cache.questions.map((question, index) => normalizeQuestion(question, index))
        : this.data.practiceState.questions.map((question, index) =>
            normalizeQuestion(question, index),
          )
    const currentIndex = cache.currentIndex || this.data.practiceState.currentIndex || 1
    const practiceDisplayMode =
      this.data.practiceType === EXAM_PRACTICE_TYPE
        ? DISPLAY_MODE.answer
        : cache.practiceDisplayMode === DISPLAY_MODE.analysis
        ? DISPLAY_MODE.analysis
        : this.data.practiceDisplayMode
    const practiceState = rebuildPracticeState({
      practiceState: {
        ...this.data.practiceState,
        paperTitle: cache.paperTitle || this.data.practiceState.paperTitle,
        questions: cachedQuestions,
      },
      answerSheet: Array.isArray(cache.answerSheet) ? cache.answerSheet : [],
      currentIndex,
      displayMode: practiceDisplayMode,
    })

    this.setData({
      startTime: cache.startTime || this.data.startTime,
      practiceDisplayMode,
      practiceModeTip: getPracticeModeTip(practiceDisplayMode),
      practiceState,
    }, () => {
      const timerState = this.getTimerState()

      this.setData(timerState)

      if (
        this.data.practiceType === EXAM_PRACTICE_TYPE &&
        timerState.remainTime <= 0 &&
        Number(this.data.practiceDuration || 0) > 0 &&
        !this.isSubmittingPractice
      ) {
        this.stopTimer()
        tool.toast('考试时间已到，自动交卷')
        setTimeout(() => {
          this.submitPractice({ source: 'timeout' })
        }, 1200)
      }
    })
  },

  onUnload() {
    this.stopTimer()
  },

  getAppSettings() {
    return {
      nightMode: false,
      fontSize: 'standard',
      fontSizeLabel: '标准',
      fontSizeScale: 1.0,
      ...(wx.getStorageSync(APP_SETTINGS_KEY) || {}),
    }
  },

  getThemeMode(settings = {}) {
    return settings.nightMode ? 'dark' : 'light'
  },

  getFontSizeLabel(settings = {}) {
    return settings.fontSizeLabel || FONT_SIZE_LABEL_MAP[settings.fontSize] || '标准'
  },

  getFontSize(settings = {}) {
    return settings.fontSize || 'standard'
  },

  getFontSizeScale(settings = {}) {
    return settings.fontSizeScale || 1.0
  },

  isReadonlyAnalysisScene(options = {}) {
    return (
      options.displayMode === DISPLAY_MODE.analysis &&
      !!(
        options.resultSource ||
        options.filter ||
        options.section ||
        options.knowledgePath ||
        options.analysisTitle
      )
    )
  },

  applyAppearanceSettings(settings = this.getAppSettings()) {
    const themeMode = this.getThemeMode(settings)
    this.setData({
      themeMode,
      themeTokens: THEME_TOKENS_MAP[themeMode],
      fontSize: this.getFontSize(settings),
      fontSizeLabel: this.getFontSizeLabel(settings),
      fontSizeScale: this.getFontSizeScale(settings),
    })
  },

  loadExamQuestions(options = {}) {
    const finalExamMode = options.examMode || (options.paperId ? 'full' : 'special')
    const subject = options.subject || 'xingce'
    const categoryIds = normalizeCategoryIds(options.categoryIds)
    const categoryPlanList = parseCategoryPlan(options.categoryPlan)
    const questionCount = Number.parseInt(options.count, 10) || 0
    const fallbackDuration =
      finalExamMode === 'full' ? DEFAULT_EXAM_DURATION : DEFAULT_CUSTOM_EXAM_DURATION
    const routeDuration = resolveDurationValue(options.duration, fallbackDuration)

    let paper = null

    if (finalExamMode === 'full' && options.paperId) {
      paper = getPaperDetail(options.paperId)
    } else if (finalExamMode === 'special' || finalExamMode === 'hybrid') {
      paper = createCustomPaper(
        finalExamMode,
        subject,
        categoryIds,
        questionCount || 20,
        routeDuration,
        categoryPlanList,
      )
    }

    if (!paper || !Array.isArray(paper.sections) || !paper.sections.length) {
      return {
        questions: [],
        paperTitle: '',
        subject,
        examMode: finalExamMode,
        paperId: options.paperId || '',
        duration: routeDuration,
        categoryIds,
        categoryPlan: serializeCategoryPlan(categoryPlanList),
        sections: [],
      }
    }

    const questions = []
    const sections = (paper.sections || []).map((section) => {
      const sectionName = section.name || '综合'
      const sectionQuestions = (section.questions || []).map((question) => ({
        ...question,
        section: section.section || question.section || sectionName,
      }))

      questions.push(...sectionQuestions)

      return {
        name: sectionName,
        total: sectionQuestions.length,
      }
    })

    return {
      questions,
      paperTitle: paper.name || paper.title || '考场模式',
      subject,
      examMode: finalExamMode,
      paperId: paper.paperId || paper.id || options.paperId || '',
      duration: resolveDurationValue(paper.totalDuration, routeDuration),
      categoryIds,
      categoryPlan: serializeCategoryPlan(categoryPlanList),
      sections,
    }
  },

  loadDailyQuestions(date) {
    return (getDailyQuestions(date) || []).map((question, index) =>
      normalizeQuestion(question, index),
    )
  },

  loadPracticeQuestions(subject, focus, count, year) {
    let questions = getQuestionsByFocus(subject, focus, count)
    const threshold = YEAR_THRESHOLD_MAP[year]

    if (threshold) {
      const filtered = questions.filter((question) => Number(question.year || 0) >= threshold)
      if (filtered.length) {
        questions = filtered
      }
    }

    return questions.map((question, index) => normalizeQuestion(question, index))
  },

  getReadonlyResultPayload(options = {}) {
    const practiceType = options.practiceType || this.data.practiceType || 'practice'
    const resultSource =
      options.resultSource ||
      this.data.resultSource ||
      (practiceType === EXAM_PRACTICE_TYPE ? 'exam' : 'practice')
    const cache = storage.getPracticeCache() || {}
    const sourceResult =
      resultSource === 'exam'
        ? storage.getExamResult() || cache.examReport || null
        : storage.getPracticeResult() || null
    const questions =
      sourceResult && Array.isArray(sourceResult.questions) && sourceResult.questions.length
        ? sourceResult.questions
        : Array.isArray(cache.questions) && cache.questions.length
          ? cache.questions
          : []
    const answerSheet =
      sourceResult && Array.isArray(sourceResult.answerSheet) && sourceResult.answerSheet.length
        ? sourceResult.answerSheet
        : Array.isArray(cache.answerSheet)
          ? cache.answerSheet
          : []

    return {
      cache,
      resultSource,
      sourceResult,
      questions,
      answerSheet,
    }
  },

  buildReadonlyPracticeState(options = {}) {
    const practiceType = options.practiceType || this.data.practiceType || 'practice'
    const filter = options.filter || this.data.analysisFilterType || 'all'
    const section = decodeRouteParam(options.section || this.data.analysisSectionName || '')
    const knowledgePath = decodeRouteParam(
      options.knowledgePath || this.data.analysisKnowledgePath || '',
    )
    const title = decodeRouteParam(options.analysisTitle || '')
    const { cache, resultSource, sourceResult, questions, answerSheet } =
      this.getReadonlyResultPayload(options)

    if (!Array.isArray(questions) || !questions.length) {
      return null
    }

    const normalizedQuestions = questions.map((question, index) =>
      normalizeQuestion(question, index),
    )
    const normalizedAnswerSheet = normalizeAnswerSheet(answerSheet, normalizedQuestions).map(
      (item, index) => {
        const selectedAnswers = normalizeAnswerIds(
          item.selectedAnswers && item.selectedAnswers.length
            ? item.selectedAnswers
            : item.userAnswer,
        )

        return {
          ...item,
          selectedAnswers,
          selectedAnswerText: formatAnswerText(selectedAnswers),
          userAnswer: getStoredAnswerValue(selectedAnswers, normalizedQuestions[index]),
          userAnswerText: formatAnswerText(selectedAnswers),
          confirmed: true,
          status: selectedAnswers.length
            ? getAnswerResultStatus(normalizedQuestions[index], selectedAnswers)
            : 'pending',
        }
      },
    )

    const filteredQuestions = []
    const filteredAnswerSheet = []

    normalizedQuestions.forEach((question, index) => {
      const answerItem = normalizedAnswerSheet[index]
      const questionSection = getQuestionSectionName(question)
      const answerStatus = hasSelectedAnswer(answerItem) ? answerItem.status : 'unanswered'
      const matchSection = !section || questionSection === section
      const matchKnowledgePath = matchesQuestionKnowledgePath(question, knowledgePath)
      const matchFilter = filter === 'all' ? true : answerStatus === filter

      if (!matchSection || !matchKnowledgePath || !matchFilter) {
        return
      }

      filteredQuestions.push({
        ...question,
        section: questionSection,
        displayIndex: index + 1,
      })
      filteredAnswerSheet.push(answerItem)
    })

    if (!filteredQuestions.length) {
      return null
    }

    const paperTitle =
      (sourceResult && (sourceResult.paperName || sourceResult.paperTitle)) ||
      cache.paperTitle ||
      '题目解析'

    return {
      practiceType: resultSource === 'exam' ? EXAM_PRACTICE_TYPE : practiceType,
      resultSource,
      analysisFilterType: filter,
      analysisSectionName: section,
      analysisKnowledgePath: knowledgePath,
      analysisScopeName: getKnowledgeLeafName(knowledgePath) || section,
      pageTitle: resolveReadonlyAnalysisTitle(filter, section, knowledgePath, title),
      practiceState: rebuildPracticeState({
        practiceState: {
          paperTitle,
          totalQuestions: filteredQuestions.length,
          currentIndex: filteredQuestions.length ? 1 : 0,
          questions: filteredQuestions,
          answerSheet: filteredAnswerSheet,
        },
        answerSheet: filteredAnswerSheet,
        currentIndex: 1,
        displayMode: DISPLAY_MODE.analysis,
      }),
    }
  },

  initReadonlyPractice(options = {}) {
    const readonlyState = this.buildReadonlyPracticeState(options)

    if (!readonlyState) {
      tool.toast('暂无可查看的解析内容')
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          router.back()
          return
        }
        router.switchTab('INDEX')
      }, 300)
      return
    }

    const app = getApp()
    const { statusBarHeight, clientHeight: windowHeight } = app.globalData
    const navBarHeight = (statusBarHeight || 0) + 44
    const materialPopupHeight = Math.max(
      Math.round((windowHeight || 667) * MATERIAL_POPUP_HEIGHT_RATIO),
      MATERIAL_POPUP_MIN_HEIGHT,
    )
    const appSettings = this.getAppSettings()
    const themeMode = this.getThemeMode(appSettings)

    this.isSubmittingPractice = false
    this.setData({
      practiceType: readonlyState.practiceType,
      pageTitle: readonlyState.pageTitle,
      isReadonly: true,
      resultSource: readonlyState.resultSource,
      analysisFilterType: readonlyState.analysisFilterType,
      analysisSectionName: readonlyState.analysisSectionName,
      analysisKnowledgePath: readonlyState.analysisKnowledgePath,
      analysisScopeName: readonlyState.analysisScopeName,
      practiceDisplayMode: DISPLAY_MODE.analysis,
      practiceModeTip: '当前展示本次作答的解析结果',
      draftSceneKey: '',
      themeMode,
      themeTokens: THEME_TOKENS_MAP[themeMode],
      fontSize: this.getFontSize(appSettings),
      fontSizeLabel: this.getFontSizeLabel(appSettings),
      fontSizeScale: this.getFontSizeScale(appSettings),
      practiceState: readonlyState.practiceState,
      materialPopupHeight,
      navBarHeight,
      startTime: 0,
      timerText: '',
      remainTime: 0,
    })
  },

  applyReadonlyView(
    filter = this.data.analysisFilterType,
    section = this.data.analysisSectionName,
    knowledgePath = this.data.analysisKnowledgePath,
  ) {
    const readonlyState = this.buildReadonlyPracticeState({
      practiceType: this.data.practiceType,
      resultSource: this.data.resultSource,
      filter,
      section,
      knowledgePath,
    })

    if (!readonlyState) {
      tool.toast('当前筛选下暂无题目')
      return
    }

    this.setData({
      pageTitle: readonlyState.pageTitle,
      analysisFilterType: readonlyState.analysisFilterType,
      analysisSectionName: readonlyState.analysisSectionName,
      analysisKnowledgePath: readonlyState.analysisKnowledgePath,
      analysisScopeName: readonlyState.analysisScopeName,
      practiceState: readonlyState.practiceState,
    })
  },

  getTimerState(startTime = this.data.startTime) {
    if (!startTime) {
      return {
        timerText: this.data.practiceType === EXAM_PRACTICE_TYPE ? '不限时' : '00:00:00',
        remainTime: this.data.practiceType === EXAM_PRACTICE_TYPE ? this.data.practiceDuration * 60 : 0,
      }
    }

    if (this.data.practiceType === EXAM_PRACTICE_TYPE) {
      const totalSeconds = Math.max(Number(this.data.practiceDuration || 0), 0) * 60

      if (totalSeconds <= 0) {
        return {
          timerText: '不限时',
          remainTime: 0,
        }
      }

      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remainTime = Math.max(totalSeconds - elapsed, 0)

      return {
        timerText: formatDurationText(remainTime),
        remainTime,
      }
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000)

    return {
      timerText: formatDurationText(elapsed),
      remainTime: 0,
    }
  },

  syncTimerDisplay() {
    this.setData(this.getTimerState())
  },

  startTimer() {
    this.stopTimer()
    this.syncTimerDisplay()

    if (this.data.practiceType === EXAM_PRACTICE_TYPE && Number(this.data.practiceDuration || 0) <= 0) {
      return
    }

    this.timerInterval = setInterval(() => {
      const nextTimerState = this.getTimerState()

      this.setData(nextTimerState)

      if (
        this.data.practiceType === EXAM_PRACTICE_TYPE &&
        nextTimerState.remainTime <= 0 &&
        !this.isSubmittingPractice
      ) {
        this.stopTimer()
        tool.toast('考试时间已到，自动交卷')
        setTimeout(() => {
          this.submitPractice({ source: 'timeout' })
        }, 1200)
      }
    }, 1000)
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  handleGoBack() {
    if (this.data.isReadonly) {
      const pages = getCurrentPages()

      if (pages.length > 1) {
        router.back()
        return
      }

      router.switchTab('INDEX')
      return
    }

    const isExamMode = this.data.practiceType === EXAM_PRACTICE_TYPE
    const { practiceState } = this.data
    const answeredCount = countAnsweredQuestions(practiceState.answerSheet)
    const unansweredCount = Math.max(practiceState.totalQuestions - answeredCount, 0)

    this.syncPracticeCache()

    wx.showModal({
      title: isExamMode ? '先别退出考试' : '先别退出答题',
      content: unansweredCount > 0
        ? `还有 ${unansweredCount} 题未作答，建议继续完成；如果现在要离开，可以先交卷再退出。`
        : '当前已经作答完成，如果现在要离开，建议先交卷再退出。',
      confirmText: '提交后退出',
      cancelText: isExamMode ? '继续考试' : '继续答题',
      success: (res) => {
        if (res.confirm) {
          this.handleFinish()
        }
      },
    })
  },

  getCurrentQuestion() {
    const { practiceState } = this.data
    return practiceState.questions[practiceState.currentIndex - 1] || null
  },

  syncPracticeCache() {
    if (this.data.isReadonly) {
      return
    }

    const {
      practiceState,
      practiceType,
      practiceDate,
      practiceSubject,
      practiceFocus,
      practiceYear,
      practiceExamMode,
      practicePaperId,
      practiceDuration,
      practiceCount,
      practiceCategoryIds,
      practiceCategoryPlan,
      practiceSections,
      practiceDisplayMode,
      startTime,
    } = this.data

    const correctCount = practiceState.answerSheet.filter((item) => item.status === 'correct').length
    const answeredCount = countAnsweredQuestions(practiceState.answerSheet)

    storage.setPracticeCache({
      practiceType,
      practiceDate,
      practiceSubject,
      practiceFocus,
      practiceYear,
      practiceExamMode,
      practicePaperId,
      practiceDuration,
      practiceCount,
      practiceCategoryIds,
      practiceCategoryPlan,
      practiceSections,
      practiceDisplayMode,
      startTime,
      paperTitle: practiceState.paperTitle,
      totalQuestions: practiceState.totalQuestions,
      currentIndex: practiceState.currentIndex,
      selectedAnswer: practiceState.selectedAnswer,
      selectedAnswers: practiceState.selectedAnswers,
      submitted: practiceState.submitted,
      isCorrect: practiceState.isCorrect,
      answeredCount,
      accuracyText:
        practiceState.totalQuestions > 0
          ? ((correctCount / practiceState.totalQuestions) * 100).toFixed(1)
          : '0.0',
      currentQuestion: this.getCurrentQuestion(),
      questions: practiceState.questions,
      answerSheet: practiceState.answerSheet,
    })
  },

  applyPracticeState(answerSheet, currentIndex = this.data.practiceState.currentIndex) {
    const practiceState = rebuildPracticeState({
      practiceState: this.data.practiceState,
      answerSheet,
      currentIndex,
      displayMode: this.data.practiceDisplayMode,
    })

    this.setData({ practiceState })
    this.syncPracticeCache()
  },

  updateCurrentQuestion(currentIndex) {
    this.applyPracticeState(this.data.practiceState.answerSheet, currentIndex)
  },

  handleSwiperChange(e) {
    const nextIndex = (e.detail.current || 0) + 1
    this.updateCurrentQuestion(nextIndex)
  },

  handleDisplayModeSwitch(e) {
    if (this.data.isReadonly) {
      return
    }

    if (this.data.practiceType === EXAM_PRACTICE_TYPE) {
      return
    }

    const { mode } = e.currentTarget.dataset
    const nextMode =
      mode === DISPLAY_MODE.analysis ? DISPLAY_MODE.analysis : DISPLAY_MODE.answer

    if (nextMode === this.data.practiceDisplayMode) {
      return
    }

    const switchMode = () => {
      const practiceState = rebuildPracticeState({
        practiceState: this.data.practiceState,
        answerSheet: this.data.practiceState.answerSheet,
        currentIndex: this.data.practiceState.currentIndex,
        displayMode: nextMode,
      })

      this.setData({
        practiceDisplayMode: nextMode,
        practiceModeTip: getPracticeModeTip(nextMode),
        practiceState,
      })
      this.syncPracticeCache()
    }

    if (nextMode === DISPLAY_MODE.analysis) {
      wx.showModal({
        title: '切换到解析模式',
        content: '解析模式下，每题都需要点击“确认答案”后才显示解析，且确认后本题答案不可修改。',
        confirmText: '继续切换',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            switchMode()
          }
        },
      })
      return
    }

    switchMode()
  },

  handleOptionTap(e) {
    if (this.data.isReadonly) {
      return
    }

    const { id, questionIndex } = e.currentTarget.dataset
    const index = Number(questionIndex)
    const { practiceState, practiceDisplayMode } = this.data
    const answerItem = practiceState.answerSheet[index]
    const currentQuestion = practiceState.questions[index]

    if (!answerItem || !currentQuestion) {
      return
    }

    if (answerItem.confirmed) {
      tool.toast('本题已确认，答案不可修改')
      return
    }

    const selectedAnswers = normalizeAnswerIds(answerItem.selectedAnswers)
    let nextSelectedAnswers = []

    if (currentQuestion.allowMultiple) {
      nextSelectedAnswers = selectedAnswers.includes(id)
        ? selectedAnswers.filter((item) => item !== id)
        : [...selectedAnswers, id]
    } else {
      nextSelectedAnswers = [id]
    }

    const answerSheet = practiceState.answerSheet.map((item, sheetIndex) => {
      if (sheetIndex !== index) {
        return item
      }

      return {
        ...item,
        selectedAnswers: nextSelectedAnswers,
        selectedAnswerText: formatAnswerText(nextSelectedAnswers),
        status: nextSelectedAnswers.length ? 'answered' : 'pending',
      }
    })

    this.applyPracticeState(answerSheet)
    wx.vibrateShort({ type: 'light' })

    // 答题模式下，单选题选中答案后自动跳转到下一题
    if (practiceDisplayMode === DISPLAY_MODE.answer && !currentQuestion.allowMultiple && nextSelectedAnswers.length > 0) {
      const currentIndex = practiceState.currentIndex
      if (currentIndex < practiceState.totalQuestions) {
        setTimeout(() => {
          this.updateCurrentQuestion(currentIndex + 1)
        }, 300)
      }
    }
  },

  handleConfirmAnswer() {
    if (this.data.isReadonly) {
      return
    }

    if (this.data.practiceDisplayMode !== DISPLAY_MODE.analysis) {
      return
    }

    const questionIndex = this.data.practiceState.currentIndex - 1
    const currentQuestion = this.data.practiceState.questions[questionIndex]
    const currentAnswer = this.data.practiceState.answerSheet[questionIndex]

    if (!currentQuestion || !currentAnswer) {
      return
    }

    if (currentAnswer.confirmed) {
      tool.toast('本题已确认')
      return
    }

    const selectedAnswers = normalizeAnswerIds(currentAnswer.selectedAnswers)
    if (!selectedAnswers.length) {
      tool.toast(currentQuestion.allowMultiple ? '请先选择答案后再确认' : '请先选择答案')
      return
    }

    const status = getAnswerResultStatus(currentQuestion, selectedAnswers)
    const answerSheet = this.data.practiceState.answerSheet.map((item, index) => {
      if (index !== questionIndex) {
        return item
      }

      return {
        ...item,
        confirmed: true,
        status,
        userAnswer: getStoredAnswerValue(selectedAnswers, currentQuestion),
        userAnswerText: formatAnswerText(selectedAnswers),
      }
    })

    this.applyPracticeState(answerSheet)
    wx.vibrateShort({ type: status === 'correct' ? 'light' : 'medium' })
  },

  handleSubmit() {
    if (!this.data.practiceState.selectedAnswer) {
      tool.toast('请先选择答案')
    }
  },

  handleReadonlyFilterChange(e) {
    if (!this.data.isReadonly) {
      return
    }

    const type = e.currentTarget.dataset.type || 'all'

    if (type === this.data.analysisFilterType) {
      return
    }

    this.applyReadonlyView(type, this.data.analysisSectionName, this.data.analysisKnowledgePath)
  },

  handleReadonlySectionReset() {
    if (!this.data.isReadonly || (!this.data.analysisSectionName && !this.data.analysisKnowledgePath)) {
      return
    }

    this.applyReadonlyView(this.data.analysisFilterType, '', '')
  },

  handleOpenAnswerCard() {
    this.setData({ showAnswerCard: true })
  },

  handleOpenDraft() {
    this.setData({ showMorePopup: false }, () => {
      const draftSheet = this.selectComponent('#draftSheet')
      if (draftSheet) {
        draftSheet.open()
      }
    })
  },

  handleDraftOpen() {
    this.setData({ showDraftSheet: true })
  },

  handleDraftClose() {
    this.setData({ showDraftSheet: false })
  },

  handleCloseAnswerCard() {
    this.setData({ showAnswerCard: false })
  },

  handleAnswerCardChange(e) {
    this.setData({ showAnswerCard: e.detail.visible })
  },

  handleSelectQuestion(e) {
    const { index } = e.detail
    this.setData({ showAnswerCard: false })
    this.updateCurrentQuestion(Number(index))
  },

  handleOpenAnalysis() {
    this.syncPracticeCache()
    router.push('ANALYSIS', { practiceType: this.data.practiceType })
  },

  handleNext() {
    const { practiceState } = this.data
    if (practiceState.currentIndex >= practiceState.totalQuestions) {
      tool.toast('当前已经是最后一题')
      return
    }

    this.updateCurrentQuestion(practiceState.currentIndex + 1)
  },

  handlePrev() {
    const { practiceState } = this.data
    if (practiceState.currentIndex <= 1) {
      tool.toast('当前已经是第一题')
      return
    }

    this.updateCurrentQuestion(practiceState.currentIndex - 1)
  },

  handleCollect() {
    const { practiceState } = this.data
    const currentQuestion = practiceState.questions[practiceState.currentIndex - 1]
    const isCollected = currentQuestion.collected

    if (isCollected) {
      storage.removeFavorite(currentQuestion.questionId || currentQuestion.id)
    } else {
      storage.addFavorite(currentQuestion)
    }

    const updatedQuestions = practiceState.questions.map((question, index) => {
      if (index === practiceState.currentIndex - 1) {
        return { ...question, collected: !isCollected }
      }
      return question
    })

    const nextPracticeState = rebuildPracticeState({
      practiceState: {
        ...practiceState,
        questions: updatedQuestions,
      },
      answerSheet: practiceState.answerSheet,
      currentIndex: practiceState.currentIndex,
      displayMode: this.data.practiceDisplayMode,
    })

    this.setData({
      showMorePopup: false,
      practiceState: nextPracticeState,
    })
    this.syncPracticeCache()
    tool.toast(!isCollected ? '已收藏' : '已取消收藏')
  },

  handleMark() {
    const { practiceState } = this.data
    const answerSheet = practiceState.answerSheet.map((item) => {
      if (item.index !== practiceState.currentIndex) {
        return item
      }

      return {
        ...item,
        marked: !item.marked,
      }
    })

    this.setData({
      showMorePopup: false,
    })
    this.applyPracticeState(answerSheet)
    tool.toast(answerSheet[practiceState.currentIndex - 1].marked ? '已标记' : '已取消标记')
  },

  handleFinish() {
    if (this.data.isReadonly) {
      const pages = getCurrentPages()

      if (pages.length > 1) {
        router.back()
        return
      }

      router.switchTab('INDEX')
      return
    }

    const { practiceState } = this.data
    const answeredCount = countAnsweredQuestions(practiceState.answerSheet)

    this.setData({ showMorePopup: false })

    if (answeredCount < practiceState.totalQuestions) {
      wx.showModal({
        title: '提示',
        content: `还有 ${practiceState.totalQuestions - answeredCount} 题未作答，确定要交卷吗？`,
        confirmText: '确定交卷',
        cancelText: '继续答题',
        success: (res) => {
          if (res.confirm) {
            this.submitPractice()
          }
        },
      })
      return
    }

    this.submitPractice()
  },

  handleShowMore() {
    this.setData({ showMorePopup: true })
  },

  handleCloseMore() {
    this.setData({ showMorePopup: false })
  },

  handlePopupChange(e) {
    this.setData({ showMorePopup: e.detail.visible })
  },

  handleRestart() {
    this.setData({ showMorePopup: false })
    wx.showModal({
      title: '提示',
      content: '确定要重新开始吗？当前答题记录将被清空',
      confirmText: '重新开始',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const baseQuestions = this.data.practiceState.questions.map((question, index) =>
            normalizeQuestion(question, index),
          )
          const resetStartTime = Date.now()
          const resetTimerState =
            this.data.practiceType === EXAM_PRACTICE_TYPE
              ? this.getTimerState(resetStartTime)
              : {
                  timerText: '00:00:00',
                  remainTime: 0,
                }

          this.stopTimer()
          storage.clearDraftSheet(this.data.draftSceneKey)
          this.isSubmittingPractice = false
          this.setData({
            practiceDisplayMode: DISPLAY_MODE.answer,
            practiceModeTip: getPracticeModeTip(DISPLAY_MODE.answer),
            practiceState: buildPracticeState(
              baseQuestions,
              this.data.practiceState.paperTitle,
              DISPLAY_MODE.answer,
            ),
            startTime: resetStartTime,
            timerText: resetTimerState.timerText,
            remainTime: resetTimerState.remainTime,
          })
          this.startTimer()
          this.syncPracticeCache()
        }
      },
    })
  },

  handleFontSize() {
    this.setData({
      showMorePopup: false,
      showFontSizeSelector: true,
    })
  },

  handleCloseFontSize() {
    this.setData({ showFontSizeSelector: false })
  },

  handleFontSizeSelect(e) {
    const { fontSize, fontSizeLabel, fontSizeScale } = e.detail
    this.setData({
      fontSize,
      fontSizeLabel,
      fontSizeScale,
      showFontSizeSelector: false,
    })
  },

  handleTheme() {
    const nextNightMode = this.data.themeMode !== 'dark'
    const nextSettings = {
      ...this.getAppSettings(),
      nightMode: nextNightMode,
    }

    wx.setStorageSync(APP_SETTINGS_KEY, nextSettings)
    this.applyAppearanceSettings(nextSettings)
    this.setData({ showMorePopup: false })
    tool.toast(nextNightMode ? '已切换为夜间模式' : '已切换为日间模式')
  },

  handleSubmitFromMore() {
    this.setData({ showMorePopup: false })
    this.handleSubmit()
  },

  handleShowMaterial(e) {
    const { index } = e.currentTarget.dataset
    const question = this.data.practiceState.questions[index]

    if (question && (question.material || question.materialImage)) {
      this.setData({
        showMaterial: true,
        materialScrollTop: 0,
        currentMaterial: {
          title: question.materialTitle || '给定材料',
          text: question.material,
          image: question.materialImage,
        },
      })
    }
  },

  handleCloseMaterial() {
    this.setData({ showMaterial: false })
  },

  handleMaterialChange(e) {
    this.setData({ showMaterial: e.detail.visible })
  },

  buildPracticeResult(finalAnswerSheet, finalQuestions) {
    const { practiceType, practiceDate } = this.data
    const totalQuestions = finalQuestions.length || 0
    const correctCount = finalAnswerSheet.filter((item) => item.status === 'correct').length
    const wrongCount = finalAnswerSheet.filter((item) => item.status === 'wrong').length
    const unansweredCount = finalAnswerSheet.filter((item) => !hasSelectedAnswer(item)).length
    const accuracy =
      totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : '0.0'
    const duration = Math.floor((Date.now() - this.data.startTime) / 1000)
    const sectionStats = buildSectionStats(
      finalAnswerSheet,
      finalQuestions,
      this.data.practiceSections,
    )

    return {
      practiceType,
      practiceDate,
      paperName: this.data.practiceState.paperTitle,
      paperTitle: this.data.practiceState.paperTitle,
      score: totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0,
      totalScore: 100,
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      unanswered: unansweredCount,
      accuracy,
      duration,
      timerText: formatDurationText(duration),
      totalTime: formatSpentTime(duration),
      sectionStats,
      answerSheet: finalAnswerSheet,
      questions: finalQuestions,
      finishedAt: new Date().toISOString(),
    }
  },

  buildExamResult(finalAnswerSheet, finalQuestions) {
    const totalQuestions = finalQuestions.length || 0
    const correctCount = finalAnswerSheet.filter((item) => item.status === 'correct').length
    const wrongCount = finalAnswerSheet.filter((item) => item.status === 'wrong').length
    const unanswered = finalAnswerSheet.filter((item) => !hasSelectedAnswer(item)).length
    const duration = Math.floor((Date.now() - this.data.startTime) / 1000)
    const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0
    const sectionStats = buildSectionStats(
      finalAnswerSheet,
      finalQuestions,
      this.data.practiceSections,
    )

    return {
      paperName: this.data.practiceState.paperTitle || '考场模式',
      examMode: this.data.practiceExamMode || 'full',
      score,
      totalScore: 100,
      totalQuestions,
      correctCount,
      wrongCount,
      unanswered,
      accuracy: `${score}%`,
      totalTime: formatSpentTime(duration),
      sectionStats,
      rank:
        score >= 85
          ? '超过 92% 的考生'
          : score >= 70
            ? '超过 78% 的考生'
            : score >= 60
              ? '超过 63% 的考生'
              : '超过 41% 的考生',
      answerSheet: finalAnswerSheet,
      questions: finalQuestions,
      finishedAt: new Date().toISOString(),
    }
  },

  submitPractice() {
    if (this.isSubmittingPractice) {
      return
    }

    this.isSubmittingPractice = true

    const { practiceState, practiceType, practiceDate, draftSceneKey } = this.data
    const isExamSession =
      practiceType === EXAM_PRACTICE_TYPE ||
      !!this.data.practiceExamMode ||
      !!this.data.practicePaperId
    const finalPracticeType = isExamSession ? EXAM_PRACTICE_TYPE : practiceType
    const finalQuestions = practiceState.questions.map((question, index) =>
      normalizeQuestion(question, index),
    )
    const finalAnswerSheet = finalizeAnswerSheet(practiceState.answerSheet, finalQuestions)
    const result = this.buildPracticeResult(finalAnswerSheet, finalQuestions)

    this.stopTimer()
    try {
      storage.clearDraftSheet(draftSceneKey)
    } catch (error) {
      console.warn('clear draft sheet failed:', error)
    }

    try {
      finalAnswerSheet.forEach((item, index) => {
        if (item.status !== 'wrong') {
          return
        }

        storage.addWrongQuestion({
          ...finalQuestions[index],
          userAnswer: item.userAnswer,
          practiceType: finalPracticeType,
        })
      })
    } catch (error) {
      console.warn('save wrong questions failed:', error)
    }

    if (isExamSession) {
      const examResult = this.buildExamResult(finalAnswerSheet, finalQuestions)
      const examReport = {
        paperName: examResult.paperName,
        examMode: examResult.examMode,
        score: examResult.score,
        totalScore: examResult.totalScore,
        totalQuestions: examResult.totalQuestions,
        correctCount: examResult.correctCount,
        wrongCount: examResult.wrongCount,
        unanswered: examResult.unanswered,
        accuracy: examResult.accuracy,
        totalTime: examResult.totalTime,
        sectionStats: examResult.sectionStats,
        rank: examResult.rank,
        finishedAt: examResult.finishedAt,
      }
      let examHistoryRecord = null

      try {
        storage.setExamResult(examReport)
      } catch (error) {
        console.warn('save exam report failed:', error)
      }

      try {
        examHistoryRecord = storage.appendExamResultHistory(examResult)
      } catch (error) {
        console.warn('append exam result history failed:', error)
      }

      try {
        storage.appendRecord({
          type: '模拟刷题',
          title: practiceState.paperTitle || '考场模式',
          questions: examResult.totalQuestions,
          correct: examResult.correctCount,
          accuracy: examResult.score,
          duration: formatMinutesText(result.duration),
          practiceType: EXAM_PRACTICE_TYPE,
          resultSource: 'exam',
          resultId: examHistoryRecord ? examHistoryRecord.id : '',
          subject: this.data.practiceSubject,
        })
      } catch (error) {
        console.warn('append practice record failed:', error)
      }

      try {
        storage.setPracticeCache({
          ...(storage.getPracticeCache() || {}),
          practiceType: EXAM_PRACTICE_TYPE,
          practiceDate,
          practiceSubject: this.data.practiceSubject,
          practiceFocus: this.data.practiceFocus,
          practiceYear: this.data.practiceYear,
          practiceExamMode: this.data.practiceExamMode,
          practicePaperId: this.data.practicePaperId,
          practiceDuration: this.data.practiceDuration,
          practiceCount: this.data.practiceCount,
          practiceCategoryIds: this.data.practiceCategoryIds,
          practiceCategoryPlan: this.data.practiceCategoryPlan,
          practiceSections: this.data.practiceSections,
          practiceDisplayMode: DISPLAY_MODE.answer,
          paperTitle: practiceState.paperTitle,
          totalQuestions: examResult.totalQuestions,
          currentIndex: practiceState.currentIndex,
          selectedAnswer: practiceState.selectedAnswer,
          selectedAnswers: practiceState.selectedAnswers,
          submitted: true,
          isCorrect: practiceState.isCorrect,
          answeredCount: countAnsweredQuestions(finalAnswerSheet),
          accuracyText: String(examResult.score),
          currentQuestion: finalQuestions[practiceState.currentIndex - 1] || null,
          questions: finalQuestions,
          answerSheet: finalAnswerSheet,
          startTime: this.data.startTime,
          examReport,
        })
      } catch (error) {
        console.warn('update practice cache failed:', error)
      }

      router
        .reLaunch('EXAM_REPORT', { reportType: 'exam' })
        .catch((error) => {
          console.error('reLaunch exam report failed:', error)
          return router.redirect('EXAM_REPORT', { reportType: 'exam' })
        })
        .catch((routeError) => {
          console.error('redirect exam report failed:', routeError)
          this.isSubmittingPractice = false
          tool.toast('报告页打开失败，请重试')
        })
      return
    }

    try {
      storage.setPracticeResult(result)
    } catch (error) {
      console.warn('save practice result failed:', error)
    }

    let practiceHistoryRecord = null

    try {
      practiceHistoryRecord = storage.appendPracticeResultHistory(result)
    } catch (error) {
      console.warn('append practice result history failed:', error)
    }

    if (practiceType === 'daily') {
      storage.setDailyRecord(practiceDate, result)
      storage.appendRecord({
        type: '每日一练',
        title: `行测每日一练 ${practiceDate}`,
        questions: result.totalQuestions,
        correct: result.correctCount,
        accuracy: Number(result.accuracy),
        duration: formatMinutesText(result.duration),
        practiceType,
        resultSource: 'practice',
        resultId: practiceHistoryRecord ? practiceHistoryRecord.id : '',
        subject: this.data.practiceSubject,
      })
    } else {
      storage.appendRecord({
        type: '专项练习',
        title: practiceState.paperTitle || '专项练习',
        questions: result.totalQuestions,
        correct: result.correctCount,
        accuracy: Number(result.accuracy),
        duration: formatMinutesText(result.duration),
        practiceType,
        resultSource: 'practice',
        resultId: practiceHistoryRecord ? practiceHistoryRecord.id : '',
        subject: this.data.practiceSubject,
      })
    }

    storage.setPracticeCache({
      ...(storage.getPracticeCache() || {}),
      practiceType: finalPracticeType,
      practiceDate,
      practiceSubject: this.data.practiceSubject,
      practiceFocus: this.data.practiceFocus,
      practiceYear: this.data.practiceYear,
      practiceSections: this.data.practiceSections,
      practiceDisplayMode: this.data.practiceDisplayMode,
      paperTitle: practiceState.paperTitle,
      totalQuestions: result.totalQuestions,
      currentIndex: practiceState.currentIndex,
      selectedAnswer: practiceState.selectedAnswer,
      selectedAnswers: practiceState.selectedAnswers,
      submitted: true,
      isCorrect: practiceState.isCorrect,
      answeredCount: countAnsweredQuestions(finalAnswerSheet),
      accuracyText: result.accuracy,
      currentQuestion: finalQuestions[practiceState.currentIndex - 1] || null,
      questions: finalQuestions,
      answerSheet: finalAnswerSheet,
      startTime: this.data.startTime,
    })

    if (practiceType === 'practice') {
      router
        .reLaunch('EXAM_REPORT', { reportType: 'practice' })
        .catch((error) => {
          console.error('reLaunch practice report failed:', error)
          return router.redirect('EXAM_REPORT', { reportType: 'practice' })
        })
        .catch((routeError) => {
          console.error('redirect practice report failed:', routeError)
          this.isSubmittingPractice = false
          tool.toast('报告页打开失败，请重试')
        })
      return
    }

    router.push('ANALYSIS', { practiceType })
  },
})
