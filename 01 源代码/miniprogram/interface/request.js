/**
 * 网络请求封装模块
 * 封装 wx.request，提供统一的请求处理、超时管理和错误处理
 */

const apiConfig = require('../config/api-config')

// 请求拦截器列表
const requestInterceptors = []
// 响应拦截器列表
const responseInterceptors = []

// Loading 状态管理
let loadingTimer = null
let refreshTimer = null

/**
 * 显示 Loading 提示
 * @param {number} delay - 延迟显示时间（毫秒）
 */
function showLoading(delay = 2000) {
  // 清除之前的定时器
  if (loadingTimer) {
    clearTimeout(loadingTimer)
  }
  
  // 延迟显示 loading
  loadingTimer = setTimeout(() => {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  }, delay)
}

/**
 * 隐藏 Loading 提示
 */
function hideLoading() {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
  wx.hideLoading()
}

/**
 * 显示刷新提示
 * @param {number} timeout - 超时时间（毫秒）
 */
function showRefreshTip(timeout = 7000) {
  refreshTimer = setTimeout(() => {
    wx.showToast({
      title: '请求超时，请刷新重试',
      icon: 'none',
      duration: 3000
    })
  }, timeout)
}

/**
 * 执行请求拦截器
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的请求配置
 */
function executeRequestInterceptors(config) {
  let processedConfig = config
  for (const interceptor of requestInterceptors) {
    processedConfig = interceptor(processedConfig) || processedConfig
  }
  return processedConfig
}

/**
 * 执行响应拦截器
 * @param {Object} response - 响应数据
 * @returns {Object} 处理后的响应数据
 */
function executeResponseInterceptors(response) {
  let processedResponse = response
  for (const interceptor of responseInterceptors) {
    processedResponse = interceptor(processedResponse) || processedResponse
  }
  return processedResponse
}

/**
 * 核心请求方法
 * @param {Object} config - 请求配置
 * @param {string} config.url - 请求地址
 * @param {string} config.method - 请求方法
 * @param {Object} [config.data] - 请求数据
 * @param {Object} [config.header] - 请求头
 * @param {number} [config.timeout] - 超时时间
 * @param {boolean} [config.showLoading] - 是否显示加载提示
 * @returns {Promise} 请求 Promise
 */
function request(config) {
  return new Promise((resolve, reject) => {
    // 执行请求拦截器
    const processedConfig = executeRequestInterceptors(config)
    
    // 获取基础配置
    const baseURL = apiConfig.getBaseURL()
    const timeout = processedConfig.timeout || apiConfig.getTimeout()
    
    // 构建完整 URL
    const fullUrl = processedConfig.url.startsWith('http') 
      ? processedConfig.url 
      : `${baseURL}${processedConfig.url}`
    
    // 显示 loading（2秒后显示）
    if (processedConfig.showLoading !== false) {
      showLoading(2000)
      // 7秒后显示刷新提示
      showRefreshTip(7000)
    }
    
    // 发起请求
    const requestTask = wx.request({
      url: fullUrl,
      method: processedConfig.method || 'GET',
      data: processedConfig.data || {},
      header: processedConfig.header || {
        'content-type': 'application/json'
      },
      timeout: timeout,
      success: (res) => {
        // 隐藏 loading
        hideLoading()
        
        // 执行响应拦截器
        const processedResponse = executeResponseInterceptors(res)
        
        // 判断请求是否成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(processedResponse.data)
        } else {
          // HTTP 错误
          const error = {
            code: res.statusCode,
            message: `HTTP Error: ${res.statusCode}`,
            data: res.data
          }
          reject(error)
        }
      },
      fail: (err) => {
        // 隐藏 loading
        hideLoading()
        
        // 网络错误或超时
        const error = {
          code: err.errMsg.includes('timeout') ? 'TIMEOUT' : 'NETWORK_ERROR',
          message: err.errMsg.includes('timeout') ? '请求超时' : '网络错误',
          detail: err.errMsg
        }
        
        // 显示错误提示
        wx.showToast({
          title: error.message,
          icon: 'none',
          duration: 2000
        })
        
        reject(error)
      }
    })
    
    // 处理超时
    if (timeout) {
      setTimeout(() => {
        requestTask.abort()
      }, timeout)
    }
  })
}

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 查询参数
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
function get(url, params = {}, options = {}) {
  // 将参数拼接到 URL
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 查询参数
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
function deleteRequest(url, params = {}, options = {}) {
  // 将参数拼接到 URL
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request({
    url: fullUrl,
    method: 'DELETE',
    ...options
  })
}

/**
 * 文件上传
 * @param {string} url - 上传地址
 * @param {string} filePath - 本地文件路径
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
function upload(url, filePath, options = {}) {
  return new Promise((resolve, reject) => {
    // 获取基础配置
    const baseURL = apiConfig.getBaseURL()
    
    // 构建完整 URL
    const fullUrl = url.startsWith('http') 
      ? url 
      : `${baseURL}${url}`
    
    // 显示 loading
    if (options.showLoading !== false) {
      wx.showLoading({
        title: '上传中...',
        mask: true
      })
    }
    
    // 发起上传
    wx.uploadFile({
      url: fullUrl,
      filePath: filePath,
      name: options.name || 'file',
      header: options.header || {},
      formData: options.formData || {},
      success: (res) => {
        wx.hideLoading()
        
        // 解析响应数据
        let data = res.data
        try {
          data = JSON.parse(res.data)
        } catch (e) {
          // 如果解析失败，保持原始数据
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          const error = {
            code: res.statusCode,
            message: `上传失败: ${res.statusCode}`,
            data: data
          }
          reject(error)
        }
      },
      fail: (err) => {
        wx.hideLoading()
        
        const error = {
          code: 'UPLOAD_ERROR',
          message: '上传失败',
          detail: err.errMsg
        }
        
        wx.showToast({
          title: error.message,
          icon: 'none',
          duration: 2000
        })
        
        reject(error)
      }
    })
  })
}

/**
 * 添加请求拦截器
 * @param {Function} interceptor - 拦截器函数，接收 config 参数，返回处理后的 config
 */
function addRequestInterceptor(interceptor) {
  if (typeof interceptor === 'function') {
    requestInterceptors.push(interceptor)
  }
}

/**
 * 添加响应拦截器
 * @param {Function} interceptor - 拦截器函数，接收 response 参数，返回处理后的 response
 */
function addResponseInterceptor(interceptor) {
  if (typeof interceptor === 'function') {
    responseInterceptors.push(interceptor)
  }
}

// 导出请求模块
module.exports = {
  request,
  get,
  post,
  put,
  delete: deleteRequest,
  upload,
  addRequestInterceptor,
  addResponseInterceptor
}
