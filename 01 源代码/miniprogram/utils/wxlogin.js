/**
 * 微信小程序登录授权工具
 * 处理静默登录和手机号授权登录
 */

const MOCK_AVATAR_URL = 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132'

class WxLogin {
  constructor() {
    this.isLoggingIn = false
  }

  getMockProfile(overrides = {}) {
    const nickname = overrides.nickname || '张三'
    const userInfo = {
      openId: overrides.openId || `mock_openid_${Date.now()}`,
      phone: overrides.phone || '138****8888',
      nickname,
      avatarUrl: overrides.avatarUrl || MOCK_AVATAR_URL,
    }

    return {
      userInfo,
      studentInfos: {
        userName: overrides.userName || nickname,
        userAvatar: overrides.userAvatar || userInfo.avatarUrl,
        className: overrides.className || '2024国考冲刺班',
        projectName: overrides.projectName || '行测专项突破',
      },
    }
  }

  persistLoginData({ token, userInfo, studentInfos }) {
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('studentInfos', studentInfos)
  }

  ensureStudentInfos(userInfo = {}) {
    const studentInfos = wx.getStorageSync('studentInfos')

    if (studentInfos && studentInfos.userName && studentInfos.userAvatar) {
      return studentInfos
    }

    const mockProfile = this.getMockProfile({
      openId: userInfo.openId,
      phone: userInfo.phone,
      nickname: userInfo.nickname,
      avatarUrl: userInfo.avatarUrl,
      userName: userInfo.nickname,
      userAvatar: userInfo.avatarUrl,
    })

    wx.setStorageSync('studentInfos', mockProfile.studentInfos)
    return mockProfile.studentInfos
  }

  /**
   * 尝试静默登录
   * @returns {Promise<{success: boolean, needAuth: boolean, message: string}>}
   */
  async trySilentLogin() {
    if (this.isLoggingIn) {
      return {
        success: false,
        needAuth: false,
        message: '正在登录中...',
      }
    }

    this.isLoggingIn = true

    try {
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')

      if (token && userInfo) {
        const isValid = await this.validateToken(token)
        if (isValid) {
          this.ensureStudentInfos(userInfo)
          wx.setStorageSync('isLogin', true)
          this.isLoggingIn = false
          return {
            success: true,
            needAuth: false,
            message: '登录成功',
          }
        }
      }

      const loginResult = await this.wxLogin()

      if (loginResult.success) {
        wx.setStorageSync('isLogin', true)
        this.isLoggingIn = false
        return {
          success: true,
          needAuth: false,
          message: '登录成功',
        }
      }

      this.isLoggingIn = false
      return {
        success: false,
        needAuth: true,
        message: '需要授权手机号',
      }
    } catch (error) {
      console.error('静默登录失败:', error)
      this.isLoggingIn = false
      return {
        success: false,
        needAuth: true,
        message: error.message || '登录失败',
      }
    }
  }

  /**
   * 微信登录
   */
  wxLogin() {
    return new Promise((resolve) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('获取到 code:', res.code)

            const mockToken = `mock_token_${Date.now()}`
            const mockProfile = this.getMockProfile()

            this.persistLoginData({
              token: mockToken,
              userInfo: mockProfile.userInfo,
              studentInfos: mockProfile.studentInfos,
            })

            resolve({
              success: true,
              token: mockToken,
              userInfo: mockProfile.userInfo,
            })
            return
          }

          resolve({
            success: false,
            message: '获取登录凭证失败',
          })
        },
        fail: (err) => {
          console.error('wx.login 失败:', err)
          resolve({
            success: false,
            message: '微信登录失败',
          })
        },
      })
    })
  }

  /**
   * 验证 token 是否有效
   */
  async validateToken(token) {
    void token
    return true
  }

  /**
   * 手机号授权登录
   * @param {Object} event - button 组件 open-type="getPhoneNumber" 的回调事件
   */
  async phoneLogin(event) {
    try {
      const { code, errMsg } = event.detail

      if (!code) {
        return {
          success: false,
          message: errMsg || '获取手机号失败',
        }
      }

      console.log('获取到手机号 code:', code)

      const mockToken = `mock_token_${Date.now()}`
      const mockProfile = this.getMockProfile()

      this.persistLoginData({
        token: mockToken,
        userInfo: mockProfile.userInfo,
        studentInfos: mockProfile.studentInfos,
      })
      wx.setStorageSync('isLogin', true)

      return {
        success: true,
        token: mockToken,
        userInfo: mockProfile.userInfo,
      }
    } catch (error) {
      console.error('手机号登录失败:', error)
      return {
        success: false,
        message: error.message || '登录失败',
      }
    }
  }

  /**
   * 退出登录
   */
  logout() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('studentInfos')
    wx.removeStorageSync('isLogin')

    return {
      success: true,
      message: '已退出登录',
    }
  }
}

const wxlogin = new WxLogin()

module.exports = {
  default: wxlogin,
  wxlogin,
}
