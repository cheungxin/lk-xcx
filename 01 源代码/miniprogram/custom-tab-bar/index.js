/**
 * custom-tab-bar 代理组件
 * 微信小程序 custom: true 的 tabBar 会自动查找此目录
 * 实际逻辑由 components/tabbar/tabbar 实现
 */
Component({
  data: {
    selected: 0,
  },
  pageLifetimes: {
    show() {
      this.setCurrentTab()
    },
  },
  methods: {
    setCurrentTab() {
      const pages = getCurrentPages()
      if (!pages.length) return
      const currentPage = pages[pages.length - 1]
      const path = '/' + currentPage.route
      const tabMap = {
        '/pages/index/index': 0,
        '/pages/exam-tab/exam-tab': 1,
        '/pages/quick-tab/quick-tab': 2,
        '/pages/memorize/memorize': 3,
        '/pages/profile/profile': 4,
      }
      const selected = tabMap[path] !== undefined ? tabMap[path] : 0
      if (this.data.selected !== selected) {
        this.setData({ selected })
      }
    },
  },
})
