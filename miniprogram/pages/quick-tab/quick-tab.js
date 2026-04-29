/**
 * 快练Tab页 - 入口页面
 * 提供快捷刷题入口和最近练习记录，跳转到 training 分包的快练页面
 */

const router = require('../../router/index')
const tool = require('../../toolbox/tool')

Page({
  data: {
    safeTop: 0,
    tabBarHeight: 124,
    // 科目分类
    categories: [
      { id: 'all', name: '全部', icon: 'apps', bgColor: '#EEF2FF', iconColor: '#4B74FF', count: 520 },
      { id: 'verbal', name: '言语理解', icon: 'chat', bgColor: '#FFF7E6', iconColor: '#ED7B2F', count: 128 },
      { id: 'math', name: '数量关系', icon: 'calculator', bgColor: '#F0FFF4', iconColor: '#00A870', count: 96 },
      { id: 'logic', name: '判断推理', icon: 'analysis', bgColor: '#FFF0F0', iconColor: '#E34D59', count: 108 },
      { id: 'data', name: '资料分析', icon: 'chart', bgColor: '#F3E8FF', iconColor: '#8B5CF6', count: 88 },
      { id: 'common', name: '常识判断', icon: 'lightbulb', bgColor: '#E0F7FF', iconColor: '#0891B2', count: 100 },
    ],
    // 题数选项
    countOptions: [5, 10, 15, 20],
    selectedCount: 10,
    // 最近练习
    recentList: [
      { id: 'r1', title: '言语理解专项', count: 10, correct: 8, time: '3分钟前', accuracy: '80%' },
      { id: 'r2', title: '数量关系快练', count: 10, correct: 5, time: '1小时前', accuracy: '50%' },
      { id: 'r3', title: '判断推理随机', count: 15, correct: 12, time: '昨天', accuracy: '80%' },
    ],
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

  // 选择题数
  onCountTap(e) {
    const { count } = e.currentTarget.dataset
    this.setData({ selectedCount: count })
    wx.vibrateShort({ type: 'light' })
  },

  // 选择科目开始快练
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    router.push('QUICK', { category: id, count: this.data.selectedCount })
  },

  // 开始全部快练
  onStartAll() {
    router.push('QUICK', { category: 'all', count: this.data.selectedCount })
  },

  // 继续上次练习
  onRecentTap(e) {
    const { id } = e.currentTarget.dataset
    router.push('QUICK', { mode: 'continue', id })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
})
