/**
 * 路由管理器
 * 提供统一的页面跳转和路径映射能力。
 */

const ROUTES = {
  INDEX: '/pages/index/index',
  PROFILE: '/pages/profile/profile',
  LOGIN: '/pages/login/login',

  // Tab pages
  EXAM_TAB: '/pages/exam-tab/exam-tab',
  QUICK_TAB: '/pages/quick-tab/quick-tab',
  MEMORIZE: '/pages/memorize/memorize',

  // training
  EXAM: '/subpackages/training/exam/exam',
  QUICK: '/subpackages/training/quick/quick',
  PRACTICE: '/subpackages/training/practice/practice',
  ANSWER_CARD: '/subpackages/training/answer-card/answer-card',
  ANALYSIS: '/subpackages/training/analysis/analysis',
  MATH: '/subpackages/training/math/math',
  DAILY: '/subpackages/training/daily/daily',
  EXAM_REPORT: '/subpackages/training/exam-report/exam-report',
  QUESTION_DETAIL: '/subpackages/training/question-detail/question-detail',
  SHENLUN: '/subpackages/training/shenlun/shenlun',
  SHENLUN_RESULT: '/subpackages/training/shenlun-result/shenlun-result',
  DAILY_SHENLUN: '/subpackages/training/daily-shenlun/daily-shenlun',
  HOTSPOT: '/subpackages/training/hotspot/hotspot',
  EXPRESSION: '/subpackages/training/expression/expression',

  // my
  REVIEW: '/subpackages/my/review/review',
  STATS: '/subpackages/my/stats/stats',
  FAVORITE: '/subpackages/my/favorite/favorite',
  WRONG: '/subpackages/my/wrong/wrong',
  WRONG_LIST: '/subpackages/my/wrong-list/wrong-list',
  FAVORITE_LIST: '/subpackages/my/favorite-list/favorite-list',
  RECORD: '/subpackages/my/record/record',
  SETTINGS: '/subpackages/my/settings/settings',

  // course
  LIST: '/subpackages/course/list/list',
  DETAIL: '/subpackages/course/detail/detail',
  PLAY: '/subpackages/course/play/play',

  // community
  COMMUNITY_INDEX: '/subpackages/community/index/index',
  COMMUNITY_DETAIL: '/subpackages/community/detail/detail',
  COMMUNITY_PUBLISH: '/subpackages/community/publish/publish',
}

class RouterManager {
  constructor() {
    this.routes = ROUTES
  }

  buildUrl(path, params = {}) {
    const actualPath = this.routes[path] || path
    const keys = Object.keys(params)
    if (!keys.length) {
      return actualPath
    }

    const query = keys
      .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    return query ? `${actualPath}?${query}` : actualPath
  }

  push(path, params = {}, events = {}) {
    return new Promise((resolve, reject) => {
      wx.navigateTo({
        url: this.buildUrl(path, params),
        events,
        success: resolve,
        fail: (err) => {
          console.error('navigateTo failed:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none',
          })
          reject(err)
        },
      })
    })
  }

  redirect(path, params = {}, events = {}) {
    return new Promise((resolve, reject) => {
      wx.redirectTo({
        url: this.buildUrl(path, params),
        events,
        success: resolve,
        fail: (err) => {
          console.error('redirectTo failed:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none',
          })
          reject(err)
        },
      })
    })
  }

  switchTab(path) {
    return new Promise((resolve, reject) => {
      const actualPath = this.routes[path] || path
      wx.switchTab({
        url: actualPath,
        success: resolve,
        fail: (err) => {
          console.error('switchTab failed:', err)
          wx.showToast({
            title: 'Tab 切换失败',
            icon: 'none',
          })
          reject(err)
        },
      })
    })
  }

  reLaunch(path, params = {}) {
    return new Promise((resolve, reject) => {
      wx.reLaunch({
        url: this.buildUrl(path, params),
        success: resolve,
        fail: (err) => {
          console.error('reLaunch failed:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none',
          })
          reject(err)
        },
      })
    })
  }

  back(delta = 1) {
    return new Promise((resolve, reject) => {
      const pages = getCurrentPages()
      if (pages.length <= 1) {
        this.switchTab('INDEX').then(resolve).catch(reject)
        return
      }

      wx.navigateBack({
        delta,
        success: resolve,
        fail: (err) => {
          console.error('navigateBack failed:', err)
          // 降级策略
          this.switchTab('INDEX').then(resolve).catch(reject)
        },
      })
    })
  }

  getCurrentRoute() {
    const pages = getCurrentPages()
    if (!pages.length) {
      return ''
    }
    return `/${pages[pages.length - 1].route}`
  }

  getPageStackDepth() {
    return getCurrentPages().length
  }
}

const router = new RouterManager()

export { ROUTES }
export default router
