/**
 * 设置页 - 应用设置与个人信息管理
 */

const tool = require('../../../toolbox/tool')

Page({
  data: {
    navBarHeight: 88,

    // 用户信息
    isLogin: false,
    userInfo: {
      nickName: '考生用户',
      avatarUrl: '',
      phone: '',
    },

    // 设置项
    settings: {
      // 答题设置
      autoShowAnalysis: true,       // 答题后自动显示解析
      autoNextQuestion: false,      // 自动跳转下一题
      vibrationFeedback: true,      // 答题震动反馈
      fontSize: 'standard',         // 字体大小: small, standard, large
      fontSizeLabel: '标准',
      questionCount: 20,            // 默认每轮题数

      // 通知设置
      dailyReminder: true,          // 每日刷题提醒
      reminderTime: '09:00',        // 提醒时间

      // 其他设置
      nightMode: false,             // 夜间模式
      autoPlay: false,              // 视频自动播放
      wifiOnly: true,               // 仅WiFi下载
      clearCache: '12.5MB',         // 缓存大小
    },

    // 字体大小选项
    fontSizeOptions: [
      { id: 'small', label: '小' },
      { id: 'standard', label: '标准' },
      { id: 'large', label: '大' },
    ],

    showFontSizePicker: false,
    showClearCacheConfirm: false,
    showLogoutConfirm: false,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    this.setData({ navBarHeight: statusBarHeight + 44 })

    // 加载本地设置
    this.loadSettings()
    this.loadUserInfo()
  },

  loadUserInfo() {
    const isLogin = wx.getStorageSync('isLogin') || false
    const userInfo = wx.getStorageSync('userInfo') || {}
    const studentInfos = wx.getStorageSync('studentInfos') || {}
    this.setData({
      isLogin,
      userInfo: {
        nickName: studentInfos.userName || userInfo.nickname || '考生用户',
        avatarUrl: (studentInfos.userAvatar || userInfo.avatarUrl || '').replace(/^\/miniprogram/, ''),
        phone: studentInfos.phone || userInfo.phone || '',
      },
    })
  },

  loadSettings() {
    const saved = wx.getStorageSync('appSettings')
    if (saved) {
      this.setData({ settings: { ...this.data.settings, ...saved } })
    }
  },

  saveSettings() {
    wx.setStorageSync('appSettings', this.data.settings)
  },

  // ============ 开关类设置 ============

  handleSwitchChange(e) {
    const { key } = e.currentTarget.dataset
    const value = e.detail.value
    this.setData({ [`settings.${key}`]: value })
    this.saveSettings()
  },

  // ============ 字体大小 ============

  handleShowFontSize() {
    this.setData({ showFontSizePicker: true })
  },

  handleFontSizeChange(e) {
    const { index } = e.currentTarget.dataset
    const option = this.data.fontSizeOptions[index]
    this.setData({
      'settings.fontSize': option.id,
      'settings.fontSizeLabel': option.label,
      showFontSizePicker: false,
    })
    this.saveSettings()
  },

  handleCloseFontSizePicker() {
    this.setData({ showFontSizePicker: false })
  },

  handleFontSizePickerChange(e) {
    this.setData({ showFontSizePicker: e.detail.visible })
  },

  // ============ 每日提醒 ============

  handleReminderTime() {
    const { reminderTime } = this.data.settings
    // 提示用户去系统设置
    tool.toast(`提醒时间已设为 ${reminderTime}`)
  },

  // ============ 清除缓存 ============

  handleClearCache() {
    this.setData({ showClearCacheConfirm: true })
  },

  handleCloseClearCache() {
    this.setData({ showClearCacheConfirm: false })
  },

  handleClearCacheConfirmChange(e) {
    this.setData({ showClearCacheConfirm: e.detail.visible })
  },

  handleConfirmClearCache() {
    wx.showLoading({ title: '清理中...' })
    setTimeout(() => {
      wx.hideLoading()
      this.setData({
        'settings.clearCache': '0MB',
        showClearCacheConfirm: false,
      })
      tool.toast('缓存已清理')
    }, 1000)
  },

  // ============ 退出登录 ============

  handleLogout() {
    this.setData({ showLogoutConfirm: true })
  },

  handleCloseLogout() {
    this.setData({ showLogoutConfirm: false })
  },

  handleLogoutConfirmChange(e) {
    this.setData({ showLogoutConfirm: e.detail.visible })
  },

  handleConfirmLogout() {
    wx.removeStorageSync('isLogin')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('studentInfos')
    this.setData({
      isLogin: false,
      showLogoutConfirm: false,
      userInfo: { nickName: '考生用户', avatarUrl: '', phone: '' },
    })
    tool.toast('已退出登录')
  },

  // ============ 其他 ============

  handleAbout() {
    wx.showModal({
      title: '关于我们',
      content: '公考刷题小程序 v1.0.0\n\n专业公考备考助手\n涵盖行测、公基等科目\n\n© 2024 All Rights Reserved',
      showCancel: false,
    })
  },

  handleHelp() {
    tool.toast('帮助与反馈')
  },

  handleBack() {
    wx.navigateBack({ delta: 1 })
  },

  onShareAppMessage() {
    return {
      title: '公考刷题小程序',
      path: '/pages/index/index',
    }
  },
})
