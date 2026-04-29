/**
 * 时间处理工具
 * 提供日期格式化、倒计时、时长计算等功能
 */
export default {
  format(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date)
    }

    const o = {
      'Y+': date.getFullYear(),
      'M+': date.getMonth() + 1,
      'D+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
    }

    for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        fmt = fmt.replace(RegExp.$1, String(o[k]).padStart(2, '0'))
      }
    }
    return fmt
  },

  formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  },

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${minutes}分${s}秒`
  },

  calculateDuration(startTime, endTime) {
    const duration = Math.floor((endTime - startTime) / 1000)
    return this.formatDuration(duration)
  },

  getToday() {
    return this.format(new Date(), 'YYYY-MM-DD')
  },

  getTimestamp() {
    return Date.now()
  },

  addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  diffDays(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2 - d1)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  isToday(date) {
    const d = new Date(date)
    const today = new Date()
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
  },

  getWeekDay(date) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const d = new Date(date)
    return weekDays[d.getDay()]
  }
}
