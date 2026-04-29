Component({
  properties: {
    selected: {
      type: Number,
      value: 0,
    },
  },

  data: {
    safeBottom: 0,
    tabs: [
      {
        index: 0,
        text: '首页',
        icon: 'home',
        activeIcon: 'home',
        pagePath: '/pages/index/index',
      },
      {
        index: 1,
        text: '估分',
        icon: 'edit-1',
        activeIcon: 'edit-1',
        pagePath: '/pages/exam-tab/exam-tab',
      },
      {
        index: 2,
        text: '快练',
        icon: 'flash',
        activeIcon: 'flash',
        pagePath: '/pages/quick-tab/quick-tab',
      },
      {
        index: 3,
        text: '背诵',
        icon: 'bookmark',
        activeIcon: 'bookmark',
        pagePath: '/pages/memorize/memorize',
      },
      {
        index: 4,
        text: '我的',
        icon: 'user',
        activeIcon: 'user-filled',
        pagePath: '/pages/profile/profile',
      },
    ],
  },

  lifetimes: {
    attached() {
      const app = getApp()
      const { windowInfo } = app.globalData
      // 计算安全区底部间距，如果 windowInfo 不存在则尝试重新获取
      const info = windowInfo || wx.getWindowInfo()
      const safeBottom = info.screenHeight - info.safeArea.bottom
      
      this.setData({
        safeBottom: safeBottom > 0 ? safeBottom : 0,
      })
    },
  },

  methods: {
    onTabChange(e) {
      const index = Number(e.currentTarget.dataset.index)
      if (index === this.data.selected) {
        return
      }

      const target = this.data.tabs.find((item) => item.index === index)
      if (!target) {
        console.warn('Tab item not found for index:', index)
        return
      }

      wx.switchTab({
        url: target.pagePath,
        fail: (err) => {
          console.error('Tab 切换失败:', err)
        },
      })
    },
  },
})
