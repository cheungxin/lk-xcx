/**
 * Mock数据 - 用户数据
 */
const { images } = require('../assets/index')

export const USER_DATA = {
  userId: 'u001',
  nickname: '考公人',
  avatar: images.defaultAvatar,
  phone: '138****8000',
  examType: '国考',
  studyDays: 30,
  totalQuestions: 1500,
  correctCount: 980,
  accuracy: 65.3,
  streakDays: 7,
  rank: 1234,
  vipLevel: 0,
  memberUntil: null
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return USER_DATA
}

/**
 * 获取学习统计数据
 */
export function getStudyStatistics() {
  return {
    todayQuestions: 25,
    todayCorrect: 18,
    todayAccuracy: 72.0,
    weekQuestions: 156,
    weekCorrect: 108,
    weekAccuracy: 69.2,
    monthQuestions: 580,
    monthCorrect: 380,
    monthAccuracy: 65.5,
    totalQuestions: 1500,
    totalCorrect: 980,
    totalAccuracy: 65.3
  }
}

/**
 * 获取学习进度
 */
export function getStudyProgress() {
  return {
    dailyGoal: 50,
    completedToday: 25,
    currentStreak: 7,
    longestStreak: 15,
    totalDays: 30
  }
}

/**
 * 获取勋章列表
 */
export function getBadges() {
  return [
    { id: 'newbie', name: '初出茅庐', icon: '/assets/images/badge-newbie.png', unlocked: true },
    { id: 'persistent', name: '坚持不懈', icon: '/assets/images/badge-persistent.png', unlocked: true },
    { id: 'genius', name: '天才之路', icon: '/assets/images/badge-genius.png', unlocked: false },
    { id: 'master', name: '刷题大师', icon: '/assets/images/badge-master.png', unlocked: false }
  ]
}
