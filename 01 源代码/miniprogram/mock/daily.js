/**
 * 每日一练 Mock 数据
 * 按日期稳定生成题目池和历史打卡记录。
 */

import { getAllQuestions } from './questions'

const clone = (value) => JSON.parse(JSON.stringify(value))

const DEFAULT_DATE = '2026-03-26'
const DAILY_COUNT = 5
const CATEGORY_ORDER = [
  '政治理论',
  '常识判断',
  '言语理解与表达',
  '数量关系',
  '判断推理',
  '资料分析',
]

const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createRecentDates = (startDate, count) => {
  const dates = []
  const baseDate = new Date(startDate)
  for (let index = 0; index < count; index += 1) {
    const current = new Date(baseDate)
    current.setDate(baseDate.getDate() - index)
    dates.push(formatDate(current))
  }
  return dates
}

const createSeed = (date) =>
  date
    .replace(/-/g, '')
    .split('')
    .reduce((total, value) => total + Number(value), 0)

const buildDailyQuestion = (question, date, index) => {
  const suffix = date.replace(/-/g, '')
  const questionId = `dq-${suffix}-${index + 1}`
  return {
    ...question,
    id: questionId,
    questionId,
    type: question.type === 'single' ? '单选题' : question.type,
    source: '每日一练',
  }
}

const groupByCategory = () => {
  const map = {}
  getAllQuestions().forEach((question) => {
    if (!map[question.category]) {
      map[question.category] = []
    }
    map[question.category].push(question)
  })
  return map
}

const CATEGORY_MAP = groupByCategory()

const buildQuestionsForDate = (date) => {
  const seed = createSeed(date)
  const categoryCount = CATEGORY_ORDER.length
  const result = []

  for (let index = 0; index < DAILY_COUNT; index += 1) {
    const category = CATEGORY_ORDER[(seed + index) % categoryCount]
    const questionPool = CATEGORY_MAP[category] || getAllQuestions()
    const question = questionPool[(seed + index * 2) % questionPool.length]
    result.push(buildDailyQuestion(question, date, index))
  }

  return result
}

const DAILY_DATES = createRecentDates(DEFAULT_DATE, 30)

const DAILY_QUESTION_POOL = DAILY_DATES.reduce((result, date) => {
  result[date] = buildQuestionsForDate(date)
  return result
}, {})

const DAILY_RECORDS_MOCK = DAILY_DATES.reduce((result, date, index) => {
  const questionIds = (DAILY_QUESTION_POOL[date] || []).map((item) => item.id)
  const done = index !== 0 && index % 4 !== 0
  if (done) {
    const correct = 2 + ((index + 3) % DAILY_COUNT)
    result[date] = {
      date,
      done: true,
      correct,
      total: DAILY_COUNT,
      accuracy: Number(((correct / DAILY_COUNT) * 100).toFixed(1)),
      duration: `${6 + (index % 6)}分钟`,
      questionIds,
    }
  } else {
    result[date] = {
      date,
      done: false,
      questionIds,
    }
  }
  return result
}, {})

export function getDailyRecord(date = DEFAULT_DATE) {
  return clone(DAILY_RECORDS_MOCK[date] || null)
}

export function getDailyQuestions(date = DEFAULT_DATE) {
  return clone(DAILY_QUESTION_POOL[date] || DAILY_QUESTION_POOL[DEFAULT_DATE] || [])
}

export function saveDailyRecord(date = DEFAULT_DATE, result = {}) {
  const questionIds = getDailyQuestions(date).map((item) => item.id)
  DAILY_RECORDS_MOCK[date] = {
    ...DAILY_RECORDS_MOCK[date],
    ...result,
    date,
    done: true,
    questionIds,
  }
  return clone(DAILY_RECORDS_MOCK[date])
}

export function getDailyRecordsMock() {
  return clone(DAILY_RECORDS_MOCK)
}

export function hasDailyQuestions(date = DEFAULT_DATE) {
  return !!(DAILY_QUESTION_POOL[date] && DAILY_QUESTION_POOL[date].length)
}
