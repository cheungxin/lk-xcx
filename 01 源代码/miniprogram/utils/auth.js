/**
 * 登录鉴权工具
 * 处理用户登录状态管理和权限控制
 */
import storage from './storage'
import router from '../router/index'

const EXAM_TYPES = [
  { id: 'gwy', name: '国考' },
  { id: 'shengkao', name: '省考' },
  { id: 'sydw', name: '事业单位' },
  { id: 'jdwz', name: '军队文职' },
  { id: 'jszq', name: '教师招聘' }
]

export default {
  EXAM_TYPES,

  checkLogin() {
    return storage.isLogin()
  },

  requireLogin(callback) {
    if (this.checkLogin()) {
      callback && callback()
      return true
    } else {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            router.push('LOGIN')
          }
        }
      })
      return false
    }
  },

  getUserInfo() {
    return storage.getUserInfo()
  },

  setUserInfo(userInfo) {
    storage.setUserInfo(userInfo)
    storage.setLoginStatus(true)
  },

  logout() {
    storage.clearAll()
    router.reLaunch('INDEX')
  },

  getExamTypes() {
    return EXAM_TYPES
  },

  getCurrentExamType() {
    return storage.getExamType()
  },

  setCurrentExamType(examType) {
    storage.setExamType(examType)
  },

  showExamTypeSelector(callback) {
    const examTypes = this.getExamTypes()
    wx.showActionSheet({
      itemList: examTypes.map(item => item.name),
      success: (res) => {
        const selected = examTypes[res.tapIndex]
        this.setCurrentExamType(selected.name)
        callback && callback(selected)
      }
    })
  }
}
