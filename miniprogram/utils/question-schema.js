const TYPE_LABEL_MAP = {
  single: '单选题',
  multi: '多选题',
  judge: '判断题',
  '1': '单选题',
  '2': '多选题',
  '3': '判断题',
  单选题: '单选题',
  多选题: '多选题',
  判断题: '判断题',
}

const DIFFICULTY_META_MAP = {
  easy: { value: 'easy', label: '简单', level: 1 },
  medium: { value: 'medium', label: '适中', level: 2 },
  hard: { value: 'hard', label: '困难', level: 3 },
}

const DIFFICULTY_ALIAS_MAP = {
  easy: 'easy',
  simple: 'easy',
  low: 'easy',
  简单: 'easy',
  容易: 'easy',
  medium: 'medium',
  middle: 'medium',
  normal: 'medium',
  适中: 'medium',
  中等: 'medium',
  一般: 'medium',
  hard: 'hard',
  difficult: 'hard',
  high: 'hard',
  困难: 'hard',
  较难: 'hard',
  很难: 'hard',
}

const PLACEHOLDER_VALUES = new Set([
  '',
  '未分类',
  '未知',
  '暂无',
  'null',
  'undefined',
])

const buildOptionId = (index = 0) => String.fromCharCode(65 + index)

export const normalizeText = (value = '') =>
  String(value === undefined || value === null ? '' : value)
    .replace(/\u00a0/g, ' ')
    .trim()

export const isMeaningfulValue = (value = '') =>
  !PLACEHOLDER_VALUES.has(normalizeText(value))

const decodeHtmlEntities = (value = '') =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

export const normalizeRichText = (value = '') =>
  decodeHtmlEntities(
    normalizeText(value)
      .replace(/<(br|hr)\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|tr)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n'),
  ).trim()

export const normalizeQuestionTypeLabel = (input = {}) => {
  const rawValue =
    typeof input === 'object'
      ? input.typeLabel ||
        input.type_name ||
        input.typeName ||
        input.type ||
        input.rawType ||
        input.typeId ||
        input.type_id ||
        ''
      : input

  const normalized = normalizeText(rawValue)
  const typeKey = /^\d+$/.test(normalized)
    ? normalized
    : normalized.toLowerCase()

  return TYPE_LABEL_MAP[typeKey] || normalized || '单选题'
}

export const normalizeDifficultyMeta = (input = {}) => {
  const rawValue =
    typeof input === 'object'
      ? input.difficulty ||
        input.question_difficulty ||
        input.difficultyLabel ||
        input.difficulty_label ||
        ''
      : input

  const normalized = normalizeText(rawValue)
  const aliasKey = /^\d+$/.test(normalized)
    ? normalized
    : normalized.toLowerCase()
  const difficultyKey = DIFFICULTY_ALIAS_MAP[aliasKey] || 'medium'

  return DIFFICULTY_META_MAP[difficultyKey]
}

export const normalizeQuestionScore = (question = {}) => {
  const candidates = [
    question.questionScore,
    question.question_score,
    question.score,
    question.points,
    question.pointScore,
    question.scoreWeight,
  ]

  for (let index = 0; index < candidates.length; index += 1) {
    const value = candidates[index]
    if (value === undefined || value === null || value === '') {
      continue
    }

    const parsedValue = Number(value)
    if (!Number.isNaN(parsedValue)) {
      return parsedValue
    }
  }

  return null
}

export const normalizeQuestionSource = (question = {}) => {
  const candidates = [
    question.source,
    question.question_source,
    question.sourcePaper,
    question.paperTitle,
    question.paperName,
    question.title,
  ]

  return candidates.find((item) => isMeaningfulValue(item)) || ''
}

export const normalizeQuestionYear = (question = {}) => {
  const directCandidates = [question.year, question.examYear, question.exam_year]

  for (let index = 0; index < directCandidates.length; index += 1) {
    const value = directCandidates[index]
    if (value === undefined || value === null || value === '') {
      continue
    }

    const parsedValue = Number(value)
    if (!Number.isNaN(parsedValue) && parsedValue > 1900 && parsedValue < 2100) {
      return parsedValue
    }
  }

  const sourceText = normalizeQuestionSource(question)
  const yearMatch = sourceText.match(/(19|20)\d{2}/)

  return yearMatch ? Number(yearMatch[0]) : null
}

export const splitKnowledgePath = (value = '') =>
  normalizeText(value)
    .split(/\s*(?:>|\/|／|｜|\|)\s*/)
    .map((item) => normalizeText(item))
    .filter((item) => isMeaningfulValue(item))

const compactKnowledgeSegments = (segments = []) =>
  segments.reduce((result, item) => {
    const normalized = normalizeText(item)

    if (!isMeaningfulValue(normalized) || result[result.length - 1] === normalized) {
      return result
    }

    result.push(normalized)
    return result
  }, [])

const normalizeKnowledgeCandidate = (value) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return compactKnowledgeSegments(
      value.flatMap((item) => (typeof item === 'string' ? splitKnowledgePath(item) : [])),
    )
  }

  if (typeof value === 'string') {
    return compactKnowledgeSegments(splitKnowledgePath(value))
  }

  return []
}

export const getQuestionSectionName = (question = {}) =>
  (isMeaningfulValue(question.section) ? normalizeText(question.section) : '') ||
  (isMeaningfulValue(question.question_type) ? normalizeText(question.question_type) : '') ||
  question.subCategory ||
  question.category ||
  '综合'

export const getQuestionKnowledgeSegments = (question = {}) => {
  const arrayCandidates = [
    question.knowledgeLevels,
    question.knowledgePath,
    question.knowledgeTree,
    question.knowledge,
    [
      question.knowledgeLevel1,
      question.knowledgeLevel2,
      question.knowledgeLevel3,
      question.knowledgeLevel4,
      question.knowledgeLevel5,
    ],
  ]

  for (let index = 0; index < arrayCandidates.length; index += 1) {
    const normalized = normalizeKnowledgeCandidate(arrayCandidates[index])
    if (normalized.length) {
      return normalized
    }
  }

  const stringCandidates = [
    question.knowledgePoint,
    question.knowledge_path,
    question.examPoint,
    question.exam_point,
  ]

  for (let index = 0; index < stringCandidates.length; index += 1) {
    const normalized = normalizeKnowledgeCandidate(stringCandidates[index])
    if (normalized.length) {
      return normalized
    }
  }

  return compactKnowledgeSegments([
    question.category,
    question.subCategory,
    isMeaningfulValue(question.section) ? question.section : '',
    isMeaningfulValue(question.question_type) ? question.question_type : '',
  ])
}

export const getQuestionKnowledgePath = (question = {}) =>
  getQuestionKnowledgeSegments(question).join(' > ')

export const getKnowledgeLeafName = (value = '') => {
  const segments =
    typeof value === 'object' && value
      ? getQuestionKnowledgeSegments(value)
      : splitKnowledgePath(value)

  return segments[segments.length - 1] || ''
}

export const normalizeOption = (option = {}, index = 0) => {
  const id = normalizeText(
    option.id || option.key || option.label || option.option || buildOptionId(index),
  )
  const text = normalizeRichText(
    option.text || option.value || option.content || option.optionContent || '',
  )

  return {
    ...option,
    id,
    key: option.key || id,
    label: option.label || id,
    text,
    value: option.value || text,
    content: text,
    image: option.image || option.img || option.optionImage || '',
  }
}

export const normalizeQuestionOptions = (options = []) =>
  Array.isArray(options)
    ? options.map((option, index) => normalizeOption(option, index))
    : []

export const normalizeQuestionRecord = (question = {}, index = 0) => {
  const id =
    normalizeText(question.id || question.questionId || question.question_id) ||
    `question-${index + 1}`
  const typeLabel = normalizeQuestionTypeLabel(question)
  const difficultyMeta = normalizeDifficultyMeta(question)
  const questionScore = normalizeQuestionScore(question)
  const source = normalizeQuestionSource(question)
  const year = normalizeQuestionYear(question)
  const knowledgeSegments = getQuestionKnowledgeSegments(question)
  const knowledgePath = knowledgeSegments.join(' > ')
  const stem = normalizeRichText(
    question.stem || question.content || question.question_content || '',
  )
  const analysisText = normalizeRichText(
    question.explanation || question.analysis || question.question_parse || '',
  )
  const material = normalizeRichText(question.material || question.material_content || '')
  const rawCorrectAnswer =
    question.correctAnswer !== undefined
      ? question.correctAnswer
      : question.answer !== undefined
        ? question.answer
        : question.correct_answer

  return {
    ...question,
    id,
    questionId: question.questionId || question.question_id || id,
    questionIndex:
      Number(question.questionIndex ?? question.question_index ?? index + 1) || index + 1,
    type: typeLabel,
    typeLabel,
    rawType:
      normalizeText(
        question.rawType || question.type || question.typeId || question.type_id || '',
      ) || typeLabel,
    stem,
    content: normalizeRichText(question.content || question.stem || question.question_content || stem),
    answer: rawCorrectAnswer,
    correctAnswer: rawCorrectAnswer,
    analysis: analysisText,
    explanation: analysisText,
    category: normalizeText(question.category),
    subCategory: normalizeText(question.subCategory),
    section: getQuestionSectionName(question),
    difficulty: difficultyMeta.value,
    difficultyLabel: difficultyMeta.label,
    difficultyLevel: difficultyMeta.level,
    questionScore,
    questionScoreText: questionScore === null ? '' : `${questionScore}分`,
    score: question.score !== undefined ? question.score : questionScore,
    source,
    year,
    knowledgePoint: knowledgePath,
    knowledgePath,
    knowledgeSegments,
    knowledgeLevels: knowledgeSegments,
    knowledge: knowledgeSegments,
    material,
    materialTitle: normalizeText(question.materialTitle || question.material_title || ''),
    materialPreview: normalizeRichText(
      question.materialPreview || question.material_preview || '',
    ),
    materialImage: question.materialImage || question.material_image || '',
    questionImage: question.questionImage || question.question_image || question.image || '',
    options: normalizeQuestionOptions(question.options || question.question_options || []),
    sourcePaper: normalizeText(question.sourcePaper || question.question_source || source),
    examType: normalizeText(question.examType || question.exam_type || ''),
    examSubtype: normalizeText(question.examSubtype || question.exam_subtype || ''),
    questionType: normalizeText(question.questionType || question.question_type || ''),
  }
}
