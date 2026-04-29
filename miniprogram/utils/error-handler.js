// utils/error-handler.js
/**
 * 错误处理工具模块
 * 提供统一的错误处理和日志记录功能
 */

const apiConfig = require('../config/api-config')

/**
 * 错误类型枚举
 */
const ErrorType = {
  ROUTE: 'route',           // 路由错误
  NETWORK: 'network',       // 网络请求错误
  DATABASE: 'database',     // 数据库操作错误
  VALIDATION: 'validation', // 数据验证错误
  PERMISSION: 'permission', // 权限错误
  UNKNOWN: 'unknown'        // 未知错误
}

/**
 * 错误处理器类
 */
class ErrorHandler {
  /**
   * 处理路由错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息（路由路径、参数等）
   */
  static handleRouteError(error, context = {}) {
    console.error('Route Error:', error, context)
    
    // 记录错误日志
    this.logError({
      type: ErrorType.ROUTE,
      error: error.message || error.toString(),
      context,
      time: new Date().toISOString()
    })
    
    // 显示错误提示
    if (apiConfig.isDevelopment()) {
      wx.showModal({
        title: '路由错误',
        content: `页面跳转失败：${error.message || '未知错误'}`,
        showCancel: false
      })
    } else {
      wx.showToast({
        title: '页面跳转失败',
        icon: 'none',
        duration: 2000
      })
    }
    
    // 返回错误信息
    return {
      success: false,
      error: error.message || error.toString(),
      type: ErrorType.ROUTE
    }
  }

  /**
   * 处理网络请求错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息（请求 URL、方法等）
   */
  static handleNetworkError(error, context = {}) {
    console.error('Network Error:', error, context)
    
    // 记录错误日志
    this.logError({
      type: ErrorType.NETWORK,
      error: error.message || error.toString(),
      context,
      time: new Date().toISOString()
    })
    
    // 根据错误类型显示不同提示
    let errorMessage = '网络请求失败'
    
    if (error.message) {
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络'
      } else if (error.message.includes('fail')) {
        errorMessage = '网络连接失败'
      } else if (error.message.includes('abort')) {
        errorMessage = '请求已取消'
      }
    }
    
    // 显示错误提示
    if (apiConfig.isDevelopment()) {
      wx.showModal({
        title: '网络错误',
        content: `${errorMessage}\n${context.url || ''}`,
        showCancel: false
      })
    } else {
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    }
    
    // 返回错误信息
    return {
      success: false,
      error: errorMessage,
      type: ErrorType.NETWORK,
      originalError: error.message || error.toString()
    }
  }

  /**
   * 处理数据库操作错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息（操作类型、集合名等）
   */
  static handleDatabaseError(error, context = {}) {
    console.error('Database Error:', error, context)
    
    // 记录错误日志
    this.logError({
      type: ErrorType.DATABASE,
      error: error.message || error.toString(),
      context,
      time: new Date().toISOString()
    })
    
    // 根据错误类型显示不同提示
    let errorMessage = '数据操作失败'
    
    if (error.message) {
      if (error.message.includes('permission')) {
        errorMessage = '没有操作权限'
      } else if (error.message.includes('not found')) {
        errorMessage = '数据不存在'
      } else if (error.message.includes('timeout')) {
        errorMessage = '操作超时'
      }
    }
    
    // 显示错误提示
    if (apiConfig.isDevelopment()) {
      wx.showModal({
        title: '数据库错误',
        content: `${errorMessage}\n操作：${context.operation || '未知'}`,
        showCancel: false
      })
    } else {
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    }
    
    // 返回错误信息
    return {
      success: false,
      error: errorMessage,
      type: ErrorType.DATABASE,
      originalError: error.message || error.toString()
    }
  }

  /**
   * 处理数据验证错误
   * @param {string} message - 错误消息
   * @param {Object} context - 上下文信息
   */
  static handleValidationError(message, context = {}) {
    console.warn('Validation Error:', message, context)
    
    // 记录错误日志
    this.logError({
      type: ErrorType.VALIDATION,
      error: message,
      context,
      time: new Date().toISOString()
    })
    
    // 显示错误提示
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
    
    // 返回错误信息
    return {
      success: false,
      error: message,
      type: ErrorType.VALIDATION
    }
  }

  /**
   * 处理权限错误
   * @param {string} message - 错误消息
   * @param {Object} context - 上下文信息
   */
  static handlePermissionError(message, context = {}) {
    console.error('Permission Error:', message, context)
    
    // 记录错误日志
    this.logError({
      type: ErrorType.PERMISSION,
      error: message,
      context,
      time: new Date().toISOString()
    })
    
    // 显示错误提示
    wx.showModal({
      title: '权限不足',
      content: message || '您没有执行此操作的权限',
      showCancel: false
    })
    
    // 返回错误信息
    return {
      success: false,
      error: message,
      type: ErrorType.PERMISSION
    }
  }

  /**
   * 处理未知错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   */
  static handleUnknownError(error, context = {}) {
    console.error('Unknown Error:', error, context)
    
    // 记录错误日志
    this.logError({
      type: ErrorType.UNKNOWN,
      error: error.message || error.toString(),
      context,
      time: new Date().toISOString()
    })
    
    // 显示错误提示
    if (apiConfig.isDevelopment()) {
      wx.showModal({
        title: '未知错误',
        content: error.message || error.toString(),
        showCancel: false
      })
    } else {
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
    
    // 返回错误信息
    return {
      success: false,
      error: error.message || error.toString(),
      type: ErrorType.UNKNOWN
    }
  }

  /**
   * 记录错误日志到本地存储
   * @param {Object} logData - 日志数据
   */
  static logError(logData) {
    try {
      const errorLogs = wx.getStorageSync('error_logs') || []
      
      // 添加额外信息
      const enrichedLog = {
        ...logData,
        page: this.getCurrentPage(),
        env: apiConfig.getCurrentEnv(),
        timestamp: Date.now()
      }
      
      errorLogs.unshift(enrichedLog)
      
      // 限制日志数量
      const maxLogs = apiConfig.isDevelopment() ? 100 : 50
      if (errorLogs.length > maxLogs) {
        errorLogs.length = maxLogs
      }
      
      wx.setStorageSync('error_logs', errorLogs)
      
      // 开发环境输出日志
      if (apiConfig.isDevelopment()) {
        console.log('Error logged:', enrichedLog)
      }
    } catch (e) {
      console.error('Failed to log error:', e)
    }
  }

  /**
   * 获取当前页面路径
   * @returns {string} 当前页面路径
   */
  static getCurrentPage() {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      return pages[pages.length - 1].route || 'unknown'
    }
    return 'unknown'
  }

  /**
   * 获取所有错误日志
   * @returns {Array} 错误日志数组
   */
  static getErrorLogs() {
    try {
      return wx.getStorageSync('error_logs') || []
    } catch (e) {
      console.error('Failed to get error logs:', e)
      return []
    }
  }

  /**
   * 清除所有错误日志
   */
  static clearErrorLogs() {
    try {
      wx.removeStorageSync('error_logs')
      console.log('Error logs cleared')
      return true
    } catch (e) {
      console.error('Failed to clear error logs:', e)
      return false
    }
  }

  /**
   * 获取错误统计信息
   * @returns {Object} 错误统计
   */
  static getErrorStats() {
    const logs = this.getErrorLogs()
    
    const stats = {
      total: logs.length,
      byType: {},
      byPage: {},
      recent: logs.slice(0, 10)
    }
    
    // 按类型统计
    logs.forEach(log => {
      const type = log.type || ErrorType.UNKNOWN
      stats.byType[type] = (stats.byType[type] || 0) + 1
      
      const page = log.page || 'unknown'
      stats.byPage[page] = (stats.byPage[page] || 0) + 1
    })
    
    return stats
  }
}

module.exports = {
  ErrorHandler,
  ErrorType
}
