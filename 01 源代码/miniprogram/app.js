/**
 * app.js - 刷题小程序入口
 */

App({
  onLaunch() {
    this.getSystemInfo()
    this.checkLoginStatus()
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    const windowInfo = wx.getWindowInfo()
    const capsule = wx.getMenuButtonBoundingClientRect()

    const statusBarHeight = windowInfo.statusBarHeight
    const titleBarHeight = (capsule.bottom + capsule.top) - (statusBarHeight * 2)
    const navigationBarHeight = statusBarHeight + titleBarHeight

    this.globalData.windowInfo = windowInfo
    this.globalData.statusBarHeight = statusBarHeight
    this.globalData.titleBarHeight = titleBarHeight
    this.globalData.navigationBarHeight = navigationBarHeight
    this.globalData.capsule = capsule
    this.globalData.screenWidth = windowInfo.screenWidth
    this.globalData.screenHeight = windowInfo.screenHeight
    this.globalData.clientHeight = windowInfo.windowHeight
    this.globalData.clientWidth = windowInfo.windowWidth
    this.globalData.safeArea = windowInfo.safeArea
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLogin = wx.getStorageSync('isLogin') || false
    this.globalData.isLogin = isLogin
  },

  globalData: {
    isLogin: false,
    windowInfo: null,
    statusBarHeight: 0,
    titleBarHeight: 0,
    navigationBarHeight: 0,
    capsule: null,
    screenWidth: 0,
    screenHeight: 0,
    clientHeight: 0,
    clientWidth: 0,
    safeArea: null,
  }
})
