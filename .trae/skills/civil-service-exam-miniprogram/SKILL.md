---
name: civil-service-exam-miniprogram
description: 公考刷题小程序开发框架，结合TDesign组件库实现答题、解析、错题本等功能。当用户需要开发公考、教育类微信小程序，或需要实现登录鉴权、题目作答、答题卡、成绩统计等功能时使用。
---

# 公考刷题小程序开发框架

适用于公考/教育行业的微信小程序开发框架，结合TDesign组件库实现完整答题功能。

---

## 一、项目结构规范

```
miniprogram/
├── pages/                  # 主包页面
│   ├── home/              # 首页
│   ├── practice/          # 答题页
│   ├── answer-card/       # 答题卡
│   ├── analysis/          # 解析页
│   ├── profile/           # 个人中心
│   └── auth/              # 登录授权
├── subpackages/           # 分包（按业务模块）
│   ├── essay/             # 申论模块
│   ├── interview/         # 面试模块
│   ├── course/            # 课程模块
│   └── wrong-book/        # 错题本模块
├── components/            # 组件
│   ├── tdesign/           # TDesign组件封装
│   │   ├── button/        # 按钮封装
│   │   ├── dialog/        # 对话框封装
│   │   ├── toast/         # 轻提示封装
│   │   ├── grid/          # 宫格封装
│   │   ├── tab/           # 标签栏封装
│   │   └── card/          # 卡片封装
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
│   └── systems.js         # 系统相关
├── toolbox/               # 业务工具箱
│   ├── tool.js            # 业务工具函数
│   └── time.js            # 时间处理扩展
├── model/                 # 数据模型层
│   ├── index.js           # 用户、收藏、错题等模型
│   └── database.js        # 数据库连接配置
├── mock/                  # Mock数据
│   ├── questions.js       # 题库数据
│   ├── user.js            # 用户数据
│   └── statistics.js      # 统计数据
├── styles/                # 全局样式
│   ├── theme.wxss         # 主题变量
│   ├── common.wxss        # 通用样式
│   └── iconfont.wxss      # 图标字体
├── config/                # 配置文件
│   ├── index.js           # 全局配置
│   └── api-config.js      # API环境配置
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
  home: '/pages/home/home',
  practice: '/pages/practice/practice',
  answerCard: '/pages/answer-card/answer-card',
  analysis: '/pages/analysis/analysis',
  profile: '/pages/profile/profile',
  login: '/pages/auth/login/login',
  essay: '/subpackages/essay/index/index',
  wrongBook: '/subpackages/wrong-book/index/index',
}

export default {
  push(name, params = {}) {
    const url = this.buildUrl(pages[name] || name, params)
    wx.navigateTo({ url })
  },
  
  redirect(name, params = {}) {
    const url = this.buildUrl(pages[name] || name, params)
    wx.redirectTo({ url })
  },
  
  reLaunch(name, params = {}) {
    const url = this.buildUrl(pages[name] || name, params)
    wx.reLaunch({ url })
  },
  
  switchTab(name) {
    wx.switchTab({ url: pages[name] || name })
  },
  
  back(delta = 1) {
    wx.navigateBack({ delta })
  },
  
  buildUrl(path, params) {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    return query ? `${path}?${query}` : path
  }
}
```

---

## 三、用户信息管理

### 存储方案

```javascript
// utils/storage.js
export default {
  setUserInfo(data) {
    wx.setStorageSync('userInfo', data)
  },
  
  getUserInfo() {
    return wx.getStorageSync('userInfo') || null
  },
  
  setLoginStatus(status) {
    wx.setStorageSync('isLogin', status)
  },
  
  isLogin() {
    return wx.getStorageSync('isLogin') || false
  },
  
  setPracticeCache(data) {
    wx.setStorageSync('practiceCache', data)
  },
  
  getPracticeCache() {
    return wx.getStorageSync('practiceCache') || null
  },
  
  clearPracticeCache() {
    wx.removeStorageSync('practiceCache')
  },
  
  clearAll() {
    wx.clearStorageSync()
  }
}
```

### 用户信息结构

```javascript
{
  userId: '123',
  phone: '13800138000',
  nickname: '考公人',
  avatar: 'https://...',
  examType: 'gwy',
  studyDays: 30,
  totalQuestions: 1500
}
```

### 登录鉴权

```javascript
// utils/auth.js
import storage from './storage'
import router from '../router/index'

export default {
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
            router.push('login')
          }
        }
      })
      return false
    }
  },
  
  logout() {
    storage.clearAll()
    router.reLaunch('home')
  }
}
```

---

## 四、TDesign组件使用

### 组件引入

在页面的json配置中引入：

```json
{
  "usingComponents": {
    "t-button": "/components/tdesign/button/index",
    "t-dialog": "/components/tdesign/dialog/index",
    "t-toast": "/components/tdesign/toast/index",
    "t-grid": "/components/tdesign/grid/index",
    "t-grid-item": "/components/tdesign/grid-item/index",
    "t-tab-bar": "/components/tdesign/tab-bar/index",
    "t-tab-bar-item": "/components/tdesign/tab-bar-item/index",
    "t-card": "/components/tdesign/card/index"
  }
}
```

### 常用组件封装

#### 按钮组件

```xml
<!-- components/tdesign/button/index.wxml -->
<button 
  class="td-btn {{'td-btn--' + theme}} {{disabled ? 'td-btn--disabled' : ''}}"
  hover-class="td-btn--hover"
  bindtap="handleTap"
>
  <slot></slot>
</button>
```

```javascript
// components/tdesign/button/index.js
Component({
  properties: {
    theme: {
      type: String,
      value: 'primary'
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },
  
  methods: {
    handleTap(e) {
      if (!this.data.disabled) {
        this.triggerEvent('click', e)
      }
    }
  }
})
```

```css
/* components/tdesign/button/index.wxss */
.td-btn {
  padding: 24rpx 48rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  text-align: center;
}

.td-btn--primary {
  background: #0052D9;
  color: #fff;
}

.td-btn--default {
  background: #fff;
  color: #333;
  border: 1rpx solid #ddd;
}

.td-btn--disabled {
  opacity: 0.5;
}
```

#### Toast轻提示

```javascript
// components/tdesign/toast/index.js
Component({
  properties: {
    message: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false
    }
  },
  
  methods: {
    showToast(message, duration = 2000) {
      this.setData({ message, show: true })
      setTimeout(() => {
        this.setData({ show: false })
      }, duration)
    }
  }
})
```

#### 宫格组件

```xml
<!-- components/tdesign/grid/index.wxml -->
<view class="td-grid">
  <view 
    wx:for="{{items}}" 
    wx:key="index" 
    class="td-grid-item"
    bindtap="handleClick"
    data-index="{{index}}"
  >
    <image wx:if="{{item.icon}}" src="{{item.icon}}" class="td-grid-icon" />
    <text class="td-grid-label">{{item.label}}</text>
  </view>
</view>
```

### TDesign主题色

```css
/* styles/theme.wxss */
page {
  --td-primary-color: #0052D9;
  --td-success-color: #00A870;
  --td-warning-color: #FF9800;
  --td-error-color: #E34D59;
  --td-gray-1: #F5F5F5;
  --td-gray-2: #E5E5E5;
  --td-gray-3: #C5C5C5;
  --td-gray-4: #888888;
  --td-gray-5: #666666;
  --td-gray-6: #333333;
  --td-text-primary: #333333;
  --td-text-secondary: #666666;
  --td-text-disabled: #C5C5C5;
}
```

---

## 五、分包配置

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

## 六、题目数据处理

### 题目数据结构

```javascript
{
  questionId: 'q001',
  type: 'single',
  category: '言语理解',
  subCategory: '逻辑填空',
  difficulty: 'medium',
  content: '题干内容...',
  options: [
    { key: 'A', value: '选项A' },
    { key: 'B', value: '选项B' },
    { key: 'C', value: '选项C' },
    { key: 'D', value: '选项D' }
  ],
  answer: 'A',
  analysis: '解析内容...',
  knowledge: ['知识点1', '知识点2'],
  source: '2023年国考',
  year: 2023
}
```

### 题目处理工具

```javascript
// utils/question.js
export default {
  checkAnswer(userAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer)) {
      return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())
    }
    return userAnswer === correctAnswer
  },
  
  calculateAccuracy(answers) {
    const correct = answers.filter(item => item.isCorrect).length
    return ((correct / answers.length) * 100).toFixed(1)
  },
  
  getStatistics(answers) {
    return {
      total: answers.length,
      answered: answers.filter(item => item.userAnswer).length,
      correct: answers.filter(item => item.isCorrect).length,
      wrong: answers.filter(item => !item.isCorrect && item.userAnswer).length,
      marked: answers.filter(item => item.isMarked).length
    }
  },
  
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

## 七、时间处理

```javascript
// utils/time.js
export default {
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
  
  formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  },
  
  calculateDuration(startTime, endTime) {
    const duration = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}分${seconds}秒`
  },
  
  getToday() {
    return this.format(new Date(), 'YYYY-MM-DD')
  }
}
```

---

## 八、全局配置

```javascript
// config/index.js
export default {
  examTypes: [
    { id: 'gwy', name: '公务员' },
    { id: 'sydw', name: '事业单位' },
    { id: 'jy', name: '教师招聘' },
    { id: 'yh', name: '银行招聘' }
  ],
  
  categories: [
    { id: 'politics', name: '政治理论' },
    { id: 'common', name: '常识判断' },
    { id: 'verbal', name: '言语理解与表达' },
    { id: 'math', name: '数量关系' },
    { id: 'logic', name: '判断推理' },
    { id: 'data', name: '资料分析' }
  ],
  
  practiceTypes: [
    { id: 'daily', name: '每日一练', icon: 'calendar' },
    { id: 'special', name: '专项练习', icon: 'folder' },
    { id: 'mock', name: '模拟考试', icon: 'edit' },
    { id: 'real', name: '历年真题', icon: 'file' }
  ],
  
  answerCardColors: {
    unanswered: '#E5E5E5',
    answered: '#0052D9',
    marked: '#FF9800',
    correct: '#00A870',
    wrong: '#E34D59'
  }
}
```

---

## 九、应用入口

```javascript
// app.js
import storage from './utils/storage'
import config from './config/index'

App({
  onLaunch() {
    this.getSystemInfo()
    this.checkLoginStatus()
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

## 十、核心业务场景

### 1. 答题页面

```javascript
// pages/practice/practice.js
import storage from '../../utils/storage'
import question from '../../utils/question'
import time from '../../utils/time'
import router from '../../router/index'

Page({
  data: {
    questions: [],
    currentIndex: 0,
    answers: [],
    startTime: 0,
    countdown: 3600
  },
  
  onLoad(options) {
    this.loadQuestions(options.categoryId)
    this.startTimer()
  },
  
  loadQuestions(categoryId) {
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
  
  selectAnswer(e) {
    const { answer } = e.currentTarget.dataset
    const { currentIndex, answers } = this.data
    
    answers[currentIndex].userAnswer = answer
    this.setData({ answers })
  },
  
  markQuestion() {
    const { currentIndex, answers } = this.data
    answers[currentIndex].isMarked = !answers[currentIndex].isMarked
    this.setData({ answers })
  },
  
  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 })
    }
  },
  
  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 })
    }
  },
  
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
  
  calculateScore() {
    const { questions, answers } = this.data
    
    answers.forEach((item, index) => {
      item.isCorrect = question.checkAnswer(item.userAnswer, questions[index].answer)
    })
    
    const accuracy = question.calculateAccuracy(answers)
    const duration = time.calculateDuration(this.data.startTime, Date.now())
    
    router.redirect('analysis', { accuracy, duration, examId: 'xxx' })
  },
  
  startTimer() {
    this.timer = setInterval(() => {
      if (this.data.countdown > 0) {
        this.setData({ countdown: this.data.countdown - 1 })
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
// components/answer-card/answer-card.js
Component({
  properties: {
    questions: { type: Array, value: [] },
    answers: { type: Array, value: [] },
    currentIndex: { type: Number, value: 0 }
  },
  
  methods: {
    handleTap(e) {
      const { index } = e.currentTarget.dataset
      this.triggerEvent('change', { index })
    }
  }
})
```

### 3. 登录流程

```javascript
// pages/auth/login/login.js
import router from '../../../router/index'
import storage from '../../../utils/storage'

Page({
  data: {
    agreed: false
  },
  
  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed })
  },
  
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.handleLogin(e.detail.code)
    }
  },
  
  handleLogin(code) {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '登录中...' })
    
    setTimeout(() => {
      storage.setLoginStatus(true)
      storage.setUserInfo({ nickname: '用户', avatar: '' })
      wx.hideLoading()
      router.switchTab('home')
    }, 1000)
  }
})
```

---

## 十一、执行步骤

当用户需要开发公考刷题小程序时，按以下步骤执行：

1. **需求分析**：读取截图和需求文档，提炼功能点清单
2. **结构设计**：确定页面结构、分包策略、组件层级
3. **配置编写**：配置app.json路由、分包、导航栏
4. **工具封装**：实现storage、auth、router、question、time等工具
5. **组件开发**：开发TDesign封装组件和业务组件
6. **页面实现**：实现各页面逻辑和UI
7. **Mock数据**：编写完整的Mock数据结构
8. **样式统一**：统一主题色、间距、圆角等视觉规范
