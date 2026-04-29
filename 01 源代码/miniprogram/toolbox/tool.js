/**
 * 业务工具函数库
 * 提供 UI 交互、存储操作、数组操作、云函数调用、数据转换等业务相关的工具函数
 */

/**
 * 显示消息提示框
 * @param {string|Object} options - 提示内容或配置对象
 * @param {string} options.title - 提示的内容
 * @param {string} options.icon - 图标，可选值：'success', 'error', 'loading', 'none'
 * @param {number} options.duration - 提示的延迟时间，单位毫秒，默认 1500
 * @returns {Promise}
 * @example
 * toast('操作成功')
 * toast({ title: '加载中', icon: 'loading' })
 */
function toast(options) {
  return new Promise((resolve, reject) => {
    const config = typeof options === 'string' 
      ? { title: options, icon: 'none', duration: 1500 }
      : { icon: 'none', duration: 1500, ...options }

    wx.showToast({
      ...config,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 显示模态对话框
 * @param {string|Object} options - 提示内容或配置对象
 * @param {string} options.title - 提示的标题
 * @param {string} options.content - 提示的内容
 * @param {boolean} options.showCancel - 是否显示取消按钮，默认 true
 * @param {string} options.cancelText - 取消按钮的文字，默认 '取消'
 * @param {string} options.confirmText - 确定按钮的文字，默认 '确定'
 * @returns {Promise<boolean>} 返回用户是否点击确定
 * @example
 * modal('确定要删除吗？').then(confirm => { if (confirm) { ... } })
 * modal({ title: '提示', content: '确定要删除吗？' })
 */
function modal(options) {
  return new Promise((resolve, reject) => {
    const config = typeof options === 'string'
      ? { title: '提示', content: options, showCancel: true }
      : { title: '提示', showCancel: true, ...options }

    wx.showModal({
      ...config,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: reject
    })
  })
}

/**
 * 显示加载提示框
 * @param {string|Object} options - 提示内容或配置对象
 * @param {string} options.title - 提示的内容，默认 '加载中'
 * @param {boolean} options.mask - 是否显示透明蒙层，防止触摸穿透，默认 true
 * @returns {Promise}
 * @example
 * showLoading()
 * showLoading('正在加载')
 * showLoading({ title: '请稍候', mask: true })
 */
function showLoading(options = {}) {
  return new Promise((resolve, reject) => {
    const config = typeof options === 'string'
      ? { title: options, mask: true }
      : { title: '加载中', mask: true, ...options }

    wx.showLoading({
      ...config,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 隐藏加载提示框
 * @returns {Promise}
 * @example
 * hideLoading()
 */
function hideLoading() {
  return new Promise((resolve, reject) => {
    wx.hideLoading({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 设置本地存储（异步）
 * @param {string} key - 本地缓存中指定的 key
 * @param {*} value - 需要存储的内容
 * @returns {Promise}
 * @example
 * setStorage('userInfo', { name: 'test', age: 18 })
 */
function setStorage(key, value) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data: value,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 获取本地存储（异步）
 * @param {string} key - 本地缓存中指定的 key
 * @returns {Promise<*>} 返回存储的内容
 * @example
 * getStorage('userInfo').then(data => { console.log(data) })
 */
function getStorage(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success: (res) => {
        resolve(res.data)
      },
      fail: reject
    })
  })
}

/**
 * 删除本地存储（异步）
 * @param {string} key - 本地缓存中指定的 key
 * @returns {Promise}
 * @example
 * removeStorage('userInfo')
 */
function removeStorage(key) {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 清空本地存储（异步）
 * @returns {Promise}
 * @example
 * clearStorage()
 */
function clearStorage() {
  return new Promise((resolve, reject) => {
    wx.clearStorage({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 数组转对象
 * @param {Array} array - 源数组
 * @param {string} keyField - 作为对象 key 的字段名
 * @returns {Object} 转换后的对象
 * @example
 * const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
 * arrayToObject(arr, 'id') // { 1: { id: 1, name: 'a' }, 2: { id: 2, name: 'b' } }
 */
function arrayToObject(array, keyField) {
  if (!Array.isArray(array)) {
    console.error('arrayToObject: first parameter must be an array')
    return {}
  }

  return array.reduce((obj, item) => {
    if (item && item[keyField] !== undefined) {
      obj[item[keyField]] = item
    }
    return obj
  }, {})
}

/**
 * 数组子集判断
 * @param {Array} subset - 子集数组
 * @param {Array} superset - 父集数组
 * @returns {boolean} 是否为子集
 * @example
 * subSet([1, 2], [1, 2, 3, 4]) // true
 * subSet([1, 5], [1, 2, 3, 4]) // false
 */
function subSet(subset, superset) {
  if (!Array.isArray(subset) || !Array.isArray(superset)) {
    console.error('subSet: both parameters must be arrays')
    return false
  }

  return subset.every(item => superset.includes(item))
}

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {Object} data - 传递给云函数的参数
 * @returns {Promise} 返回云函数执行结果
 * @example
 * callCloud('getUserInfo', { userId: '123' }).then(res => { console.log(res) })
 */
function callCloud(name, data = {}) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化，请先在 app.js 中初始化云开发'))
      return
    }

    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        resolve(res.result)
      },
      fail: reject
    })
  })
}

/**
 * 转换值对象
 * 将对象的值按照映射规则进行转换
 * @param {Object} obj - 源对象
 * @param {Object} mapping - 映射规则对象，key 为原值，value 为新值
 * @param {string} field - 需要转换的字段名，如果不指定则转换整个对象的值
 * @returns {Object} 转换后的对象
 * @example
 * const obj = { status: 1, name: 'test' }
 * const mapping = { 1: '启用', 2: '禁用' }
 * transformValueObject(obj, mapping, 'status') // { status: '启用', name: 'test' }
 */
function transformValueObject(obj, mapping, field) {
  if (!obj || typeof obj !== 'object') {
    console.error('transformValueObject: first parameter must be an object')
    return obj
  }

  if (!mapping || typeof mapping !== 'object') {
    console.error('transformValueObject: second parameter must be an object')
    return obj
  }

  const result = { ...obj }

  if (field) {
    // 转换指定字段
    if (result[field] !== undefined && mapping[result[field]] !== undefined) {
      result[field] = mapping[result[field]]
    }
  } else {
    // 转换所有字段
    Object.keys(result).forEach(key => {
      if (mapping[result[key]] !== undefined) {
        result[key] = mapping[result[key]]
      }
    })
  }

  return result
}

/**
 * 转换值数组
 * 将数组中每个对象的值按照映射规则进行转换
 * @param {Array} array - 源数组
 * @param {Object} mapping - 映射规则对象，key 为原值，value 为新值
 * @param {string} field - 需要转换的字段名，如果不指定则转换每个对象的所有值
 * @returns {Array} 转换后的数组
 * @example
 * const arr = [{ status: 1, name: 'a' }, { status: 2, name: 'b' }]
 * const mapping = { 1: '启用', 2: '禁用' }
 * transformValueArray(arr, mapping, 'status')
 * // [{ status: '启用', name: 'a' }, { status: '禁用', name: 'b' }]
 */
function transformValueArray(array, mapping, field) {
  if (!Array.isArray(array)) {
    console.error('transformValueArray: first parameter must be an array')
    return array
  }

  if (!mapping || typeof mapping !== 'object') {
    console.error('transformValueArray: second parameter must be an object')
    return array
  }

  return array.map(item => transformValueObject(item, mapping, field))
}

module.exports = {
  toast,
  modal,
  showLoading,
  hideLoading,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  arrayToObject,
  subSet,
  callCloud,
  transformValueObject,
  transformValueArray
}
