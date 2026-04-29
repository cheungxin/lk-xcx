const tool = require('../../toolbox/tool')
const { images } = require('../../assets/index')
const app = getApp()

const { navigationBarHeight = 0 } = app.globalData || {}
const STATS_PAGE_PATH = '/subpackages/my/stats/stats'
const MENU_NAVIGATION_MAP = {
  record: '/subpackages/my/record/record',
  wrong: '/subpackages/my/wrong/wrong',
  favorite: '/subpackages/my/favorite/favorite',
  report: '/subpackages/my/review/review',
  calendar: STATS_PAGE_PATH,
  settings: '/subpackages/my/settings/settings',
}
const BASE_LEARNING_MENU_LIST = [
  {
    type: 'record',
    title: '练习记录',
    description: '查看历史练习情况',
    icon: 'file-copy',
    iconBg: '#EEF3FF',
    iconColor: '#4B74FF',
    badge: 0,
  },
  {
    type: 'wrong',
    title: '错题本',
    description: '收藏的错题汇总',
    icon: 'error-circle',
    iconBg: '#FFF5F5',
    iconColor: '#FF6B6B',
    badge: 23,
  },
  {
    type: 'favorite',
    title: '收藏夹',
    description: '收藏的题目',
    icon: 'heart',
    iconBg: '#FFF8E6',
    iconColor: '#FFB020',
    badge: 8,
  },
  {
    type: 'report',
    title: '刷题报告',
    description: '分析学习数据',
    icon: 'chart-bar',
    iconBg: '#F0FFF0',
    iconColor: '#52C41A',
    badge: 0,
  },
  {
    type: 'calendar',
    title: '刷题日历',
    description: '记录每日学习',
    icon: 'calendar',
    iconBg: '#F5F5FF',
    iconColor: '#722ED1',
    badge: 0,
  },
]
const OTHER_MENU_LIST = [
  {
    type: 'settings',
    title: '设置',
    icon: 'setting',
    iconBg: '#F5F5F5',
    iconColor: '#8C8C8C',
  },
  {
    type: 'help',
    title: '帮助与反馈',
    icon: 'help',
    iconBg: '#E6F7FF',
    iconColor: '#1890FF',
  },
  {
    type: 'about',
    title: '关于我们',
    icon: 'info-circle',
    iconBg: '#FFF1F0',
    iconColor: '#FA541C',
  },
]

function createDefaultUserInfo() {
  return {
    nickName: '点击登录',
    avatarUrl: images.defaultAvatar,
    desc: '登录后查看更多学习数据',
    isVip: false,
  }
}

function createDefaultStats() {
  return {
    totalQuestions: 0,
    correctRate: '0%',
    continueDays: 0,
  }
}

function createLearningMenuList() {
  return BASE_LEARNING_MENU_LIST.map((item) => ({ ...item }))
}

Page({
  data: {
    navigationBarHeight,
    showNavbar: false,
    showFeedbackDialog: false,
    feedbackType: 'online',
    feedbackContent: '',
    feedbackImages: [],
    isLogin: false,
    userInfo: createDefaultUserInfo(),
    stats: createDefaultStats(),
    learningMenuList: createLearningMenuList(),
    otherMenuList: OTHER_MENU_LIST,
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    this.loadUserData()
  },

  loadUserData() {
    const isLogin = wx.getStorageSync('isLogin')

    if (!isLogin) {
      this.setData({
        isLogin: false,
        userInfo: createDefaultUserInfo(),
        stats: createDefaultStats(),
        learningMenuList: createLearningMenuList(),
      })
      return
    }

    const userInfo = wx.getStorageSync('userInfo') || {}
    const studentInfos = wx.getStorageSync('studentInfos') || {}
    const descParts = [studentInfos.className, studentInfos.projectName].filter(Boolean)

    this.setData({
      isLogin: true,
      userInfo: {
        nickName: studentInfos.userName || userInfo.nickname || '考生用户',
        avatarUrl: (studentInfos.userAvatar || userInfo.avatarUrl || images.defaultAvatar).replace(/^\/miniprogram/, ''),
        desc: descParts.length ? descParts.join(' · ') : '每天进步一点点',
        isVip: false,
      },
      stats: {
        totalQuestions: 1258,
        correctRate: '72%',
        continueDays: 15,
      },
      learningMenuList: createLearningMenuList(),
    })
  },

  onUserTap() {
    if (!wx.getStorageSync('isLogin')) {
      this.handleLogin()
      return
    }

    wx.navigateTo({
      url: '/pages/user-info/user-info',
    })
  },

  async handleLogin() {
    wx.showLoading({ title: '正在登录...', mask: true })

    try {
      const wxlogin = require('../../utils/wxlogin').default
      const result = await wxlogin.trySilentLogin()
      wx.hideLoading()

      if (result.success) {
        tool.toast('欢迎回来')
        this.loadUserData()
        return
      }

      if (result.needAuth) {
        tool.toast('请授权手机号完成登录')
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login?from=profile',
          })
        }, 1500)
        return
      }

      tool.toast(result.message || '登录失败，请重试')
    } catch (error) {
      wx.hideLoading()
      console.error('登录异常:', error)
      tool.toast('请先登录')
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login?from=profile',
        })
      }, 1500)
    }
  },

  onEditProfile() {
    if (!wx.getStorageSync('isLogin')) {
      this.handleLogin()
      return
    }

    wx.navigateTo({
      url: '/pages/user-info/user-info',
    })
  },

  onStatsMore() {
    wx.navigateTo({
      url: STATS_PAGE_PATH,
    })
  },

  onMenuTap(e) {
    const { type } = e.currentTarget.dataset
    const noLoginRequired = ['settings', 'help', 'about']

    if (!noLoginRequired.includes(type) && !wx.getStorageSync('isLogin')) {
      tool.toast('请先登录')
      setTimeout(() => {
        this.handleLogin()
      }, 1500)
      return
    }

    const targetPage = MENU_NAVIGATION_MAP[type]
    if (targetPage) {
      wx.navigateTo({
        url: targetPage,
      })
      return
    }

    switch (type) {
      case 'help':
        this.showFeedbackDialog()
        break
      case 'about':
        this.showAbout()
        break
      default:
        tool.toast('功能开发中')
    }
  },

  showFeedbackDialog() {
    this.setData({
      showFeedbackDialog: true,
      feedbackType: 'online',
      feedbackContent: '',
      feedbackImages: [],
    })
  },

  closeFeedbackDialog() {
    this.setData({
      showFeedbackDialog: false,
    })
  },

  onFeedbackDialogChange(e) {
    this.setData({
      showFeedbackDialog: e.detail.visible,
    })
  },

  onFeedbackTypeChange(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      feedbackType: type,
    })
  },

  onFeedbackInput(e) {
    this.setData({
      feedbackContent: e.detail.value,
    })
  },

  addFeedbackImage() {
    const remainCount = 4 - this.data.feedbackImages.length

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          feedbackImages: [...this.data.feedbackImages, ...res.tempFilePaths],
        })
      },
    })
  },

  deleteFeedbackImage(e) {
    const { index } = e.currentTarget.dataset
    const feedbackImages = [...this.data.feedbackImages]
    feedbackImages.splice(index, 1)
    this.setData({ feedbackImages })
  },

  submitFeedback() {
    if (!this.data.feedbackContent.trim()) {
      tool.toast('请输入您的建议')
      return
    }

    wx.showLoading({ title: '提交中...' })

    setTimeout(() => {
      wx.hideLoading()
      tool.toast('提交成功，感谢您的反馈')
      this.closeFeedbackDialog()
    }, 1000)
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '公考刷题小程序 v1.0.0\n\n专注公考与学习练习场景，当前版本先开放首页和我的。',
      showCancel: false,
    })
  },

  onShareAppMessage() {
    return {
      title: '公考刷题小程序',
      path: '/pages/index/index',
    }
  },
})
