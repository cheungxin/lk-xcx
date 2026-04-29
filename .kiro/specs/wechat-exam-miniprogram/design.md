# 公考刷题小程序设计文档

## 概述

本文档描述了公考刷题小程序的技术架构、组件设计、数据模型和交互流程。该小程序采用微信原生开发框架，遵循组件化、模块化的设计原则，通过合理的分包策略优化加载性能。

## 技术栈

- 开发框架：微信小程序原生框架（WXML + WXSS + JavaScript）
- 状态管理：本地缓存（wx.storage）+ 页面级状态管理
- UI设计：参考中公教育、华图教育等主流公考培训机构的设计风格
- 数据服务：Mock数据服务（前端模拟）

## 整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        小程序应用层                           │
├─────────────────────────────────────────────────────────────┤
│  登录页  │  首页  │  答题页  │  解析页  │  个人中心  │  ...  │
├─────────────────────────────────────────────────────────────┤
│                      全局组件层                              │
│  导航栏  │  TabBar  │  答题卡  │  题目卡片  │  设置面板  │  │
├─────────────────────────────────────────────────────────────┤
│                      业务逻辑层                              │
│  答题引擎  │  数据统计  │  状态管理  │  路由管理  │        │
├─────────────────────────────────────────────────────────────┤
│                      数据服务层                              │
│  Mock数据服务  │  本地缓存服务  │  工具函数库  │          │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
miniprogram/
├── app.js                    # 小程序入口文件
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── sitemap.json              # 搜索配置
│
├── pages/                    # 主包页面
│   ├── login/                # 登录页
│   ├── home/                 # 首页
│   ├── answer/               # 答题页
│   ├── analysis/             # 解析页
│   └── profile/              # 个人中心
│
├── subpackages/              # 分包
│   ├── essay/                # 申论模块（子包）
│   ├── interview/            # 面试模块（子包）
│   └── tools/                # 学习工具（子包）
│
├── components/               # 全局组件
│   ├── NavBar/               # 顶部导航栏
│   ├── TabBar/               # 底部标签栏
│   ├── AnswerSheet/          # 答题卡
│   ├── QuestionCard/         # 题目卡片
│   ├── OptionItem/           # 选项组件
│   ├── DrawingBoard/         # 涂鸦画板
│   └── SettingPanel/         # 设置面板
│
├── services/                 # 数据服务
│   ├── mock/                 # Mock数据
│   │   ├── question.js       # 题库数据
│   │   ├── user.js           # 用户数据
│   │   └── record.js         # 学习记录
│   ├── storage.js            # 本地缓存服务
│   └── api.js                # 数据接口封装
│
├── utils/                    # 工具函数
│   ├── time.js               # 时间处理
│   ├── format.js             # 数据格式化
│   └── validator.js          # 数据验证
│
└── constants/                # 常量定义
    ├── question-type.js      # 题目类型
    ├── answer-status.js      # 答题状态
    └── exam-config.js        # 考试配置
```


## 分包策略

### 主包（Main Package）

主包包含小程序启动必需的核心功能，大小控制在2MB以内。

**包含内容：**
- 登录页面（pages/login）
- 首页（pages/home）
- 答题页面（pages/answer）
- 解析页面（pages/analysis）
- 个人中心（pages/profile）
- 全局组件（components/）
- 核心服务和工具（services/、utils/、constants/）

### 子包（Sub Packages）

**1. 申论模块子包（subpackages/essay）**
- 申论首页
- 申论答题页
- 申论批改页
- 申论范文库

**2. 面试模块子包（subpackages/interview）**
- 面试题库
- 面试答题页
- 面试技巧

**3. 学习工具子包（subpackages/tools）**
- 估分工具
- 背诵工具
- 快练工具
- 学习报告

### 分包加载策略

- 使用独立分包（independent subpackage）加载申论和面试模块
- 使用普通分包加载学习工具模块
- 分包预下载：当用户进入首页时，预下载学习工具子包

## 核心组件设计

### 1. NavBar（顶部导航栏组件）

**功能：** 提供统一的顶部导航栏，支持自定义标题、返回按钮、右侧操作按钮。

**属性：**
```javascript
{
  title: String,           // 标题文字
  showBack: Boolean,       // 是否显示返回按钮
  rightText: String,       // 右侧文字按钮
  rightIcon: String,       // 右侧图标按钮
  backgroundColor: String  // 背景色
}
```

**使用场景：** 所有页面的顶部导航

### 2. AnswerSheet（答题卡组件）

**功能：** 展示所有题目的作答状态，支持快速跳转。

**属性：**
```javascript
{
  questions: Array,        // 题目列表
  currentIndex: Number,    // 当前题目索引
  answers: Object          // 用户答案对象
}
```

**状态标识：**
- 未作答：灰色背景
- 已作答：蓝色背景
- 已标记：黄色边框
- 当前题：红色边框

**交互：**
- 点击题号跳转到对应题目
- 支持滑动查看所有题目
- 显示已答/未答统计

### 3. QuestionCard（题目卡片组件）

**功能：** 展示题目内容，支持单选、多选、材料题等多种题型。

**属性：**
```javascript
{
  question: Object,        // 题目数据
  showAnswer: Boolean,     // 是否显示答案
  showAnalysis: Boolean,   // 是否显示解析
  userAnswer: String/Array // 用户答案
}
```

**题目数据结构：**
```javascript
{
  id: String,              // 题目ID
  type: String,            // 题型（single/multiple/material）
  content: String,         // 题目内容
  options: Array,          // 选项列表
  answer: String/Array,    // 正确答案
  analysis: String,        // 解析内容
  knowledge: Array,        // 知识点标签
  material: String         // 材料内容（材料题）
}
```

### 4. OptionItem（选项组件）

**功能：** 展示题目选项，支持文字和图片两种形式。

**属性：**
```javascript
{
  option: Object,          // 选项数据
  selected: Boolean,       // 是否选中
  correct: Boolean,        // 是否正确（解析模式）
  type: String             // 选项类型（radio/checkbox）
}
```

**交互：**
- 点击选中/取消选中
- 选中状态高亮显示
- 解析模式下显示正确/错误标识

### 5. DrawingBoard（涂鸦画板组件）

**功能：** 提供草稿纸功能，支持手写计算和涂鸦。

**属性：**
```javascript
{
  width: Number,           // 画板宽度
  height: Number,          // 画板高度
  lineWidth: Number,       // 线条粗细
  lineColor: String        // 线条颜色
}
```

**功能：**
- 支持手指绘制
- 提供橡皮擦功能
- 提供清空画板功能
- 支持保存涂鸦内容

### 6. SettingPanel（设置面板组件）

**功能：** 提供答题设置选项，支持模式切换、主题切换等。

**属性：**
```javascript
{
  visible: Boolean,        // 是否显示
  settings: Object         // 当前设置
}
```

**设置项：**
- 答题模式（练习/考试）
- 主题模式（明亮/暗黑）
- 字体大小（小/中/大）
- 自动下一题
- 答题提示音


## 数据模型

### 用户数据模型（User）

```javascript
{
  id: String,                    // 用户ID
  openid: String,                // 微信openid
  nickname: String,              // 昵称
  avatar: String,                // 头像URL
  studyDays: Number,             // 学习天数
  totalQuestions: Number,        // 总答题数
  correctRate: Number,           // 总正确率
  continuousDays: Number,        // 连续学习天数
  createdAt: Number,             // 注册时间戳
  lastLoginAt: Number            // 最后登录时间戳
}
```

### 题目数据模型（Question）

```javascript
{
  id: String,                    // 题目ID
  type: String,                  // 题型（single/multiple/material）
  subject: String,               // 科目（行测/公基）
  category: String,              // 分类（言语理解/数量关系等）
  difficulty: Number,            // 难度（1-5）
  content: String,               // 题目内容
  material: String,              // 材料内容（可选）
  options: [                     // 选项列表
    {
      key: String,               // 选项标识（A/B/C/D）
      content: String,           // 选项内容
      image: String              // 选项图片（可选）
    }
  ],
  answer: String | Array,        // 正确答案
  analysis: String,              // 解析内容
  knowledge: Array,              // 知识点标签
  year: Number,                  // 年份（真题）
  region: String,                // 地区（真题）
  source: String                 // 来源
}
```

### 答题记录模型（AnswerRecord）

```javascript
{
  id: String,                    // 记录ID
  userId: String,                // 用户ID
  examType: String,              // 考试类型（专项/套题/模拟）
  examId: String,                // 试卷ID
  examName: String,              // 试卷名称
  questions: Array,              // 题目ID列表
  answers: Object,               // 用户答案 {questionId: answer}
  correctAnswers: Object,        // 正确答案
  score: Number,                 // 得分
  correctRate: Number,           // 正确率
  totalTime: Number,             // 总用时（秒）
  startTime: Number,             // 开始时间戳
  endTime: Number,               // 结束时间戳
  status: String                 // 状态（进行中/已完成）
}
```

### 收藏数据模型（Collection）

```javascript
{
  id: String,                    // 收藏ID
  userId: String,                // 用户ID
  questionId: String,            // 题目ID
  createdAt: Number              // 收藏时间戳
}
```

### 错题数据模型（WrongQuestion）

```javascript
{
  id: String,                    // 错题ID
  userId: String,                // 用户ID
  questionId: String,            // 题目ID
  wrongCount: Number,            // 错误次数
  lastWrongAt: Number,           // 最近错误时间
  mastered: Boolean              // 是否已掌握
}
```

### 学习统计模型（StudyStats）

```javascript
{
  userId: String,                // 用户ID
  date: String,                  // 日期（YYYY-MM-DD）
  questionCount: Number,         // 答题数量
  correctCount: Number,          // 正确数量
  studyTime: Number,             // 学习时长（分钟）
  categories: Object             // 各科目统计
}
```

## 页面设计

### 1. 登录页（pages/login）

**布局：**
- 顶部：小程序Logo和名称
- 中部：登录说明文字
- 底部：微信授权登录按钮、隐私政策链接

**交互流程：**
1. 用户点击"微信授权登录"按钮
2. 调用wx.getUserProfile获取用户信息
3. 将用户信息存储到本地缓存
4. 跳转到首页

**状态管理：**
- 登录状态存储在本地缓存（key: userInfo）
- 每次启动检查登录状态

### 2. 首页（pages/home）

**布局结构：**
```
┌─────────────────────────────────┐
│  考试类型切换  │  AI问答  │  更多  │  ← 顶部导航区
├─────────────────────────────────┤
│        阶段刷题总结Banner         │  ← Banner区
├─────────────────────────────────┤
│  每日  最新  历年  套题  模拟    │  ← 快捷入口区
│  一练  时政  试卷  练习  试卷    │
├─────────────────────────────────┤
│  专项练习  │  自定义  │  考场模式 │  ← 功能区标题
├─────────────────────────────────┤
│  ○ 政治理论        0/226    ✏️  │
│  ○ 常识判断        0/7485   ✏️  │  ← 专项列表区
│  ○ 言语理解与表达  0/1350   ✏️  │
│  ○ 数量关系        0/5775   ✏️  │
│  ○ 判断推理        0/12528  ✏️  │
│  ○ 资料分析        0/6812   ✏️  │
├─────────────────────────────────┤
│  首页  估分  快练  背诵  我的    │  ← 底部TabBar
└─────────────────────────────────┘
```

**交互：**
- 考试类型切换：点击顶部下拉选择器，切换公务员/国家等类型
- 快捷入口：点击跳转到对应功能页面
- 专项练习：点击进入专项设置页面，点击编辑图标进入自定义设置

**数据加载：**
- 从Mock服务获取专项练习数据
- 从本地缓存读取用户答题进度
- 实时更新已完成题目数量

### 3. 答题页（pages/answer）

**布局结构：**
```
┌─────────────────────────────────┐
│  行测  │  1/100  │  45:30  │ ⚙️  │  ← 顶部状态栏
├─────────────────────────────────┤
│                                 │
│  题目内容区域                    │  ← 题目区
│  （支持滚动查看）                │
│                                 │
├─────────────────────────────────┤
│  A. 选项内容                     │
│  B. 选项内容                     │  ← 选项区
│  C. 选项内容                     │
│  D. 选项内容                     │
├─────────────────────────────────┤
│  ⭐标记  │  上一题  下一题  答题卡 │  ← 操作栏
└─────────────────────────────────┘
```

**交互流程：**
1. 页面加载时从路由参数获取试卷ID和题目列表
2. 从本地缓存读取答题进度（如果存在）
3. 渲染当前题目和选项
4. 用户选择答案，更新答案状态
5. 点击上一题/下一题切换题目
6. 每5秒自动保存答题进度到本地缓存
7. 点击提交按钮，弹出确认对话框
8. 确认后跳转到成绩页面

**特殊题型处理：**
- 材料题：在题目上方显示材料内容区域，支持固定或滚动
- 图片选项：选项以图片形式展示，支持点击放大
- 多选题：选项使用复选框样式，支持多选

**状态保存：**
```javascript
{
  examId: String,           // 试卷ID
  currentIndex: Number,     // 当前题目索引
  answers: Object,          // 答案对象
  markedQuestions: Array,   // 标记的题目
  startTime: Number,        // 开始时间
  usedTime: Number          // 已用时间
}
```


### 4. 答题卡浮层（组件形式）

**布局：**
```
┌─────────────────────────────────┐
│  答题卡  │  已答50  未答50  │  ✕  │  ← 标题栏
├─────────────────────────────────┤
│  1   2   3   4   5   6   7   8  │
│  9   10  11  12  13  14  15  16 │  ← 题号网格
│  17  18  19  20  21  22  23  24 │
│  ...                            │
├─────────────────────────────────┤
│  □ 未答  ■ 已答  ⭐ 标记        │  ← 状态说明
├─────────────────────────────────┤
│        返回答题  │  提交试卷     │  ← 操作按钮
└─────────────────────────────────┘
```

**交互：**
- 点击题号跳转到对应题目并关闭浮层
- 点击提交试卷弹出二次确认对话框
- 点击关闭按钮或遮罩层关闭浮层

### 5. 解析页（pages/analysis）

**布局结构：**
```
┌─────────────────────────────────┐
│  ← 返回  │  成绩报告              │  ← 导航栏
├─────────────────────────────────┤
│  得分：85分  │  用时：45分钟      │
│  正确率：85%  │  超过78%的用户    │  ← 成绩统计区
├─────────────────────────────────┤
│  全部(100)  正确(85)  错误(15)  │  ← 筛选标签
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 1. 题目内容...            │  │
│  │ 你的答案：A  正确答案：B   │  │  ← 题目列表
│  │ ✕ 错误                    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 2. 题目内容...            │  │
│  │ 你的答案：C  正确答案：C   │  │
│  │ ✓ 正确                    │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  查看详细报告  │  再练一次        │  ← 底部操作
└─────────────────────────────────┘
```

**交互：**
- 点击筛选标签切换显示全部/正确/错误题目
- 点击题目卡片进入单题解析页面
- 点击查看详细报告跳转到学习报告页面
- 点击再练一次重新开始该套题

### 6. 单题解析页（pages/question-detail）

**布局结构：**
```
┌─────────────────────────────────┐
│  ← 返回  │  题目解析  │  ⭐收藏  │  ← 导航栏
├─────────────────────────────────┤
│  题目内容区域                    │
│  （完整显示题目和选项）          │  ← 题目区
├─────────────────────────────────┤
│  你的答案：A                     │
│  正确答案：B                     │  ← 答案对比区
│  ✕ 回答错误                      │
├─────────────────────────────────┤
│  【解析】                        │
│  详细的解析内容...               │  ← 解析区
│                                 │
├─────────────────────────────────┤
│  知识点：#逻辑推理 #演绎推理     │  ← 知识点标签
├─────────────────────────────────┤
│  上一题  │  下一题                │  ← 导航按钮
└─────────────────────────────────┘
```

**交互：**
- 点击收藏按钮添加/取消收藏
- 点击知识点标签查看相关题目
- 点击上一题/下一题查看其他题目解析

### 7. 个人中心页（pages/profile）

**布局结构：**
```
┌─────────────────────────────────┐
│  [头像]  昵称                    │
│  已学习 30 天                    │  ← 用户信息区
├─────────────────────────────────┤
│  总答题数    正确率    连续天数   │
│   1250      85%        15       │  ← 数据统计区
├─────────────────────────────────┤
│  📚 我的收藏                  >  │
│  ❌ 错题本                    >  │
│  📝 练习记录                  >  │  ← 功能列表
│  📊 刷题报告                  >  │
│  📅 刷题日历                  >  │
│  ⚙️  设置                     >  │
├─────────────────────────────────┤
│  首页  估分  快练  背诵  我的    │  ← 底部TabBar
└─────────────────────────────────┘
```

**交互：**
- 点击头像进入个人信息编辑页面
- 点击各功能项进入对应页面
- 数据统计实时从本地缓存读取

## 交互设计

### 页面跳转逻辑

```
登录页 ──────────────────────────> 首页
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
            专项设置页          答题页            个人中心
                │                  │                  │
                └──────────> 答题页 ├──────────> 解析页
                                   │                  │
                                   └──────────> 单题解析页
```

### 答题流程

```
1. 用户选择练习类型（专项/套题/模拟）
   ↓
2. 进入练习设置页（选择题目数量、来源等）
   ↓
3. 点击开始练习，进入答题页
   ↓
4. 用户作答，系统自动保存进度
   ↓
5. 用户点击提交，弹出确认对话框
   ↓
6. 确认提交，系统计算成绩
   ↓
7. 跳转到解析页，显示成绩和题目列表
   ↓
8. 用户点击题目，查看详细解析
```

### 动画与过渡效果

**页面切换动画：**
- 使用微信小程序默认的页面切换动画（右滑进入）
- 返回操作使用左滑退出动画

**组件动画：**
- 答题卡浮层：从底部滑入（slide-up）
- 设置面板：从右侧滑入（slide-left）
- 选项选中：缩放动画（scale）+ 颜色渐变
- 提交成功：成功图标放大动画 + 震动反馈

**加载状态：**
- 页面加载：显示骨架屏（skeleton）
- 数据加载：显示loading组件
- 图片加载：显示占位图，加载完成后淡入

### 用户反馈

**触觉反馈：**
- 选择答案：轻微震动（wx.vibrateShort）
- 提交成功：震动反馈
- 答对题目：成功震动

**视觉反馈：**
- 按钮点击：按下状态（hover-class）
- 选项选中：高亮显示 + 边框变化
- 答题正确：绿色提示
- 答题错误：红色提示

**音效反馈（可选）：**
- 答题正确：成功音效
- 答题错误：错误音效
- 提交试卷：提示音效


## Mock数据服务设计

### 数据服务架构

```javascript
// services/api.js - 统一数据接口
class ApiService {
  // 获取题库数据
  async getQuestions(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = MockData.generateQuestions(params);
        resolve(data);
      }, 300);
    });
  }
  
  // 获取用户信息
  async getUserInfo(userId) {
    const userInfo = StorageService.get('userInfo');
    return Promise.resolve(userInfo);
  }
  
  // 保存答题记录
  async saveAnswerRecord(record) {
    const records = StorageService.get('answerRecords') || [];
    records.push(record);
    StorageService.set('answerRecords', records);
    return Promise.resolve(record);
  }
}
```

### Mock题库数据生成

```javascript
// services/mock/question.js
class QuestionMock {
  // 生成题目数据
  generateQuestions(params) {
    const { category, count, difficulty } = params;
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q_${Date.now()}_${i}`,
        type: this.randomType(),
        subject: '行测',
        category: category,
        difficulty: difficulty || this.randomDifficulty(),
        content: this.generateContent(category),
        options: this.generateOptions(),
        answer: this.generateAnswer(),
        analysis: this.generateAnalysis(),
        knowledge: this.generateKnowledge(category)
      });
    }
    
    return questions;
  }
  
  // 生成题目内容
  generateContent(category) {
    const templates = {
      '言语理解': '下列词语中，加点字的读音全都正确的一组是：',
      '数量关系': '某工厂生产一批零件，如果每天生产120个，需要15天完成...',
      '判断推理': '所有的金属都是导电的，铜是金属，所以：',
      '资料分析': '根据以下材料，回答问题：2023年某市GDP总量为...',
      '常识判断': '下列关于中国古代科技成就的说法，正确的是：'
    };
    return templates[category] || '这是一道测试题目';
  }
  
  // 生成选项
  generateOptions() {
    return [
      { key: 'A', content: '选项A的内容' },
      { key: 'B', content: '选项B的内容' },
      { key: 'C', content: '选项C的内容' },
      { key: 'D', content: '选项D的内容' }
    ];
  }
}
```

### 本地缓存服务

```javascript
// services/storage.js
class StorageService {
  // 存储数据
  static set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }
  
  // 读取数据
  static get(key) {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  }
  
  // 删除数据
  static remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  }
  
  // 清空所有数据
  static clear() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  }
}
```

## 命名规范

### 文件命名

**页面文件：** 使用kebab-case
```
pages/
  ├── login/
  ├── home/
  ├── answer-page/
  ├── question-detail/
  └── user-profile/
```

**组件文件：** 使用PascalCase
```
components/
  ├── NavBar/
  ├── AnswerSheet/
  ├── QuestionCard/
  └── DrawingBoard/
```

**工具文件：** 使用kebab-case
```
utils/
  ├── time-format.js
  ├── data-validator.js
  └── storage-helper.js
```

### 变量命名

**常量：** 使用UPPER_SNAKE_CASE
```javascript
const QUESTION_TYPE = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  MATERIAL: 'material'
};

const ANSWER_STATUS = {
  NOT_ANSWERED: 0,
  ANSWERED: 1,
  MARKED: 2
};
```

**变量和函数：** 使用camelCase
```javascript
let currentQuestionIndex = 0;
let userAnswerList = [];

function handleAnswerSelect(option) {
  // ...
}

function calculateScore(answers) {
  // ...
}
```

**组件属性：** 使用camelCase
```javascript
Component({
  properties: {
    questionData: Object,
    showAnswer: Boolean,
    currentIndex: Number
  }
});
```

### CSS类名

使用BEM命名规范（Block__Element--Modifier）

```css
/* 块 */
.question-card { }

/* 元素 */
.question-card__title { }
.question-card__content { }
.question-card__options { }

/* 修饰符 */
.question-card--selected { }
.question-card--correct { }
.question-card--wrong { }

/* 组合使用 */
.option-item { }
.option-item__label { }
.option-item__content { }
.option-item--selected { }
.option-item--disabled { }
```

## 性能优化策略

### 1. 分包加载优化

- 主包只包含核心功能，控制在2MB以内
- 使用独立分包加载申论、面试等扩展模块
- 配置分包预下载，提前加载常用子包

### 2. 图片优化

- 使用WebP格式图片，减小图片体积
- 图片懒加载，只加载可视区域的图片
- 使用CDN加速图片加载
- 提供不同尺寸的图片，根据设备选择合适尺寸

### 3. 数据缓存策略

- 题库数据缓存到本地，减少重复请求
- 用户答题进度实时保存到本地缓存
- 使用LRU算法管理缓存，自动清理过期数据

### 4. 渲染优化

- 使用虚拟列表渲染长列表（如题目列表）
- 避免频繁的setData操作，合并数据更新
- 使用节流和防抖优化高频事件处理

### 5. 代码优化

- 提取公共代码到工具函数
- 使用ES6+语法简化代码
- 避免在循环中创建函数
- 及时清理定时器和事件监听

## 错误处理策略

### 1. 网络错误处理

```javascript
async function fetchData() {
  try {
    const data = await ApiService.getQuestions();
    return data;
  } catch (error) {
    wx.showToast({
      title: '网络请求失败',
      icon: 'none'
    });
    return null;
  }
}
```

### 2. 数据验证

```javascript
function validateAnswer(answer, question) {
  if (!answer) {
    return { valid: false, message: '请选择答案' };
  }
  
  if (question.type === 'multiple' && !Array.isArray(answer)) {
    return { valid: false, message: '多选题答案格式错误' };
  }
  
  return { valid: true };
}
```

### 3. 异常捕获

```javascript
// app.js
App({
  onError(error) {
    console.error('App Error:', error);
    // 上报错误日志
  }
});

// 页面级错误处理
Page({
  onError(error) {
    console.error('Page Error:', error);
    wx.showToast({
      title: '页面出错了',
      icon: 'none'
    });
  }
});
```

## 测试策略

### 1. 单元测试

- 测试工具函数的正确性
- 测试数据验证逻辑
- 测试Mock数据生成函数

### 2. 组件测试

- 测试组件的渲染结果
- 测试组件的交互行为
- 测试组件的属性传递

### 3. 集成测试

- 测试完整的答题流程
- 测试数据保存和读取
- 测试页面跳转逻辑

### 4. 真机测试

- 在不同型号的手机上测试
- 测试不同网络环境下的表现
- 测试性能和内存占用

## 扩展性设计

### 1. 模块化设计

- 每个功能模块独立开发，便于维护
- 使用统一的接口规范，便于模块间通信
- 支持动态加载模块，便于功能扩展

### 2. 配置化设计

- 题目类型配置化，便于添加新题型
- 主题样式配置化，支持自定义主题
- 功能开关配置化，便于灰度发布

### 3. 插件化设计

- 支持第三方插件接入
- 提供插件开发文档和示例
- 插件沙箱隔离，保证安全性


## 多模块架构设计（解决申论、行测等模块共存问题）

### 问题分析

申论和行测/公基虽然都有答题、解析、收藏、错题等功能，但存在本质差异：

**行测/公基特点：**
- 客观题（单选、多选）
- 有标准答案
- 自动判分
- 答题卡展示题号网格

**申论特点：**
- 主观题（文字作答）
- 需要人工批改或AI评分
- 评分维度多样（立意、结构、语言等）
- 答题界面为文本输入框

### 解决方案：模块化 + 适配器模式

#### 1. 核心架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层（Pages）                          │
│  登录页  │  首页  │  个人中心  │  收藏列表  │  错题列表      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    模块适配层（Adapters）                     │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  行测模块适配器   │        │  申论模块适配器   │          │
│  │  - 答题页适配     │        │  - 答题页适配     │          │
│  │  - 解析页适配     │        │  - 解析页适配     │          │
│  │  - 数据模型适配   │        │  - 数据模型适配   │          │
│  └──────────────────┘        └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    通用组件层（Components）                   │
│  答题容器  │  解析容器  │  收藏管理  │  错题管理  │  ...     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    数据服务层（Services）                     │
│  统一数据接口  │  本地缓存  │  Mock服务  │  ...             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. 目录结构调整

```
miniprogram/
├── pages/                          # 主包页面
│   ├── login/                      # 登录页
│   ├── home/                       # 首页（统一入口）
│   ├── profile/                    # 个人中心（统一）
│   ├── collection/                 # 收藏列表（统一）
│   └── wrong-questions/            # 错题列表（统一）
│
├── modules/                        # 模块目录（新增）
│   ├── xingce/                     # 行测模块
│   │   ├── pages/                  # 行测专属页面
│   │   │   ├── answer/             # 行测答题页
│   │   │   ├── analysis/           # 行测解析页
│   │   │   └── question-detail/    # 行测题目详情
│   │   ├── components/             # 行测专属组件
│   │   │   ├── ObjectiveQuestion/  # 客观题组件
│   │   │   ├── AnswerSheet/        # 答题卡组件
│   │   │   └── OptionItem/         # 选项组件
│   │   ├── adapters/               # 行测适配器
│   │   │   └── xingce-adapter.js   # 行测模块适配器
│   │   └── constants/              # 行测常量
│   │
│   └── essay/                      # 申论模块（子包）
│       ├── pages/                  # 申论专属页面
│       │   ├── answer/             # 申论答题页
│       │   ├── analysis/           # 申论解析页
│       │   └── question-detail/    # 申论题目详情
│       ├── components/             # 申论专属组件
│       │   ├── SubjectiveQuestion/ # 主观题组件
│       │   ├── TextEditor/         # 文本编辑器
│       │   └── ScorePanel/         # 评分面板
│       ├── adapters/               # 申论适配器
│       │   └── essay-adapter.js    # 申论模块适配器
│       └── constants/              # 申论常量
│
├── components/                     # 通用组件
│   ├── NavBar/                     # 顶部导航栏
│   ├── QuestionContainer/          # 题目容器（通用）
│   ├── AnalysisContainer/          # 解析容器（通用）
│   └── CollectionManager/          # 收藏管理组件
│
├── services/                       # 数据服务
│   ├── question-service.js         # 题目服务（统一接口）
│   ├── collection-service.js       # 收藏服务（统一接口）
│   ├── wrong-question-service.js   # 错题服务（统一接口）
│   └── storage.js                  # 本地缓存服务
│
└── constants/                      # 全局常量
    └── module-type.js              # 模块类型定义
```

#### 3. 数据模型设计（支持多模块）

**题目数据模型（扩展版）**

```javascript
{
  id: String,                    // 题目ID
  moduleType: String,            // 模块类型（xingce/essay/interview）
  type: String,                  // 题型（single/multiple/material/subjective）
  subject: String,               // 科目（行测/公基/申论）
  category: String,              // 分类
  difficulty: Number,            // 难度
  content: String,               // 题目内容
  
  // 客观题专属字段
  options: Array,                // 选项列表（客观题）
  answer: String | Array,        // 正确答案（客观题）
  
  // 主观题专属字段
  wordLimit: Number,             // 字数限制（主观题）
  scoreRules: Object,            // 评分规则（主观题）
  referenceAnswer: String,       // 参考答案（主观题）
  
  // 通用字段
  analysis: String,              // 解析内容
  knowledge: Array,              // 知识点标签
  year: Number,                  // 年份
  region: String,                // 地区
  source: String                 // 来源
}
```

**收藏数据模型（扩展版）**

```javascript
{
  id: String,                    // 收藏ID
  userId: String,                // 用户ID
  moduleType: String,            // 模块类型（xingce/essay/interview）
  questionId: String,            // 题目ID
  questionType: String,          // 题型
  category: String,              // 分类
  createdAt: Number              // 收藏时间戳
}
```

**错题数据模型（扩展版）**

```javascript
{
  id: String,                    // 错题ID
  userId: String,                // 用户ID
  moduleType: String,            // 模块类型（xingce/essay/interview）
  questionId: String,            // 题目ID
  questionType: String,          // 题型
  wrongCount: Number,            // 错误次数
  lastWrongAt: Number,           // 最近错误时间
  userAnswer: String | Array,    // 用户答案
  correctAnswer: String | Array, // 正确答案
  mastered: Boolean              // 是否已掌握
}
```

#### 4. 模块适配器设计

**行测模块适配器（modules/xingce/adapters/xingce-adapter.js）**

```javascript
class XingceAdapter {
  // 获取答题页面路径
  getAnswerPagePath() {
    return '/modules/xingce/pages/answer/answer';
  }
  
  // 获取解析页面路径
  getAnalysisPagePath() {
    return '/modules/xingce/pages/analysis/analysis';
  }
  
  // 获取题目详情页面路径
  getQuestionDetailPath() {
    return '/modules/xingce/pages/question-detail/question-detail';
  }
  
  // 判断答案是否正确
  checkAnswer(userAnswer, correctAnswer, questionType) {
    if (questionType === 'single') {
      return userAnswer === correctAnswer;
    } else if (questionType === 'multiple') {
      return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
    }
    return false;
  }
  
  // 计算得分
  calculateScore(answers, questions) {
    let correctCount = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[question.id];
      if (this.checkAnswer(userAnswer, question.answer, question.type)) {
        correctCount++;
      }
    });
    return {
      score: (correctCount / questions.length * 100).toFixed(2),
      correctCount: correctCount,
      totalCount: questions.length
    };
  }
  
  // 格式化题目数据
  formatQuestionData(question) {
    return {
      ...question,
      moduleType: 'xingce',
      hasOptions: true,
      hasStandardAnswer: true
    };
  }
}

export default new XingceAdapter();
```

**申论模块适配器（modules/essay/adapters/essay-adapter.js）**

```javascript
class EssayAdapter {
  // 获取答题页面路径
  getAnswerPagePath() {
    return '/subpackages/essay/pages/answer/answer';
  }
  
  // 获取解析页面路径
  getAnalysisPagePath() {
    return '/subpackages/essay/pages/analysis/analysis';
  }
  
  // 获取题目详情页面路径
  getQuestionDetailPath() {
    return '/subpackages/essay/pages/question-detail/question-detail';
  }
  
  // 判断答案（申论需要AI评分或人工评分）
  checkAnswer(userAnswer, referenceAnswer) {
    // 申论没有标准答案，返回null表示需要评分
    return null;
  }
  
  // 计算得分（申论使用AI评分）
  async calculateScore(answers, questions) {
    // 模拟AI评分
    const scores = await this.aiScore(answers, questions);
    return {
      totalScore: scores.reduce((sum, s) => sum + s.score, 0),
      details: scores
    };
  }
  
  // AI评分（Mock实现）
  async aiScore(answers, questions) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scores = questions.map((question) => ({
          questionId: question.id,
          score: Math.floor(Math.random() * 20) + 60, // 60-80分
          dimensions: {
            idea: Math.floor(Math.random() * 10) + 15,      // 立意 15-25分
            structure: Math.floor(Math.random() * 10) + 15,  // 结构 15-25分
            language: Math.floor(Math.random() * 10) + 15    // 语言 15-25分
          }
        }));
        resolve(scores);
      }, 1000);
    });
  }
  
  // 格式化题目数据
  formatQuestionData(question) {
    return {
      ...question,
      moduleType: 'essay',
      hasOptions: false,
      hasStandardAnswer: false,
      needsManualScore: true
    };
  }
}

export default new EssayAdapter();
```

#### 5. 统一数据服务接口

**题目服务（services/question-service.js）**

```javascript
import XingceAdapter from '../modules/xingce/adapters/xingce-adapter';
import EssayAdapter from '../modules/essay/adapters/essay-adapter';

class QuestionService {
  // 获取模块适配器
  getAdapter(moduleType) {
    const adapters = {
      'xingce': XingceAdapter,
      'essay': EssayAdapter
    };
    return adapters[moduleType];
  }
  
  // 跳转到答题页面
  navigateToAnswer(moduleType, params) {
    const adapter = this.getAdapter(moduleType);
    const path = adapter.getAnswerPagePath();
    wx.navigateTo({
      url: `${path}?${this.buildQuery(params)}`
    });
  }
  
  // 跳转到解析页面
  navigateToAnalysis(moduleType, params) {
    const adapter = this.getAdapter(moduleType);
    const path = adapter.getAnalysisPagePath();
    wx.navigateTo({
      url: `${path}?${this.buildQuery(params)}`
    });
  }
  
  // 跳转到题目详情页面
  navigateToQuestionDetail(moduleType, params) {
    const adapter = this.getAdapter(moduleType);
    const path = adapter.getQuestionDetailPath();
    wx.navigateTo({
      url: `${path}?${this.buildQuery(params)}`
    });
  }
  
  // 构建查询字符串
  buildQuery(params) {
    return Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }
}

export default new QuestionService();
```

**收藏服务（services/collection-service.js）**

```javascript
import StorageService from './storage';

class CollectionService {
  // 添加收藏
  addCollection(userId, moduleType, questionId, questionData) {
    const collections = this.getCollections(userId);
    const collection = {
      id: `col_${Date.now()}`,
      userId: userId,
      moduleType: moduleType,
      questionId: questionId,
      questionType: questionData.type,
      category: questionData.category,
      createdAt: Date.now()
    };
    collections.push(collection);
    StorageService.set(`collections_${userId}`, collections);
    return collection;
  }
  
  // 获取收藏列表（支持按模块筛选）
  getCollections(userId, moduleType = null) {
    const collections = StorageService.get(`collections_${userId}`) || [];
    if (moduleType) {
      return collections.filter(c => c.moduleType === moduleType);
    }
    return collections;
  }
  
  // 删除收藏
  removeCollection(userId, collectionId) {
    const collections = this.getCollections(userId);
    const filtered = collections.filter(c => c.id !== collectionId);
    StorageService.set(`collections_${userId}`, filtered);
  }
  
  // 检查是否已收藏
  isCollected(userId, questionId) {
    const collections = this.getCollections(userId);
    return collections.some(c => c.questionId === questionId);
  }
}

export default new CollectionService();
```

**错题服务（services/wrong-question-service.js）**

```javascript
import StorageService from './storage';

class WrongQuestionService {
  // 添加错题
  addWrongQuestion(userId, moduleType, questionId, userAnswer, correctAnswer, questionData) {
    const wrongQuestions = this.getWrongQuestions(userId);
    const existing = wrongQuestions.find(w => w.questionId === questionId);
    
    if (existing) {
      // 已存在，增加错误次数
      existing.wrongCount++;
      existing.lastWrongAt = Date.now();
      existing.userAnswer = userAnswer;
    } else {
      // 新增错题
      wrongQuestions.push({
        id: `wrong_${Date.now()}`,
        userId: userId,
        moduleType: moduleType,
        questionId: questionId,
        questionType: questionData.type,
        wrongCount: 1,
        lastWrongAt: Date.now(),
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        mastered: false
      });
    }
    
    StorageService.set(`wrongQuestions_${userId}`, wrongQuestions);
  }
  
  // 获取错题列表（支持按模块筛选）
  getWrongQuestions(userId, moduleType = null) {
    const wrongQuestions = StorageService.get(`wrongQuestions_${userId}`) || [];
    if (moduleType) {
      return wrongQuestions.filter(w => w.moduleType === moduleType);
    }
    return wrongQuestions;
  }
  
  // 标记为已掌握
  markAsMastered(userId, wrongQuestionId) {
    const wrongQuestions = this.getWrongQuestions(userId);
    const wrongQuestion = wrongQuestions.find(w => w.id === wrongQuestionId);
    if (wrongQuestion) {
      wrongQuestion.mastered = true;
      StorageService.set(`wrongQuestions_${userId}`, wrongQuestions);
    }
  }
}

export default new WrongQuestionService();
```

#### 6. 统一收藏和错题列表页面

**收藏列表页面（pages/collection/collection.wxml）**

```xml
<view class="collection-page">
  <!-- 模块切换标签 -->
  <view class="module-tabs">
    <view 
      class="tab-item {{currentModule === 'xingce' ? 'active' : ''}}"
      bindtap="switchModule"
      data-module="xingce">
      行测
    </view>
    <view 
      class="tab-item {{currentModule === 'essay' ? 'active' : ''}}"
      bindtap="switchModule"
      data-module="essay">
      申论
    </view>
  </view>
  
  <!-- 收藏列表 -->
  <view class="collection-list">
    <view 
      class="collection-item"
      wx:for="{{collections}}"
      wx:key="id"
      bindtap="viewQuestion"
      data-item="{{item}}">
      <view class="question-preview">{{item.questionPreview}}</view>
      <view class="question-meta">
        <text class="category">{{item.category}}</text>
        <text class="time">{{item.createdTime}}</text>
      </view>
    </view>
  </view>
</view>
```

**收藏列表页面逻辑（pages/collection/collection.js）**

```javascript
import CollectionService from '../../services/collection-service';
import QuestionService from '../../services/question-service';

Page({
  data: {
    currentModule: 'xingce',  // 当前模块
    collections: []           // 收藏列表
  },
  
  onLoad() {
    this.loadCollections();
  },
  
  // 切换模块
  switchModule(e) {
    const module = e.currentTarget.dataset.module;
    this.setData({ currentModule: module });
    this.loadCollections();
  },
  
  // 加载收藏列表
  loadCollections() {
    const userId = 'current_user_id'; // 从缓存获取
    const collections = CollectionService.getCollections(userId, this.data.currentModule);
    this.setData({ collections });
  },
  
  // 查看题目详情
  viewQuestion(e) {
    const item = e.currentTarget.dataset.item;
    QuestionService.navigateToQuestionDetail(item.moduleType, {
      questionId: item.questionId
    });
  }
});
```

#### 7. app.json 配置（分包配置）

```json
{
  "pages": [
    "pages/login/login",
    "pages/home/home",
    "pages/profile/profile",
    "pages/collection/collection",
    "pages/wrong-questions/wrong-questions"
  ],
  "subpackages": [
    {
      "root": "modules/xingce",
      "name": "xingce",
      "pages": [
        "pages/answer/answer",
        "pages/analysis/analysis",
        "pages/question-detail/question-detail"
      ]
    },
    {
      "root": "modules/essay",
      "name": "essay",
      "independent": true,
      "pages": [
        "pages/answer/answer",
        "pages/analysis/analysis",
        "pages/question-detail/question-detail"
      ]
    }
  ],
  "preloadRule": {
    "pages/home/home": {
      "network": "all",
      "packages": ["xingce"]
    }
  }
}
```

### 总结

通过这种架构设计：

1. **答题页和解析页分离**：每个模块有自己的答题页和解析页，互不干扰
2. **数据模型统一**：通过moduleType字段区分不同模块的数据
3. **收藏和错题统一管理**：使用统一的服务接口，通过moduleType筛选
4. **适配器模式**：每个模块有自己的适配器，处理模块特有的逻辑
5. **易于扩展**：后续添加面试、公基等模块，只需新增对应的适配器和页面

