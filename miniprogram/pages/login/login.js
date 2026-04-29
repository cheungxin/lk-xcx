/**
 * 登录页面 - 微信手机号授权登录
 */

// 引入路由管理器
import router from '../../router/index'
// 引入网络请求模块
import request from '../../interface/request'
// 引入工具函数
const tool = require('../../toolbox/tool')
const { images } = require('../../assets/index')

Page({
  data: {
    // 导航栏配置
    navBarTitle: '登录',
    navBarBackground: '#1677ff',
    navBarColor: '#ffffff',
    
    // 登录状态
    isLoading: false,
    
    // 来源页面
    fromPage: ''
  },

  onLoad(options) {
    console.log('Login Page Load', options)
    
    // 记录来源页面
    if (options.from) {
      this.setData({ fromPage: options.from })
    }
    
    // 检查是否已登录
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      const isLogin = wx.getStorageSync('isLogin')
      if (isLogin) {
        console.log('用户已登录，返回上一页')
        wx.navigateBack()
      }
    } catch (error) {
      console.log('用户未登录')
    }
  },

  /**
   * 获取手机号授权
   */
  async getPhoneNumber(e) {
    console.log('获取手机号:', e)
    
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      tool.toast('取消授权')
      return
    }
    
    // 防止重复提交
    if (this.data.isLoading) {
      return
    }
    
    try {
      this.setData({ isLoading: true })
      wx.showLoading({ title: '登录中...', mask: true })
      
      // 1. 先调用 wx.login 获取 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })
      
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }
      
      console.log('微信登录 code:', loginRes.code)
      console.log('手机号加密数据:', e.detail)
      
      // 2. 将 code 和手机号加密数据发送到后端
      // 这里需要调用你的后端接口
      // const response = await request.post('/api/auth/phone-login', {
      //   code: loginRes.code,
      //   encryptedData: e.detail.encryptedData,
      //   iv: e.detail.iv
      // })
      
      // 模拟登录成功（实际项目中需要调用真实接口）
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResponse = {
        code: 200,
        message: '登录成功',
        data: {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            openId: 'mock_openid_' + Date.now(),
            phone: '138****8888', // 实际应该从后端返回
            nickname: '微信用户',
            avatarUrl: images.defaultAvatar
          }
        }
      }
      
      // 3. 保存登录信息
      await this.handleLoginSuccess(mockResponse.data)
      
    } catch (error) {
      console.error('登录失败:', error)
      wx.hideLoading()
      tool.toast(error.message || '登录失败，请重试')
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 处理登录成功
   */
  async handleLoginSuccess(data) {
    try {
      // 保存登录状态
      wx.setStorageSync('isLogin', true)
      
      // 保存 token
      wx.setStorageSync('token', data.token)
      
      // 保存用户信息
      wx.setStorageSync('userInfo', data.userInfo)
      
      wx.hideLoading()
      tool.toast('登录成功')
      
      // 延迟返回
      setTimeout(() => {
        // 如果有来源页面，返回到来源页面
        if (this.data.fromPage) {
          wx.navigateBack()
        } else {
          // 否则跳转到首页
          wx.switchTab({ url: '/pages/index/index' })
        }
      }, 1500)
      
    } catch (error) {
      console.error('处理登录成功失败:', error)
      throw error
    }
  },

  /**
   * 微信一键登录（不获取手机号）
   */
  async handleWechatLogin() {
    try {
      this.setData({ isLoading: true })
      wx.showLoading({ title: '登录中...', mask: true })
      
      // 调用微信登录接口
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })
      
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }
      
      console.log('微信登录 code:', loginRes.code)
      
      // 在实际项目中，将 code 发送到后端换取 token
      // const response = await request.post('/api/auth/wechat-login', { code: loginRes.code })
      
      // 模拟登录成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      wx.hideLoading()
      tool.toast('微信登录功能需要配置后端接口')
      
    } catch (error) {
      console.error('微信登录失败:', error)
      wx.hideLoading()
      tool.toast('微信登录失败')
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 导航栏返回按钮
   */
  handleNavBack() {
    wx.navigateBack()
  },

  /**
   * 导航栏首页按钮
   */
  handleNavHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
