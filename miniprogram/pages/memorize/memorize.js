/**
 * 背诵Tab页 - 知识点背诵与记忆入口
 * 提供知识点分类浏览、背诵卡片模式、记忆曲线复习
 */

const router = require('../../router/index')
const tool = require('../../toolbox/tool')

Page({
  data: {
    safeTop: 0,
    tabBarHeight: 124,
    // 背诵分类
    categories: [
      { id: 'politics', name: '政治理论', icon: 'flag', bgColor: '#FF6B6B', iconColor: '#FFF', desc: '马哲、毛概、中特', count: 86 },
      { id: 'law', name: '法律常识', icon: 'gavel', bgColor: '#4B74FF', iconColor: '#FFF', desc: '宪法、民法、刑法', count: 64 },
      { id: 'economy', name: '经济知识', icon: 'trending-up', bgColor: '#00A870', iconColor: '#FFF', desc: '微观、宏观经济学', count: 52 },
      { id: 'history', name: '历史人文', icon: 'book', bgColor: '#8B5CF6', iconColor: '#FFF', desc: '中国古代史、近现代史', count: 78 },
      { id: 'geography', name: '地理常识', icon: 'map', bgColor: '#0891B2', iconColor: '#FFF', desc: '自然地理、人文地理', count: 45 },
      { id: 'science', name: '科技常识', icon: 'bulletpoint', bgColor: '#ED7B2F', iconColor: '#FFF', desc: '前沿科技、基础科学', count: 38 },
    ],
    // 今日背诵进度
    todayProgress: {
      total: 20,
      completed: 8,
    },
    // 记忆统计
    memoryStats: {
      mastered: 156,
      learning: 42,
      new: 68,
    },
  },

  onLoad() {
    const app = getApp()
    const systemInfo = app.globalData.systemInfo || wx.getSystemInfoSync()
    const safeBottom = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom || 0 : 0
    this.setData({
      safeTop: systemInfo.statusBarHeight || 0,
      tabBarHeight: 116 + safeBottom * 2,
    })
  },

  // 进入背诵分类
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    router.push('REVIEW', { category: id })
  },

  // 开始今日背诵
  onStartMemorize() {
    router.push('REVIEW', { mode: 'today' })
  },

  // 复习待巩固
  onReviewTap() {
    router.push('REVIEW', { mode: 'review' })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },
})
