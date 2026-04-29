/**
 * 性能监控工具
 * 用于收集和分析小程序性能数据
 */

/**
 * 性能数据收集器
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: [],      // 页面加载时间
      apiRequest: [],    // API 请求时间
      renderTime: [],    // 渲染时间
      memoryUsage: []    // 内存使用情况
    }
    
    this.maxRecords = 50 // 最多保存 50 条记录
  }

  /**
   * 记录页面加载时间
   * @param {string} pagePath - 页面路径
   * @param {number} loadTime - 加载时间（毫秒）
   */
  recordPageLoad(pagePath, loadTime) {
    this.addMetric('pageLoad', {
      pagePath,
      loadTime,
      timestamp: Date.now()
    })
    
    console.log(`[Performance] Page Load: ${pagePath} - ${loadTime}ms`)
  }

  /**
   * 记录 API 请求时间
   * @param {string} url - 请求 URL
   * @param {number} duration - 请求时长（毫秒）
   * @param {boolean} success - 是否成功
   */
  recordApiRequest(url, duration, success = true) {
    this.addMetric('apiRequest', {
      url,
      duration,
      success,
      timestamp: Date.now()
    })
    
    console.log(`[Performance] API Request: ${url} - ${duration}ms - ${success ? 'Success' : 'Failed'}`)
  }

  /**
   * 记录渲染时间
   * @param {string} component - 组件名称
   * @param {number} renderTime - 渲染时间（毫秒）
   */
  recordRenderTime(component, renderTime) {
    this.addMetric('renderTime', {
      component,
      renderTime,
      timestamp: Date.now()
    })
    
    console.log(`[Performance] Render: ${component} - ${renderTime}ms`)
  }

  /**
   * 记录内存使用情况
   */
  recordMemoryUsage() {
    try {
      const performance = wx.getPerformance()
      if (performance && performance.getEntries) {
        const entries = performance.getEntries()
        
        this.addMetric('memoryUsage', {
          entriesCount: entries.length,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('[Performance] Failed to record memory usage:', error)
    }
  }

  /**
   * 添加性能指标
   * @param {string} type - 指标类型
   * @param {Object} data - 指标数据
   */
  addMetric(type, data) {
    if (!this.metrics[type]) {
      this.metrics[type] = []
    }
    
    this.metrics[type].push(data)
    
    // 限制记录数量
    if (this.metrics[type].length > this.maxRecords) {
      this.metrics[type].shift()
    }
  }

  /**
   * 获取性能统计
   * @param {string} type - 指标类型
   * @returns {Object} 统计数据
   */
  getStats(type) {
    const metrics = this.metrics[type] || []
    
    if (metrics.length === 0) {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0
      }
    }
    
    // 根据不同类型提取数值
    let values = []
    if (type === 'pageLoad') {
      values = metrics.map(m => m.loadTime)
    } else if (type === 'apiRequest') {
      values = metrics.map(m => m.duration)
    } else if (type === 'renderTime') {
      values = metrics.map(m => m.renderTime)
    }
    
    if (values.length === 0) {
      return {
        count: metrics.length,
        avg: 0,
        min: 0,
        max: 0
      }
    }
    
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return {
      count: values.length,
      avg: Math.round(avg),
      min,
      max
    }
  }

  /**
   * 获取所有性能数据
   * @returns {Object} 所有性能指标
   */
  getAllMetrics() {
    return {
      pageLoad: this.getStats('pageLoad'),
      apiRequest: this.getStats('apiRequest'),
      renderTime: this.getStats('renderTime'),
      memoryUsage: {
        count: this.metrics.memoryUsage.length
      }
    }
  }

  /**
   * 清空性能数据
   */
  clear() {
    this.metrics = {
      pageLoad: [],
      apiRequest: [],
      renderTime: [],
      memoryUsage: []
    }
    console.log('[Performance] Metrics cleared')
  }

  /**
   * 导出性能数据
   * @returns {string} JSON 格式的性能数据
   */
  export() {
    return JSON.stringify({
      metrics: this.metrics,
      stats: this.getAllMetrics(),
      exportTime: new Date().toISOString()
    }, null, 2)
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor()

/**
 * 页面性能监控 Mixin
 * 在页面中使用：Object.assign(pageConfig, performanceMixin)
 */
const performanceMixin = {
  onLoad() {
    this._pageLoadStart = Date.now()
  },
  
  onReady() {
    if (this._pageLoadStart) {
      const loadTime = Date.now() - this._pageLoadStart
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      performanceMonitor.recordPageLoad(currentPage.route, loadTime)
    }
  }
}

module.exports = {
  performanceMonitor,
  performanceMixin
}
