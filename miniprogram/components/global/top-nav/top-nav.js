/**
 * 全局组件 - 顶部导航栏
 * 可配置：标题、返回按钮、右侧操作区、考试类型切换等
 */
Component({
  properties: {
    // 标题
    title: {
      type: String,
      value: '',
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true,
    },
    // 背景色
    bgColor: {
      type: String,
      value: '#1664FF',
    },
    // 文字颜色
    textColor: {
      type: String,
      value: '#FFFFFF',
    },
    // 是否透明背景
    transparent: {
      type: Boolean,
      value: false,
    },
    // 是否沉浸式（随滚动变化透明度）
    immersive: {
      type: Boolean,
      value: false,
    },
    // 右侧操作文字
    actionText: {
      type: String,
      value: '',
    },
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    totalHeight: 88,
    opacity: 0,
  },

  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      let navBarHeight = 44
      try {
        const menuButton = wx.getMenuButtonBoundingClientRect()
        if (menuButton && menuButton.height) {
          navBarHeight = menuButton.height
        }
      } catch (e) {}
      this.setData({
        statusBarHeight,
        navBarHeight,
        totalHeight: statusBarHeight + navBarHeight,
      })
    },
  },

  methods: {
    onBack() {
      this.triggerEvent('back')
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({ url: '/pages/index/index' })
        },
      })
    },

    onAction() {
      this.triggerEvent('action')
    },
  },
})
