---
name: civil-service-exam-MiniProgram-Development-Framework
description: 适用于公考教育行业的微信小程序开发框架。当用户需要开发公考、教育类刷题小程序，或需要实现答题、解析、错题本等功能时使用。涵盖路由管理、用户信息管理、题目处理、分包配置、答题逻辑等核心功能，支持原生开发或TDesign组件库。
---

# 公考小程序开发框架

适用于公考/教育行业的微信小程序通用开发框架，支持原生开发或TDesign组件库。

---

## 一、项目结构规范

```
miniprogram/
├── pages/                  # 主包页面
│   ├── home/              # 首页
│   ├── profile/           # 个人中心
│   └── auth/              # 登录授权
├── subpackages/           # 分包（按业务模块）
│   ├── practice/          # 刷题模块
│   ├── essay/             # 申论模块
│   ├── interview/         # 面试模块
│   ├── course/            # 课程模块
│   └── wrong-book/        # 错题本模块
├── components/            # 组件
│   ├── login/             # 登录组件
│   ├── nav/               # 自定义导航栏
│   ├── privacy/           # 隐私弹窗
│   ├── question-item/     # 题目组件
│   ├── answer-card/       # 答题卡组件
│   ├── empty-state/       # 空状态
│   └── score-card/        # 成绩卡片
├── router/                # 路由管理
│   └── index.js           # 路由封装
├── utils/                 # 工具函数
│   ├── storage.js         # 本地存储
│   ├── time.js            # 时间处理
│   ├── question.js        # 题目处理
│   ├── auth.js            # 登录鉴权
│   ├── util.js            # 通用工具
│   └── systems.js         # 系统相关（更新检查、分享等）
├── toolbox/               # 业务工具箱
│   ├── tool.js            # 业务工具函数（弹窗、数据转换等）
│   └── time.js            # 时间处理扩展
├── model/                 # 数据模型层（可选：云开发）
│   ├── index.js           # 用户、收藏、错题等模型
│   └── database.js        # 数据库连接配置
├── mock/                  # Mock数据（开发阶段）
│   ├── questions.js       # 题库数据
│   ├── user.js            # 用户数据
│   └── statistics.js      # 统计数据
├── styles/                # 全局样式
│   ├── theme.wxss         # 主题变量
│   ├── common.wxss        # 通用样式
│   └── iconfont.wxss      # 图标字体
├── config/                # 配置文件
│   ├── index.js           # 全局配置
│   └── api-config.js      # API环境配置（可选）
├── custom-tab-bar/        # 自定义TabBar
│   ├── index.js
│   ├── index.wxml
│   ├── index.wxss
│   └── index.json
├── app.js
├── app.json
└── app.wxss
```

---

## 二、路由管理

### 核心思想
- 统一管理所有页面路径
- 封装跳转方法，简化调用
- 自动处理页面栈溢出

### 实现示例

```javascript
// router/index.js
const pages = {
  // 主包
  home: '/pages/home/home',
  practice: '/pages/practice/practice',
  answerCard: '/pages/answer-card/answer-card',
  analysis: '/pages/analysis/analysis',
  profile: '/pages/profile/profile',
  login: '/pages/auth/login/login',
  
  // 分包
  essay: '/subpackages/essay/index/index',
  wrongBook: '/subpackages/wrong-book/index/index',
}

export default {
  // 普通跳转
  push(name, params = {}) {
    const url = this.buildUrl(pages[name] || name, params)
    wx.navigateTo({ url })
  },
  
  // 重定向
  redirect(name, params = {}) {
    const url = this.buildUrl(pages[name] || name, params)
    wx.redirectTo({ url })
  },
  
  // 重启
  reLaunch(name, params = {}) {
    const url = this.buildUrl(pages[name] || name, params)
    wx.reLaunch({ url })
  },
  
  // Tab切换
  switchTab(name) {
    wx.switchTab({ url: pages[name] || name })
  },
  
  // 返回
  back(delta = 1) {
    wx.navigateBack({ delta })
  },
  
  // 构建URL
  buildUrl(path, params) {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    return query ? `${path}?${query}` : path
  }
}

// 使用示例
import router from '../../router/index'

// 跳转到答题页
router.push('practice', { categoryId: '123', type: 'daily' })

// 跳转到解析页
router.redirect('analysis', { examId: '456' })

// 返回首页
router.reLaunch('home')
```

---

## 三、用户信息管理

### 存储方案

**本地缓存（storage.js）**
```javascript
// utils/storage.js
export default {
  // 用户信息
  setUserInfo(data) {
    wx.setStorageSync('userInfo', data)
  },
  
  getUserInfo() {
    return wx.getStorageSync('userInfo') || null
  },
  
  // 登录状态
  setLoginStatus(status) {
    wx.setStorageSync('isLogin', status)
  },
  
  isLogin() {
    return wx.getStorageSync('isLogin') || false
  },
  
  // 答题记录（临时）
  setPracticeCache(data) {
    wx.setStorageSync('practiceCache', data)
  },
  
  getPracticeCache() {
    return wx.getStorageSync('practiceCache') || null
  },
  
  clearPracticeCache() {
    wx.removeStorageSync('practiceCache')
  },
  
  // 清除所有缓存
  clearAll() {
    wx.clearStorageSync()
  }
}
```

**用户信息结构**
```javascript
{
  userId: '123',
  phone: '13800138000',
  nickname: '考公人',
  avatar: 'https://...',
  examType: 'gwy',  // 考试类型：gwy-公务员, sydw-事业单位
  studyDays: 30,    // 学习天数
  totalQuestions: 1500  // 累计做题数
}
```

### 登录鉴权（auth.js）

```javascript
// utils/auth.js
import storage from './storage'
import router from '../router/index'

export default {
  // 检查登录状态
  checkLogin() {
    return storage.isLogin()
  },
  
  // 登录拦截
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
            router.push('login')
          }
        }
      })
      return false
    }
  },
  
  // 退出登录
  logout() {
    storage.clearAll()
    router.reLaunch('home')
  }
}

// 使用示例
import auth from '../../utils/auth'

// 页面中检查登录
onLoad() {
  auth.requireLogin(() => {
    this.loadData()
  })
}
```

---

## 四、分包配置

### 分包策略
- 主包：首页、答题、解析、个人中心、登录（核心功能）
- 分包：申论、面试、课程、错题本、收藏夹（独立模块）

### app.json配置

```json
{
  "pages": [
    "pages/home/home",
    "pages/practice/practice",
    "pages/answer-card/answer-card",
    "pages/analysis/analysis",
    "pages/profile/profile",
    "pages/auth/login/login"
  ],
  "subpackages": [
    {
      "root": "subpackages/essay",
      "name": "essay",
      "pages": [
        "index/index",
        "practice/practice",
        "analysis/analysis"
      ]
    },
    {
      "root": "subpackages/wrong-book",
      "name": "wrongBook",
      "pages": [
        "index/index",
        "practice/practice"
      ]
    },
    {
      "root": "subpackages/course",
      "name": "course",
      "pages": [
        "list/list",
        "detail/detail"
      ]
    }
  ],
  "preloadRule": {
    "pages/home/home": {
      "network": "all",
      "packages": ["wrongBook"]
    }
  },
  "lazyCodeLoading": "requiredComponents"
}
```

---

## 五、题目数据处理

### 题目数据结构

```javascript
// mock/questions.js
{
  questionId: 'q001',
  type: 'single',  // single-单选, multiple-多选, judge-判断
  category: '言语理解',
  subCategory: '逻辑填空',
  difficulty: 'medium',  // easy, medium, hard
  content: '题干内容...',
  options: [
    { key: 'A', value: '选项A' },
    { key: 'B', value: '选项B' },
    { key: 'C', value: '选项C' },
    { key: 'D', value: '选项D' }
  ],
  answer: 'A',  // 或 ['A', 'B'] 多选
  analysis: '解析内容...',
  knowledge: ['知识点1', '知识点2'],
  source: '2023年国考',
  year: 2023
}
```

### 题目处理工具（question.js）

```javascript
// utils/question.js
export default {
  // 判断答案是否正确
  checkAnswer(userAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer)) {
      return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())
    }
    return userAnswer === correctAnswer
  },
  
  // 计算正确率
  calculateAccuracy(answers) {
    const correct = answers.filter(item => item.isCorrect).length
    return ((correct / answers.length) * 100).toFixed(1)
  },
  
  // 统计答题情况
  getStatistics(answers) {
    return {
      total: answers.length,
      answered: answers.filter(item => item.userAnswer).length,
      correct: answers.filter(item => item.isCorrect).length,
      wrong: answers.filter(item => !item.isCorrect && item.userAnswer).length,
      marked: answers.filter(item => item.isMarked).length
    }
  },
  
  // 按分类统计
  groupByCategory(questions) {
    return questions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = []
      }
      acc[q.category].push(q)
      return acc
    }, {})
  }
}
```

---

## 六、时间处理

### 时间工具（time.js）

```javascript
// utils/time.js
export default {
  // 格式化时间
  format(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
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
  
  // 倒计时格式化
  formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  },
  
  // 计算用时
  calculateDuration(startTime, endTime) {
    const duration = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}分${seconds}秒`
  },
  
  // 获取今天日期
  getToday() {
    return this.format(new Date(), 'YYYY-MM-DD')
  }
}
```

---

## 七、全局配置

### 配置文件（config/index.js）

```javascript
// config/index.js
export default {
  // 考试类型
  examTypes: [
    { id: 'gwy', name: '公务员' },
    { id: 'sydw', name: '事业单位' },
    { id: 'jy', name: '教师招聘' },
    { id: 'yh', name: '银行招聘' }
  ],
  
  // 题目分类
  categories: [
    { id: 'politics', name: '政治理论' },
    { id: 'common', name: '常识判断' },
    { id: 'verbal', name: '言语理解与表达' },
    { id: 'math', name: '数量关系' },
    { id: 'logic', name: '判断推理' },
    { id: 'data', name: '资料分析' }
  ],
  
  // 练习模式
  practiceTypes: [
    { id: 'daily', name: '每日一练', icon: 'calendar' },
    { id: 'special', name: '专项练习', icon: 'folder' },
    { id: 'mock', name: '模拟考试', icon: 'edit' },
    { id: 'real', name: '历年真题', icon: 'file' }
  ],
  
  // 答题卡状态颜色
  answerCardColors: {
    unanswered: '#E5E5E5',  // 未答
    answered: '#0052D9',     // 已答
    marked: '#FF9800',       // 标记
    correct: '#00A870',      // 正确
    wrong: '#E34D59'         // 错误
  }
}
```

### 应用入口（app.js）

```javascript
// app.js
import storage from './utils/storage'
import config from './config/index'

App({
  onLaunch() {
    // 获取系统信息
    this.getSystemInfo()
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 检查更新
    this.checkUpdate()
  },
  
  getSystemInfo() {
    const windowInfo = wx.getWindowInfo()
    const capsule = wx.getMenuButtonBoundingClientRect()
    
    this.globalData.statusBarHeight = windowInfo.statusBarHeight
    this.globalData.navBarHeight = capsule.height + (capsule.top - windowInfo.statusBarHeight) * 2
    this.globalData.screenWidth = windowInfo.screenWidth
    this.globalData.screenHeight = windowInfo.screenHeight
  },
  
  checkLoginStatus() {
    const isLogin = storage.isLogin()
    this.globalData.isLogin = isLogin
  },
  
  checkUpdate() {
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },
  
  globalData: {
    isLogin: false,
    statusBarHeight: 0,
    navBarHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    config
  }
})
```

---

## 八、常用业务场景

### 1. 答题页面逻辑

```javascript
// pages/practice/practice.js
import storage from '../../utils/storage'
import question from '../../utils/question'
import time from '../../utils/time'

Page({
  data: {
    questions: [],        // 题目列表
    currentIndex: 0,      // 当前题目索引
    answers: [],          // 用户答案
    startTime: 0,         // 开始时间
    countdown: 3600       // 倒计时（秒）
  },
  
  onLoad(options) {
    this.loadQuestions(options.categoryId)
    this.startTimer()
  },
  
  // 加载题目
  loadQuestions(categoryId) {
    // 从缓存或接口获取题目
    const questions = storage.getPracticeCache() || []
    const answers = questions.map(() => ({
      userAnswer: null,
      isMarked: false,
      isCorrect: false
    }))
    
    this.setData({
      questions,
      answers,
      startTime: Date.now()
    })
  },
  
  // 选择答案
  selectAnswer(e) {
    const { answer } = e.currentTarget.dataset
    const { currentIndex, answers } = this.data
    
    answers[currentIndex].userAnswer = answer
    this.setData({ answers })
  },
  
  // 标记题目
  markQuestion() {
    const { currentIndex, answers } = this.data
    answers[currentIndex].isMarked = !answers[currentIndex].isMarked
    this.setData({ answers })
  },
  
  // 上一题
  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1
      })
    }
  },
  
  // 下一题
  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      })
    }
  },
  
  // 提交答卷
  submitExam() {
    wx.showModal({
      title: '提示',
      content: '确认提交答卷吗？',
      success: (res) => {
        if (res.confirm) {
          this.calculateScore()
        }
      }
    })
  },
  
  // 计算成绩
  calculateScore() {
    const { questions, answers } = this.data
    
    answers.forEach((item, index) => {
      item.isCorrect = question.checkAnswer(
        item.userAnswer,
        questions[index].answer
      )
    })
    
    const accuracy = question.calculateAccuracy(answers)
    const duration = time.calculateDuration(this.data.startTime, Date.now())
    
    // 跳转到解析页
    router.redirect('analysis', {
      accuracy,
      duration,
      examId: 'xxx'
    })
  },
  
  // 倒计时
  startTimer() {
    this.timer = setInterval(() => {
      if (this.data.countdown > 0) {
        this.setData({
          countdown: this.data.countdown - 1
        })
      } else {
        this.submitExam()
      }
    }, 1000)
  },
  
  onUnload() {
    clearInterval(this.timer)
  }
})
```

### 2. 答题卡组件

```javascript
// components/global/answer-card/answer-card.js
Component({
  properties: {
    questions: {
      type: Array,
      value: []
    },
    answers: {
      type: Array,
      value: []
    },
    currentIndex: {
      type: Number,
      value: 0
    }
  },
  
  methods: {
    // 跳转到指定题目
    jumpToQuestion(e) {
      const { index } = e.currentTarget.dataset
      this.triggerEvent('jump', { index })
    },
    
    // 获取题目状态
    getQuestionStatus(index) {
      const answer = this.data.answers[index]
      if (!answer) return 'unanswered'
      
      if (answer.isMarked) return 'marked'
      if (answer.userAnswer) return 'answered'
      return 'unanswered'
    }
  }
})
```

---

## 九、组件化设计

### 全局组件示例

**题目组件（question-item）**
```javascript
// components/global/question-item/question-item.js
Component({
  properties: {
    question: Object,
    answer: Object,
    showAnalysis: Boolean
  },
  
  methods: {
    selectOption(e) {
      const { key } = e.currentTarget.dataset
      this.triggerEvent('select', { answer: key })
    }
  }
})
```

**空状态组件（empty-state）**
```javascript
// components/global/empty-state/empty-state.js
Component({
  properties: {
    type: {
      type: String,
      value: 'default'  // default, noData, noNetwork
    },
    text: {
      type: String,
      value: '暂无数据'
    }
  }
})
```

---

## 十、通用工具函数（toolbox/tool.js）

### 常用业务工具

```javascript
// toolbox/tool.js
export default {
  // 弹窗提示
  toast(msg, icon = 'none', duration = 2000) {
    return new Promise(resolve =>
      wx.showToast({
        title: msg,
        icon,
        duration,
        complete() {
          setTimeout(() => resolve(), duration)
        }
      })
    )
  },
  
  // 确认对话框
  modal(title, content, cancelText = '取消', confirmText = '确定') {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title,
        content,
        cancelText,
        confirmText,
        success(res) {
          if (res.confirm) {
            resolve('确认')
          } else if (res.cancel) {
            resolve('取消')
          }
        },
        fail(err) {
          reject(err)
        }
      })
    })
  },
  
  // Loading显示
  showLoading(title = '加载中...', mask = true) {
    wx.showLoading({ title, mask })
  },
  
  hideLoading(delay = 0) {
    setTimeout(() => {
      wx.hideLoading()
    }, delay)
  },
  
  // 数据格式转换（适配某些后端格式）
  transformValueObject(obj) {
    const newObj = {}
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        newObj[key] = { value: '' }
      } else if (Array.isArray(obj[key])) {
        newObj[key] = { value: obj[key] }
      } else {
        newObj[key] = { value: obj[key] }
      }
    }
    return newObj
  },
  
  // 批量转换
  transformValueArray(array) {
    return array.map(item => this.transformValueObject(item))
  },
  
  // 数组差集
  subSet(arr1, arr2) {
    const set1 = new Set(arr1)
    const set2 = new Set(arr2)
    const subset = []
    for (let item of set1) {
      if (!set2.has(item)) {
        subset.push(item)
      }
    }
    return subset
  },
  
  // 日期格式化
  dateFormat(fmt, date) {
    const opt = {
      'Y+': date.getFullYear().toString(),
      'm+': (date.getMonth() + 1).toString(),
      'd+': date.getDate().toString(),
      'H+': date.getHours().toString(),
      'M+': date.getMinutes().toString(),
      'S+': date.getSeconds().toString()
    }
    for (let k in opt) {
      const ret = new RegExp('(' + k + ')').exec(fmt)
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
      }
    }
    return fmt
  },
  
  // 表情编码（防止特殊字符问题）
  utf16toEntities(str) {
    const patt = /[\ud800-\udbff][\udc00-\udfff]/g
    str = str.replace(patt, (char) => {
      if (char.length === 2) {
        const H = char.charCodeAt(0)
        const L = char.charCodeAt(1)
        const code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00
        return `&#${code};`
      }
      return char
    })
    return str
  },
  
  // 表情解码
  entitiestoUtf16(strObj) {
    const patt = /&#\d+;/g
    const arr = strObj.match(patt) || []
    for (let i = 0; i < arr.length; i++) {
      let code = arr[i].replace('&#', '').replace(';', '')
      const H = Math.floor((code - 0x10000) / 0x400) + 0xD800
      const L = ((code - 0x10000) % 0x400) + 0xDC00
      const s = String.fromCharCode(H, L)
      strObj = strObj.replace(arr[i], s)
    }
    return strObj
  },
  
  // 云函数调用（如使用云开发）
  callCloud(options) {
    return wx.cloud.callFunction(options).then(res => res).catch(e => {
      throw e
    })
  },
  
  // 分享配置
  shareMenu() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }
}
```

---

## 十一、系统工具（utils/systems.js）

```javascript
// utils/systems.js
export default {
  // 检查小程序更新
  update() {
    const updateManager = wx.getUpdateManager()
    
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
        
        updateManager.onUpdateFailed(() => {
          wx.showModal({
            title: '更新失败',
            content: '新版本下载失败，请删除小程序后重新搜索打开',
            showCancel: false
          })
        })
      }
    })
  },
  
  // 分享到朋友圈配置
  shareTimeline() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  
  // 获取设备信息
  getSystemInfo() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    })
  }
}
```

---

## 十二、性能优化建议

### 1. 分包加载
- 主包控制在2MB以内
- 按业务模块拆分分包
- 使用`lazyCodeLoading`按需加载组件
- 配置预加载规则提升体验

```json
{
  "lazyCodeLoading": "requiredComponents",
  "preloadRule": {
    "pages/home/home": {
      "network": "all",
      "packages": ["wrongBook"]
    }
  }
}
```

### 2. 图片优化
- 使用CDN加速
- 图片懒加载
- 使用WebP格式
- 控制图片尺寸和质量

### 3. 数据缓存
- 合理使用`wx.setStorageSync`缓存常用数据
- 避免频繁请求相同数据
- 使用云开发数据库缓存用户数据（可选）
- 答题进度实时保存，防止数据丢失

### 4. 请求优化
- 合并多个请求
- 设置合理的超时时间
- 使用静默查询避免频繁loading
- 请求失败自动重试机制

### 5. 代码优化
- 使用ES6+语法
- 避免在循环中创建函数
- 及时清理定时器和监听器
- 避免频繁setData，合并数据更新
- 使用节流防抖优化高频操作

### 6. 渲染优化
- 长列表使用虚拟列表
- 使用`wx:if`而非`hidden`减少渲染
- 避免过深的组件嵌套
- 合理使用`pure`组件

---

---

## 十三、云开发数据模型（可选）

如果使用微信云开发，可参考以下数据模型设计：

### 数据库集合设计

```javascript
// model/database.js
const db = wx.cloud.database()
const _ = db.command

export default class {
  constructor() {
    this.userdb = db.collection('users')          // 用户表
    this.favoritesdb = db.collection('favorites') // 收藏表
    this.wrongsdb = db.collection('wrongs')       // 错题表
    this.historydb = db.collection('history')     // 答题记录表
  }
  
  get date() {
    return new Date()
  }
  
  get _() {
    return _
  }
}
```

### 用户模型（model/index.js）

```javascript
// model/index.js
import database from './database'

export default class extends database {
  // 用户注册
  register() {
    return this.userdb.add({
      data: {
        nickname: '',
        name: '',
        phone: '',
        avatar_url: '',
        exam_type: '',
        sign_time: this.date
      }
    })
  }
  
  // 获取用户信息
  getUserInfo() {
    return this.userdb.where({
      _openid: '{openid}'
    }).limit(1).get()
  }
  
  // 更新用户信息
  updateUserInfo(_id, data) {
    return this.userdb.doc(_id).update({ data })
  }
  
  // 添加收藏
  addFavorite(data) {
    return this.favoritesdb.add({ data })
  }
  
  // 获取收藏列表
  getFavorites() {
    return this.favoritesdb.where({
      _openid: '{openid}'
    }).get()
  }
  
  // 移除收藏
  removeFavorite(_id) {
    return this.favoritesdb.doc(_id).remove()
  }
  
  // 添加错题
  addWrong(data) {
    return this.wrongsdb.add({ data })
  }
  
  // 获取错题列表
  getWrongs() {
    return this.wrongsdb.where({
      _openid: '{openid}'
    }).get()
  }
  
  // 移除错题
  removeWrong(_id) {
    return this.wrongsdb.doc(_id).remove()
  }
  
  // 添加答题记录
  addHistory(data) {
    return this.historydb.add({ data })
  }
  
  // 获取答题记录
  getHistory() {
    return this.historydb.where({
      _openid: '{openid}'
    }).orderBy('create_time', 'desc').get()
  }
}
```

---

## 十四、自定义TabBar

### 配置（app.json）

```json
{
  "tabBar": {
    "custom": true,
    "list": [
      {
        "pagePath": "pages/home/home",
        "text": "首页"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的"
      }
    ]
  }
}
```

### 实现（custom-tab-bar/index.js）

```javascript
Component({
  data: {
    active: 0,
    list: [
      {
        pagePath: '/pages/home/home',
        text: '首页',
        iconPath: '/images/tabbar/home.png',
        selectedIconPath: '/images/tabbar/home-active.png'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        iconPath: '/images/tabbar/my.png',
        selectedIconPath: '/images/tabbar/my-active.png'
      }
    ]
  },
  
  methods: {
    onChange(e) {
      const index = e.detail
      const url = this.data.list[index].pagePath
      wx.switchTab({ url })
    }
  }
})

// 页面中更新TabBar选中状态
Page({
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0  // 当前页面索引
      })
    }
  }
})
```

---

## 十五、隐私协议组件

### 组件实现（components/privacy/privacy.js）

```javascript
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  
  methods: {
    // 同意协议
    agree() {
      this.triggerEvent('agree')
      this.setData({ show: false })
    },
    
    // 拒绝协议
    disagree() {
      this.triggerEvent('disagree')
      wx.showToast({
        title: '您已拒绝隐私授权',
        icon: 'none'
      })
    },
    
    // 查看协议详情
    viewDetail() {
      // 跳转到协议页面
    }
  }
})
```

### 使用示例

```javascript
Page({
  data: {
    showPrivacy: false
  },
  
  onLoad() {
    // 检查是否已同意隐私协议
    const agreed = wx.getStorageSync('privacyAgreed')
    if (!agreed) {
      this.setData({ showPrivacy: true })
    }
  },
  
  onAgreePrivacy() {
    wx.setStorageSync('privacyAgreed', true)
    // 继续业务逻辑
  },
  
  onDisagreePrivacy() {
    // 限制功能使用
  }
})
```

---

## 十六、开发规范

### 命名规范
- 页面/组件：小写中划线 `answer-card`
- JS变量：小驼峰 `currentIndex`
- 常量：大写下划线 `MAX_COUNT`
- CSS类名：小写中划线 `question-item`

### 注释规范
```javascript
/**
 * 计算答题正确率
 * @param {Array} answers - 答案数组
 * @returns {String} 正确率百分比
 */
calculateAccuracy(answers) {
  // 实现逻辑
}
```

### Git提交规范
```
feat: 新增答题卡功能
fix: 修复倒计时bug
style: 优化题目样式
refactor: 重构路由模块
docs: 更新README
```

---

## 十七、调试技巧

### 1. 环境切换
如果使用API环境配置，修改`config/api-config.js`：
```javascript
const ENV = 'dev'  // 开发环境
const ENV = 'prod' // 生产环境
```

### 2. 调试样式
```css
/* 临时背景色调试 */
.debug { background: rgba(100,100,0,0.5); }
.debug-red { background: rgba(255,0,0,0.3); }
```

### 3. 日志输出
```javascript
console.log('数据:', data)
console.error('错误:', error)
console.table(list)  // 表格形式输出数组
console.time('计时开始')
console.timeEnd('计时开始')
```

### 4. 真机调试
- 使用`vConsole`查看日志
- 开启性能面板监控
- 使用体验评分工具

---

## 十八、注意事项

1. **隐私协议** - 使用`getPhoneNumber`等敏感API需配置隐私协议
2. **页面栈限制** - 最多10层，超出需使用`redirectTo`或`reLaunch`
3. **云开发环境** - 生产环境需单独配置环境ID
4. **Token管理** - 定期刷新token，避免过期
5. **错误处理** - 所有异步操作需try-catch
6. **兼容性** - 注意微信版本兼容性，使用`wx.canIUse`检查
7. **分包大小** - 单个分包不超过2MB，总包不超过20MB
8. **setData优化** - 单次setData数据不超过1MB
9. **图片格式** - 优先使用WebP，注意iOS兼容性
10. **定时器清理** - 页面卸载时必须清理定时器

---

## 十九、常见问题解决

### 1. 页面栈溢出
```javascript
// router/index.js 中自动处理
push(name, params = {}) {
  const url = this.buildUrl(pages[name] || name, params)
  wx.navigateTo({
    url,
    fail: (e) => {
      if (e.errMsg && e.errMsg.includes('limit exceed')) {
        wx.showModal({
          title: '提示',
          content: '页面层级过多，是否刷新？',
          success: (res) => {
            if (res.confirm) {
              wx.reLaunch({ url: '/pages/home/home' })
            }
          }
        })
      }
    }
  })
}
```

### 2. 数据丢失问题
```javascript
// 答题页面实时保存进度
onAnswerChange() {
  storage.setPracticeCache({
    questions: this.data.questions,
    answers: this.data.answers,
    currentIndex: this.data.currentIndex,
    startTime: this.data.startTime
  })
}

// 页面加载时恢复
onLoad() {
  const cache = storage.getPracticeCache()
  if (cache) {
    wx.showModal({
      title: '提示',
      content: '检测到未完成的答题，是否继续？',
      success: (res) => {
        if (res.confirm) {
          this.setData(cache)
        } else {
          storage.clearPracticeCache()
          this.loadNewQuestions()
        }
      }
    })
  }
}
```

### 3. 图片加载失败
```javascript
// 图片组件添加错误处理
<image 
  src="{{imageUrl}}" 
  binderror="onImageError"
  mode="aspectFill"
/>

onImageError(e) {
  const index = e.currentTarget.dataset.index
  this.setData({
    [`list[${index}].imageUrl`]: '/images/default.png'
  })
}
```

---

## 总结

这套框架专为公考教育行业设计，融合了实战经验和最佳实践：

✅ **通用性强** - 不依赖特定后端，易于适配各种API  
✅ **模块化设计** - 清晰的分包和组件化架构  
✅ **可扩展性** - 预留申论、面试等模块接口  
✅ **易于维护** - 统一的路由、存储、工具函数封装  
✅ **高性能** - 完善的缓存策略和优化方案  
✅ **工具齐全** - 丰富的业务工具函数和系统工具  
✅ **组件完善** - 登录、隐私、TabBar等常用组件  
✅ **云开发支持** - 可选的云开发数据模型  

可直接应用于公务员、事业单位、教师招聘等各类考试刷题小程序开发，支持原生开发或TDesign等UI框架。
