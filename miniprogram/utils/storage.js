/**
 * 存储管理工具
 * 统一管理本地存储操作，并兼容历史键名。
 */

import { normalizeQuestionRecord } from './question-schema'

const STORAGE_KEYS = {
  userInfo: 'userInfo',
  isLogin: 'isLogin',
  practiceCache: 'practice_cache',
  practiceCacheLegacy: 'practiceCache',
  practiceResult: 'practice_result',
  practiceResultLegacy: 'practiceResult',
  practiceResultHistory: 'practice_result_history',
  examResult: 'exam_result',
  examResultLegacy: 'examReport',
  examResultHistory: 'exam_result_history',
  examResultHistoryLegacy: 'examReportHistory',
  dailyRecords: 'daily_records',
  dailyCheckInLegacy: 'dailyCheckIn',
  practiceRecords: 'practice_records',
  practiceRecordsLegacy: 'practiceRecords',
  wrongQuestions: 'wrong_questions',
  wrongQuestionsLegacy: 'wrongQuestions',
  favoriteQuestions: 'favorite_questions',
  favoriteQuestionsLegacy: 'favorites',
  shenlunResult: 'shenlun_result',
  shenlunResultLegacy: 'shenlunAnswer',
  shenlunRecords: 'shenlun_records',
  examType: 'exam_type',
  examTypeLegacy: 'selectedExamType',
  examRegion: 'exam_region',
  examRegionLegacy: 'selectedExamRegion',
  studyRecord: 'studyRecord',
  studyStats: 'study_stats',
  dontShowExamNotice: 'dont_show_exam_notice',
  dontShowExamNoticeLegacy: 'dontShowExamNotice',
  pendingExamConfig: 'pending_exam_config',
  wrongPracticeQueue: 'wrong_practice_queue',
  draftSheetPrefix: 'draft_sheet:',
}

const clone = (value) => {
  if (value === undefined || value === null) {
    return value
  }

  return JSON.parse(JSON.stringify(value))
}

const isValidStorageValue = (value) => value !== undefined && value !== null && value !== ''

const pad = (value) => String(value).padStart(2, '0')

const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const formatTime = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const getWithFallback = (primaryKey, legacyKey, defaultValue) => {
  const primaryValue = wx.getStorageSync(primaryKey)
  if (isValidStorageValue(primaryValue)) {
    return primaryValue
  }

  if (legacyKey) {
    const legacyValue = wx.getStorageSync(legacyKey)
    if (isValidStorageValue(legacyValue)) {
      return legacyValue
    }
  }

  return clone(defaultValue)
}

const setWithFallback = (primaryKey, value, legacyKey) => {
  wx.setStorageSync(primaryKey, value)
  if (legacyKey) {
    wx.setStorageSync(legacyKey, value)
  }
  return value
}

const removeWithFallback = (primaryKey, legacyKey) => {
  wx.removeStorageSync(primaryKey)
  if (legacyKey) {
    wx.removeStorageSync(legacyKey)
  }
}

const normalizeQuestionId = (question = {}) =>
  question.id || question.questionId || question.question_id || ''

const getDraftStorageKey = (sceneKey = '') =>
  `${STORAGE_KEYS.draftSheetPrefix}${String(sceneKey)}`

const normalizeQuestion = (question = {}) => {
  const normalized = normalizeQuestionRecord(question)
  return {
    ...normalized,
    earnedScore: Number(question.earnedScore || 0),
  }
}

const normalizeRecord = (record = {}, prefix = 'r') => {
  const now = new Date()
  return {
    ...record,
    id: record.id || `${prefix}${Date.now()}`,
    date: record.date || formatDate(now),
    time: record.time || formatTime(now),
    createdAt: record.createdAt || now.toISOString(),
  }
}

const dedupeByQuestionId = (list = []) => {
  const seen = new Set()
  return list.filter((item) => {
    const id = normalizeQuestionId(item)
    if (!id || seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

const convertLegacyDailyCheckIn = (legacyValue) => {
  if (!legacyValue || !Array.isArray(legacyValue.history)) {
    return {}
  }

  return legacyValue.history.reduce((result, item) => {
    result[item.date] = {
      date: item.date,
      done: true,
      score: item.score,
      streak: item.streak || 0,
      timestamp: item.timestamp || Date.now(),
    }
    return result
  }, {})
}

export default {
  setUserInfo(data) {
    return setWithFallback(STORAGE_KEYS.userInfo, data)
  },

  getUserInfo() {
    return getWithFallback(STORAGE_KEYS.userInfo, null, null)
  },

  setLoginStatus(status) {
    return setWithFallback(STORAGE_KEYS.isLogin, !!status)
  },

  isLogin() {
    return !!getWithFallback(STORAGE_KEYS.isLogin, null, false)
  },

  setPracticeCache(data) {
    return setWithFallback(
      STORAGE_KEYS.practiceCache,
      data,
      STORAGE_KEYS.practiceCacheLegacy,
    )
  },

  getPracticeCache() {
    return getWithFallback(
      STORAGE_KEYS.practiceCache,
      STORAGE_KEYS.practiceCacheLegacy,
      null,
    )
  },

  clearPracticeCache() {
    removeWithFallback(
      STORAGE_KEYS.practiceCache,
      STORAGE_KEYS.practiceCacheLegacy,
    )
  },

  setDraftSheet(sceneKey, data = {}) {
    if (!sceneKey) {
      return null
    }

    const normalized = {
      sceneKey,
      paths: Array.isArray(data.paths) ? clone(data.paths) : [],
      updatedAt: data.updatedAt || Date.now(),
    }

    wx.setStorageSync(getDraftStorageKey(sceneKey), normalized)
    return normalized
  },

  getDraftSheet(sceneKey) {
    if (!sceneKey) {
      return null
    }

    return getWithFallback(getDraftStorageKey(sceneKey), null, null)
  },

  clearDraftSheet(sceneKey) {
    if (!sceneKey) {
      return
    }

    wx.removeStorageSync(getDraftStorageKey(sceneKey))
  },

  setPracticeResult(data) {
    return setWithFallback(
      STORAGE_KEYS.practiceResult,
      data,
      STORAGE_KEYS.practiceResultLegacy,
    )
  },

  getPracticeResult() {
    return getWithFallback(
      STORAGE_KEYS.practiceResult,
      STORAGE_KEYS.practiceResultLegacy,
      null,
    )
  },

  clearPracticeResult() {
    removeWithFallback(
      STORAGE_KEYS.practiceResult,
      STORAGE_KEYS.practiceResultLegacy,
    )
  },

  appendPracticeResultHistory(result) {
    const list = this.getPracticeResultHistory()
    const normalized = normalizeRecord(result, 'pr')
    list.unshift(normalized)
    wx.setStorageSync(
      STORAGE_KEYS.practiceResultHistory,
      list.slice(0, 100),
    )
    return normalized
  },

  getPracticeResultHistory() {
    return getWithFallback(STORAGE_KEYS.practiceResultHistory, null, [])
  },

  getPracticeResultById(id) {
    return this.getPracticeResultHistory().find((item) => item.id === id) || null
  },

  setExamResult(result) {
    return setWithFallback(
      STORAGE_KEYS.examResult,
      result,
      STORAGE_KEYS.examResultLegacy,
    )
  },

  getExamResult() {
    return getWithFallback(
      STORAGE_KEYS.examResult,
      STORAGE_KEYS.examResultLegacy,
      null,
    )
  },

  clearExamResult() {
    removeWithFallback(STORAGE_KEYS.examResult, STORAGE_KEYS.examResultLegacy)
  },

  appendExamResultHistory(result) {
    const list = this.getExamResultHistory()
    const normalized = normalizeRecord(result, 'er')
    list.unshift(normalized)
    setWithFallback(
      STORAGE_KEYS.examResultHistory,
      list.slice(0, 50),
      STORAGE_KEYS.examResultHistoryLegacy,
    )
    return normalized
  },

  getExamResultHistory() {
    return getWithFallback(
      STORAGE_KEYS.examResultHistory,
      STORAGE_KEYS.examResultHistoryLegacy,
      [],
    )
  },

  getExamResultById(id) {
    return this.getExamResultHistory().find((item) => item.id === id) || null
  },

  setExamReport(result) {
    return this.setExamResult(result)
  },

  getExamReport() {
    return this.getExamResult()
  },

  setExamReportHistory(data) {
    return setWithFallback(
      STORAGE_KEYS.examResultHistory,
      data,
      STORAGE_KEYS.examResultHistoryLegacy,
    )
  },

  getExamReportHistory() {
    return this.getExamResultHistory()
  },

  addExamReport(report) {
    return this.appendExamResultHistory(report)
  },

  setDailyRecord(date, result) {
    const targetDate = date || formatDate()
    const records = this.getDailyRecords()
    records[targetDate] = {
      ...result,
      done: true,
      date: targetDate,
      updatedAt: new Date().toISOString(),
    }
    wx.setStorageSync(STORAGE_KEYS.dailyRecords, records)
    return records[targetDate]
  },

  getDailyRecord(date) {
    const records = this.getDailyRecords()
    return records[date] || null
  },

  getDailyRecords() {
    const records = wx.getStorageSync(STORAGE_KEYS.dailyRecords)
    if (isValidStorageValue(records)) {
      return records
    }

    const legacyValue = wx.getStorageSync(STORAGE_KEYS.dailyCheckInLegacy)
    return convertLegacyDailyCheckIn(legacyValue)
  },

  setDailyCheckIn(data) {
    return setWithFallback(
      STORAGE_KEYS.dailyCheckInLegacy,
      data,
      null,
    )
  },

  getDailyCheckIn() {
    const dailyRecords = this.getDailyRecords()
    const history = Object.keys(dailyRecords)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => {
        const item = dailyRecords[date]
        return {
          date,
          score:
            item.score ||
            item.accuracy ||
            item.correctCount ||
            item.correct ||
            0,
          timestamp: item.timestamp || Date.now(),
        }
      })

    return {
      streak: this.calculateStreak(history),
      lastCheckInDate: history[0] ? history[0].date : null,
      history,
    }
  },

  addDailyCheckIn(date, score) {
    const targetDate = date || formatDate()
    const current = this.getDailyRecord(targetDate) || {}
    return this.setDailyRecord(targetDate, {
      ...current,
      done: true,
      score,
      timestamp: Date.now(),
    })
  },

  calculateStreak(history = []) {
    if (!history.length) {
      return 0
    }

    const orderedDates = history
      .map((item) => item.date)
      .sort((a, b) => b.localeCompare(a))
    const today = formatDate()
    const yesterday = formatDate(Date.now() - 24 * 60 * 60 * 1000)

    if (orderedDates[0] !== today && orderedDates[0] !== yesterday) {
      return 0
    }

    let streak = 1
    for (let index = 1; index < orderedDates.length; index += 1) {
      const prevDate = new Date(orderedDates[index - 1])
      const currentDate = new Date(orderedDates[index])
      const diff =
        (prevDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
      if (diff === 1) {
        streak += 1
      } else {
        break
      }
    }
    return streak
  },

  setPracticeRecords(data) {
    return setWithFallback(
      STORAGE_KEYS.practiceRecords,
      data,
      STORAGE_KEYS.practiceRecordsLegacy,
    )
  },

  getPracticeRecords() {
    return getWithFallback(
      STORAGE_KEYS.practiceRecords,
      STORAGE_KEYS.practiceRecordsLegacy,
      [],
    )
  },

  appendRecord(record) {
    const records = this.getPracticeRecords()
    const normalized = normalizeRecord(record, 'r')
    records.unshift(normalized)
    setWithFallback(
      STORAGE_KEYS.practiceRecords,
      records.slice(0, 200),
      STORAGE_KEYS.practiceRecordsLegacy,
    )
    return normalized
  },

  addPracticeRecord(record) {
    return this.appendRecord(record)
  },

  setWrongQuestions(data) {
    const normalized = dedupeByQuestionId(
      Array.isArray(data) ? data.map((item) => normalizeQuestion(item)) : [],
    )
    return setWithFallback(
      STORAGE_KEYS.wrongQuestions,
      normalized,
      STORAGE_KEYS.wrongQuestionsLegacy,
    )
  },

  getWrongQuestions(filters = {}) {
    const list = getWithFallback(
      STORAGE_KEYS.wrongQuestions,
      STORAGE_KEYS.wrongQuestionsLegacy,
      [],
    ).map((item) => normalizeQuestion(item))

    let result = [...list]
    if (filters.category) {
      result = result.filter((item) => item.category === filters.category)
    }
    if (filters.mastered !== undefined) {
      result = result.filter((item) => !!item.mastered === filters.mastered)
    }
    if (filters.practiceType) {
      result = result.filter((item) => item.practiceType === filters.practiceType)
    }
    if (filters.source) {
      result = result.filter((item) => item.source === filters.source)
    }
    return result
  },

  addWrongQuestion(question) {
    const list = this.getWrongQuestions()
    const normalized = normalizeQuestion(question)
    const questionId = normalizeQuestionId(normalized)
    const existingIndex = list.findIndex(
      (item) => normalizeQuestionId(item) === questionId,
    )

    if (existingIndex > -1) {
      const current = list[existingIndex]
      list[existingIndex] = {
        ...current,
        ...normalized,
        errorCount: (current.errorCount || 1) + 1,
        lastErrorAt:
          normalized.addedAt || normalized.lastErrorAt || new Date().toISOString(),
        mastered: false,
      }
    } else {
      list.unshift({
        ...normalized,
        errorCount: normalized.errorCount || 1,
        addedAt: normalized.addedAt || new Date().toISOString(),
        lastErrorAt: normalized.lastErrorAt || normalized.addedAt || new Date().toISOString(),
        mastered: !!normalized.mastered,
      })
    }

    this.setWrongQuestions(list)
    return list[existingIndex > -1 ? existingIndex : 0]
  },

  removeWrongQuestion(questionId) {
    const filtered = this.getWrongQuestions().filter(
      (item) => normalizeQuestionId(item) !== questionId,
    )
    this.setWrongQuestions(filtered)
    return filtered
  },

  markWrongQuestionMastered(questionId) {
    const updated = this.getWrongQuestions().map((item) =>
      normalizeQuestionId(item) === questionId
        ? { ...item, mastered: true }
        : item,
    )
    this.setWrongQuestions(updated)
    return updated
  },

  clearWrongQuestions() {
    removeWithFallback(
      STORAGE_KEYS.wrongQuestions,
      STORAGE_KEYS.wrongQuestionsLegacy,
    )
  },

  setWrongQuestionsByCategory(category, data) {
    const current = this.getWrongQuestions().filter((item) => item.category !== category)
    const merged = current.concat(
      Array.isArray(data)
        ? data.map((item) => ({ ...normalizeQuestion(item), category }))
        : [],
    )
    return this.setWrongQuestions(merged)
  },

  getWrongQuestionsByCategory(category) {
    return this.getWrongQuestions({ category })
  },

  addWrongQuestionWithCategory(question, category) {
    return this.addWrongQuestion({ ...question, category })
  },

  setWrongPracticeQueue(questionIds = []) {
    wx.setStorageSync(STORAGE_KEYS.wrongPracticeQueue, questionIds)
  },

  getWrongPracticeQueue() {
    return getWithFallback(STORAGE_KEYS.wrongPracticeQueue, null, [])
  },

  clearWrongPracticeQueue() {
    wx.removeStorageSync(STORAGE_KEYS.wrongPracticeQueue)
  },

  setFavorites(data) {
    const normalized = dedupeByQuestionId(
      Array.isArray(data) ? data.map((item) => normalizeQuestion(item)) : [],
    )
    return setWithFallback(
      STORAGE_KEYS.favoriteQuestions,
      normalized,
      STORAGE_KEYS.favoriteQuestionsLegacy,
    )
  },

  getFavorites() {
    return this.getFavoriteQuestions()
  },

  addFavorite(question) {
    return this.addFavoriteQuestion(question)
  },

  removeFavorite(questionId) {
    return this.removeFavoriteQuestion(questionId)
  },

  addFavoriteQuestion(question) {
    const normalized = normalizeQuestion(question)
    const questionId = normalizeQuestionId(normalized)
    const list = this.getFavoriteQuestions()

    if (list.some((item) => normalizeQuestionId(item) === questionId)) {
      return list
    }

    const nextList = [
      {
        ...normalized,
        addedAt: normalized.addedAt || new Date().toISOString(),
      },
      ...list,
    ]
    this.setFavorites(nextList)
    return nextList
  },

  removeFavoriteQuestion(questionId) {
    const filtered = this.getFavoriteQuestions().filter(
      (item) => normalizeQuestionId(item) !== questionId,
    )
    this.setFavorites(filtered)
    return filtered
  },

  getFavoriteQuestions() {
    return getWithFallback(
      STORAGE_KEYS.favoriteQuestions,
      STORAGE_KEYS.favoriteQuestionsLegacy,
      [],
    ).map((item) => normalizeQuestion(item))
  },

  isQuestionFavorited(questionId) {
    return this.getFavoriteQuestions().some(
      (item) => normalizeQuestionId(item) === questionId,
    )
  },

  setFavoritesByCategory(category, data) {
    const current = this.getFavoriteQuestions().filter((item) => item.category !== category)
    const merged = current.concat(
      Array.isArray(data)
        ? data.map((item) => ({ ...normalizeQuestion(item), category }))
        : [],
    )
    return this.setFavorites(merged)
  },

  getFavoritesByCategory(category) {
    return this.getFavoriteQuestions().filter((item) => item.category === category)
  },

  addFavoriteWithCategory(question, category) {
    return this.addFavoriteQuestion({ ...question, category })
  },

  removeFavoriteWithCategory(questionId, category) {
    const filtered = this.getFavoriteQuestions().filter(
      (item) =>
        !(
          normalizeQuestionId(item) === questionId &&
          item.category === category
        ),
    )
    this.setFavorites(filtered)
    return filtered
  },

  setShenlunResult(data) {
    return setWithFallback(
      STORAGE_KEYS.shenlunResult,
      data,
      STORAGE_KEYS.shenlunResultLegacy,
    )
  },

  getShenlunResult() {
    return getWithFallback(
      STORAGE_KEYS.shenlunResult,
      STORAGE_KEYS.shenlunResultLegacy,
      null,
    )
  },

  setShenlunAnswer(data) {
    return this.setShenlunResult(data)
  },

  getShenlunAnswer() {
    return this.getShenlunResult()
  },

  setShenlunRecords(data) {
    wx.setStorageSync(STORAGE_KEYS.shenlunRecords, data)
    return data
  },

  getShenlunRecords() {
    return getWithFallback(STORAGE_KEYS.shenlunRecords, null, [])
  },

  addShenlunRecord(record) {
    const records = this.getShenlunRecords()
    const normalized = normalizeRecord(record, 'sr')
    records.unshift(normalized)
    this.setShenlunRecords(records.slice(0, 50))
    return normalized
  },

  setExamType(examType) {
    return setWithFallback(
      STORAGE_KEYS.examType,
      examType,
      STORAGE_KEYS.examTypeLegacy,
    )
  },

  getExamType() {
    return getWithFallback(
      STORAGE_KEYS.examType,
      STORAGE_KEYS.examTypeLegacy,
      '公务员',
    )
  },

  setExamRegion(region) {
    return setWithFallback(
      STORAGE_KEYS.examRegion,
      region,
      STORAGE_KEYS.examRegionLegacy,
    )
  },

  getExamRegion() {
    return getWithFallback(
      STORAGE_KEYS.examRegion,
      STORAGE_KEYS.examRegionLegacy,
      '全国',
    )
  },

  setStudyRecord(data) {
    wx.setStorageSync(STORAGE_KEYS.studyRecord, data)
    return data
  },

  getStudyRecord() {
    return getWithFallback(STORAGE_KEYS.studyRecord, null, {
      totalQuestions: 0,
      correctCount: 0,
      studyDays: 0,
      lastStudyDate: null,
    })
  },

  setStudyStats(data) {
    wx.setStorageSync(STORAGE_KEYS.studyStats, data)
    return data
  },

  getStudyStats() {
    return getWithFallback(STORAGE_KEYS.studyStats, null, {
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      studyDays: 0,
      studyTime: 0,
      categoryStats: {},
      dailyStats: {},
    })
  },

  updateStudyStats(stats) {
    const current = this.getStudyStats()
    return this.setStudyStats({ ...current, ...stats })
  },

  addCategoryStats(category, isCorrect) {
    const stats = this.getStudyStats()
    if (!stats.categoryStats[category]) {
      stats.categoryStats[category] = { total: 0, correct: 0 }
    }

    stats.categoryStats[category].total += 1
    if (isCorrect) {
      stats.categoryStats[category].correct += 1
    }
    return this.setStudyStats(stats)
  },

  addDailyStats(date, count) {
    const stats = this.getStudyStats()
    const targetDate = date || formatDate()
    stats.dailyStats[targetDate] = (stats.dailyStats[targetDate] || 0) + count
    return this.setStudyStats(stats)
  },

  setDontShowExamNotice(status) {
    return setWithFallback(
      STORAGE_KEYS.dontShowExamNotice,
      !!status,
      STORAGE_KEYS.dontShowExamNoticeLegacy,
    )
  },

  getDontShowExamNotice() {
    return !!getWithFallback(
      STORAGE_KEYS.dontShowExamNotice,
      STORAGE_KEYS.dontShowExamNoticeLegacy,
      false,
    )
  },

  setPendingExamConfig(data) {
    wx.setStorageSync(STORAGE_KEYS.pendingExamConfig, data)
    return data
  },

  getPendingExamConfig() {
    return getWithFallback(STORAGE_KEYS.pendingExamConfig, null, null)
  },

  clearAll() {
    wx.clearStorageSync()
  },
}
