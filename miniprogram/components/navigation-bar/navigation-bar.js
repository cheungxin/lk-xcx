/**
 * Skyline 兼容的自定义导航栏。
 */
Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true,
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    background: {
      type: String,
      value: '#ffffff',
    },
    color: {
      type: String,
      value: '#111827',
    },
    showBack: {
      type: Boolean,
      value: true,
    },
    showHome: {
      type: Boolean,
      value: false,
    },
    customRight: {
      type: Boolean,
      value: false,
    },
    delta: {
      type: Number,
      value: 1,
    },
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    totalHeight: 64,
  },

  lifetimes: {
    attached() {
      this.initNavigationBar()
    },
  },

  methods: {
    initNavigationBar() {
      try {
        const app = getApp()
        const { statusBarHeight, titleBarHeight, navigationBarHeight } = app.globalData

        if (statusBarHeight && navigationBarHeight) {
          this.setData({
            statusBarHeight,
            navBarHeight: titleBarHeight || 44,
            totalHeight: navigationBarHeight,
          })
          return
        }

        const info = wx.getWindowInfo()
        const capsule = wx.getMenuButtonBoundingClientRect()
        const sHeight = info.statusBarHeight || 0
        const tHeight = (capsule.bottom + capsule.top) - (sHeight * 2)

        this.setData({
          statusBarHeight: sHeight,
          navBarHeight: tHeight,
          totalHeight: sHeight + tHeight,
        })
      } catch (error) {
        console.error('init navigation bar failed:', error)
      }
    },

    handleBack() {
      this.triggerEvent('back', { delta: this.data.delta })
      wx.navigateBack({
        delta: this.data.delta,
        fail: () => {
          wx.switchTab({
            url: '/pages/index/index',
          })
        },
      })
    },

    handleHome() {
      this.triggerEvent('home')
      wx.switchTab({
        url: '/pages/index/index',
        fail: () => {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        },
      })
    },

    handleRightClick() {
      this.triggerEvent('rightclick')
    },
  },
})
