/**
 * 通用工具函数库
 * 提供日期格式化、时间格式化、数字格式化等常用工具函数
 */

/**
 * 格式化时间
 * @param {Date|number} date - 日期对象或时间戳
 * @param {string} format - 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 * @example
 * formatTime(new Date()) // '2024-01-15 14:30:45'
 * formatTime(Date.now(), 'YYYY/MM/DD') // '2024/01/15'
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return formatDate(date, format)
}

/**
 * 格式化日期
 * @param {Date|number} date - 日期对象或时间戳
 * @param {string} format - 格式字符串，支持 YYYY/MM/DD/HH/mm/ss
 * @returns {string} 格式化后的日期字符串
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // '2024-01-15'
 * formatDate(1705305045000, 'YYYY年MM月DD日') // '2024年01月15日'
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  // 转换为 Date 对象
  if (typeof date === 'number') {
    date = new Date(date)
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date:', date)
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // 补零函数
  const pad = (num) => num < 10 ? '0' + num : num

  // 替换格式字符串
  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hour))
    .replace('mm', pad(minute))
    .replace('ss', pad(second))
}

/**
 * 格式化数字
 * @param {number} num - 要格式化的数字
 * @param {number} decimals - 小数位数，默认 2
 * @param {string} decPoint - 小数点符号，默认 '.'
 * @param {string} thousandsSep - 千分位分隔符，默认 ','
 * @returns {string} 格式化后的数字字符串
 * @example
 * formatNumber(1234.5678) // '1,234.57'
 * formatNumber(1234.5678, 1) // '1,234.6'
 * formatNumber(1234.5678, 0, '.', ' ') // '1 235'
 */
function formatNumber(num, decimals = 2, decPoint = '.', thousandsSep = ',') {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }

  // 四舍五入到指定小数位
  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')
  
  // 添加千分位分隔符
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep)
  
  // 组合整数和小数部分
  return parts.join(decPoint)
}

/**
 * 判断是否为对象
 * @param {*} value - 待判断的值
 * @returns {boolean}
 * @example
 * isObject({}) // true
 * isObject([]) // false
 * isObject(null) // false
 */
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 判断是否为数组
 * @param {*} value - 待判断的值
 * @returns {boolean}
 * @example
 * isArray([]) // true
 * isArray({}) // false
 */
function isArray(value) {
  return Array.isArray(value)
}

/**
 * 判断是否为字符串
 * @param {*} value - 待判断的值
 * @returns {boolean}
 * @example
 * isString('hello') // true
 * isString(123) // false
 */
function isString(value) {
  return typeof value === 'string'
}

/**
 * 判断是否为数字
 * @param {*} value - 待判断的值
 * @returns {boolean}
 * @example
 * isNumber(123) // true
 * isNumber('123') // false
 */
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 判断是否为函数
 * @param {*} value - 待判断的值
 * @returns {boolean}
 * @example
 * isFunction(() => {}) // true
 * isFunction({}) // false
 */
function isFunction(value) {
  return typeof value === 'function'
}

/**
 * 深拷贝
 * @param {*} obj - 待拷贝的对象
 * @returns {*} 拷贝后的新对象
 * @example
 * const obj = { a: 1, b: { c: 2 } }
 * const copy = deepClone(obj)
 * copy.b.c = 3
 * console.log(obj.b.c) // 2
 */
function deepClone(obj) {
  // 处理 null 和基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }

  // 处理普通对象
  const clonedObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }

  return clonedObj
}

/**
 * 解析 URL 参数
 * @param {string} url - URL 字符串
 * @returns {Object} 参数对象
 * @example
 * parseUrlParams('?name=test&age=18') // { name: 'test', age: '18' }
 */
function parseUrlParams(url) {
  const params = {}
  const queryString = url.split('?')[1]
  
  if (!queryString) {
    return params
  }

  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })

  return params
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  isObject,
  isArray,
  isString,
  isNumber,
  isFunction,
  deepClone,
  parseUrlParams
}
