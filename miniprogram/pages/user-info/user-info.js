/**
 * 个人信息编辑页面
 */

const tool = require('../../toolbox/tool')
const { images } = require('../../assets/index')
const app = getApp()
const { navigationBarHeight = 0 } = app.globalData || {}

Page({
  data: {
    navigationBarHeight,
    userInfo: {
      nickName: '',
      avatarUrl: '',
      phone: '',
      desc: ''
    },
    showFullPhone: false,
    formattedPhone: ''
  },

  onLoad() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const isLogin = wx.getStorageSync('isLogin')

    if (!isLogin) {
      wx.redirectTo({
        url: '/pages/profile/profile'
      })
      return
    }

    const userInfo = wx.getStorageSync('userInfo') || {}
    const studentInfos = wx.getStorageSync('studentInfos') || {}

    const displayUserInfo = {
      nickName: studentInfos.userName || userInfo.nickname || '考生用户',
      avatarUrl: studentInfos.userAvatar || userInfo.avatarUrl || images.defaultAvatar,
      phone: studentInfos.phone || userInfo.phone || '',
      desc: studentInfos.className ? `${studentInfos.className} · ${studentInfos.projectName || ''}` : '每天进步一点点'
    }

    this.setData({
      userInfo: displayUserInfo,
      formattedPhone: this.formatPhone(displayUserInfo.phone)
    })
  },

  formatPhone(phone) {
    if (!phone || phone.length < 11) return '******'
    return phone.substring(0, 3) + '****' + phone.substring(7)
  },

  togglePhoneDisplay() {
    this.setData({
      showFullPhone: !this.data.showFullPhone
    })
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail

    // 上传头像到服务器
    wx.showLoading({ title: '上传中...' })

    // TODO: 实际项目中需要上传到服务器
    // 这里模拟上传成功
    setTimeout(() => {
      wx.hideLoading()

      // 更新本地数据
      const userInfo = this.data.userInfo
      userInfo.avatarUrl = avatarUrl

      this.setData({ userInfo })

      // 保存到缓存
      const cachedUserInfo = wx.getStorageSync('userInfo') || {}
      cachedUserInfo.avatarUrl = avatarUrl
      wx.setStorageSync('userInfo', cachedUserInfo)

      const studentInfos = wx.getStorageSync('studentInfos') || {}
      studentInfos.userAvatar = avatarUrl
      wx.setStorageSync('studentInfos', studentInfos)

      tool.toast('头像更新成功')
    }, 800)
  },

  // 修改昵称
  onNicknameInput(e) {
    const nickName = e.detail.value
    const userInfo = this.data.userInfo
    userInfo.nickName = nickName
    this.setData({ userInfo })
  },

  // 保存昵称
  saveNickname() {
    const { nickName } = this.data.userInfo

    if (!nickName || !nickName.trim()) {
      tool.toast('昵称不能为空')
      return
    }

    wx.showLoading({ title: '保存中...' })

    // TODO: 实际项目中需要调用后端接口
    setTimeout(() => {
      wx.hideLoading()

      // 保存到缓存
      const cachedUserInfo = wx.getStorageSync('userInfo') || {}
      cachedUserInfo.nickname = nickName
      wx.setStorageSync('userInfo', cachedUserInfo)

      const studentInfos = wx.getStorageSync('studentInfos') || {}
      studentInfos.userName = nickName
      wx.setStorageSync('studentInfos', studentInfos)

      tool.toast('保存成功')

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    }, 800)
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
  }
})
