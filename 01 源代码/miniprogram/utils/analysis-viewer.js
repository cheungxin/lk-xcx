import {
  getKnowledgeLeafName as resolveKnowledgeLeafName,
  getQuestionKnowledgePath as resolveQuestionKnowledgePath,
  getQuestionKnowledgeSegments as resolveQuestionKnowledgeSegments,
  getQuestionSectionName as resolveQuestionSectionName,
  normalizeQuestionRecord,
} from './question-schema'

const TYPE_LABEL_MAP = {
  single: '单选题',
  multi: '多选题',
  judge: '判断题',
}

const ANALYSIS_TITLE_MAP = {
  all: '全部解析',
  wrong: '错题解析',
  correct: '正确题目',
  unanswered: '未答题目',
}

export const decodeRouteParam = (value = '') => {
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

export const normalizeAnswerIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[、,，/|\s]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (value === undefined || value === null || value === '') {
    return []
  }

  return [String(value)]
}

export const formatAnswerText = (value) => normalizeAnswerIds(value).join(' / ')

const normalizeTypeLabel = (value = '') => {
  const normalized = String(value || '').trim()
  return TYPE_LABEL_MAP[normalized] || normalized || '单选题'
}

const normalizePathText = (value = '') =>
  String(value === undefined || value === null ? '' : value).trim()

const isSameAnswer = (left = [], right = []) => {
  const normalizedLeft = normalizeAnswerIds(left).slice().sort()
  const normalizedRight = normalizeAnswerIds(right).slice().sort()

  if (normalizedLeft.length !== normalizedRight.length) {
    return false
  }

  return normalizedLeft.every((item, index) => item === normalizedRight[index])
}

export const getQuestionSectionName = (question = {}) =>
  resolveQuestionSectionName(question)

export const getQuestionKnowledgeSegments = (question = {}) =>
  resolveQuestionKnowledgeSegments(question)

export const getQuestionKnowledgePath = (question = {}) =>
  resolveQuestionKnowledgePath(question)

export const getKnowledgeLeafName = (value = '') => resolveKnowledgeLeafName(value)

export const matchesQuestionKnowledgePath = (question = {}, knowledgePath = '') => {
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

export const hasSelectedAnswer = (answerItem = {}) =>
  normalizeAnswerIds(answerItem.selectedAnswers).length > 0 ||
  normalizeAnswerIds(answerItem.userAnswer).length > 0

export const normalizeQuestion = (question = {}, index = 0) => {
  const normalizedQuestion = normalizeQuestionRecord(question, index)
  const id =
    normalizedQuestion.id || normalizedQuestion.questionId || `analysis-question-${index + 1}`
  const correctAnswerList = normalizeAnswerIds(
    normalizedQuestion.correctAnswer !== undefined
      ? normalizedQuestion.correctAnswer
      : normalizedQuestion.answer,
  )

  return {
    ...normalizedQuestion,
    id,
    questionId: normalizedQuestion.questionId || id,
    type: normalizeTypeLabel(normalizedQuestion.typeLabel || normalizedQuestion.type),
    rawType: normalizedQuestion.rawType || normalizedQuestion.type || '',
    correctAnswerList,
    correctAnswerText: formatAnswerText(correctAnswerList),
    explanation: normalizedQuestion.explanation || normalizedQuestion.analysis || '',
    analysis: normalizedQuestion.analysis || normalizedQuestion.explanation || '',
    knowledgePoint: normalizedQuestion.knowledgePoint || '',
    section: getQuestionSectionName(normalizedQuestion),
    material: normalizedQuestion.material || '',
    materialTitle: normalizedQuestion.materialTitle || '给定材料',
    materialPreview:
      normalizedQuestion.materialPreview || normalizedQuestion.material || '',
    materialImage: normalizedQuestion.materialImage || '',
    questionImage: normalizedQuestion.questionImage || '',
    options: Array.isArray(normalizedQuestion.options) ? normalizedQuestion.options : [],
  }
}

export const getAnswerResultStatus = (question = {}, answerIds = []) => {
  const normalized = normalizeAnswerIds(answerIds)

  if (!normalized.length) {
    return 'unanswered'
  }

  return isSameAnswer(normalized, question.correctAnswerList || question.correctAnswer)
    ? 'correct'
    : 'wrong'
}

export const normalizeAnswerItem = (answerItem = {}, question = {}) => {
  const selectedAnswers = normalizeAnswerIds(
    answerItem.selectedAnswers && answerItem.selectedAnswers.length
      ? answerItem.selectedAnswers
      : answerItem.userAnswer,
  )

  return {
    ...answerItem,
    selectedAnswers,
    selectedAnswerText: formatAnswerText(selectedAnswers),
    userAnswer: answerItem.userAnswer !== undefined ? answerItem.userAnswer : selectedAnswers.join(','),
    userAnswerText: formatAnswerText(selectedAnswers),
    confirmed: true,
    status: getAnswerResultStatus(question, selectedAnswers),
  }
}

export const decorateQuestionForAnalysis = (question = {}, answerItem = {}, displayIndex = 0) => {
  const selectedAnswers = normalizeAnswerIds(answerItem.selectedAnswers)
  const correctAnswerList = normalizeAnswerIds(question.correctAnswerList)

  return {
    ...question,
    displayIndex,
    answerStatus: answerItem.status,
    userAnswerText: answerItem.userAnswerText || '未作答',
    selectedAnswerText: answerItem.selectedAnswerText || '',
    options: (question.options || []).map((option) => {
      const isSelected = selectedAnswers.includes(option.id)
      const isCorrectOption = correctAnswerList.includes(option.id)

      return {
        ...option,
        isSelected,
        isCorrectOption,
        isWrongSelection: isSelected && !isCorrectOption,
      }
    }),
  }
}

export const resolveAnalysisTitle = (
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

  return ANALYSIS_TITLE_MAP[filter] || ANALYSIS_TITLE_MAP.all
}

export const buildAnalysisViewState = ({
  questions = [],
  answerSheet = [],
  filter = 'all',
  section = '',
  knowledgePath = '',
  title = '',
} = {}) => {
  const normalizedQuestions = (Array.isArray(questions) ? questions : []).map((question, index) =>
    normalizeQuestion(question, index),
  )
  const normalizedAnswerSheet = normalizedQuestions.map((question, index) =>
    normalizeAnswerItem(answerSheet[index] || {}, question),
  )

  const filteredQuestions = []
  const filteredAnswerSheet = []

  normalizedQuestions.forEach((question, index) => {
    const answerItem = normalizedAnswerSheet[index]
    const answerStatus = answerItem.status || 'unanswered'
    const matchSection = !section || question.section === section
    const matchKnowledgePath = matchesQuestionKnowledgePath(question, knowledgePath)
    const matchFilter = filter === 'all' ? true : answerStatus === filter

    if (!matchSection || !matchKnowledgePath || !matchFilter) {
      return
    }

    filteredQuestions.push(
      decorateQuestionForAnalysis(question, answerItem, filteredQuestions.length + 1),
    )
    filteredAnswerSheet.push(answerItem)
  })

  const summary = filteredAnswerSheet.reduce(
    (result, item) => {
      const status = item.status || 'unanswered'

      if (status === 'correct') {
        result.correct += 1
      } else if (status === 'wrong') {
        result.wrong += 1
      } else {
        result.unanswered += 1
      }

      result.total += 1
      return result
    },
    {
      total: 0,
      correct: 0,
      wrong: 0,
      unanswered: 0,
    },
  )

  const scopeName = getKnowledgeLeafName(knowledgePath) || section

  return {
    questions: filteredQuestions,
    answerSheet: filteredAnswerSheet,
    summary,
    scopeName,
    pageTitle: resolveAnalysisTitle(filter, section, knowledgePath, title),
  }
}
