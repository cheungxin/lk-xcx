# 实现任务列表：公考刷题小程序

## 概述

本任务列表基于 civil-service-exam-practice 的设计文档和需求文档，将功能拆解为可执行的开发任务。项目基于 xcx-software 微信小程序基座，使用原生开发（WXML + WXSS + JavaScript）+ TDesign 组件库，所有数据使用 Mock 数据。

## 任务列表

### 1. 基础设施搭建

- [x] 1.1 配置 TDesign 组件库和分包结构
  - 在 app.json 中配置全局 TDesign 组件引用
  - 配置主包和独立分包结构（practice、analytics、math、resources）
  - 配置分包预加载规则
  - 配置 Skyline 渲染引擎和 lazyCodeLoading
  - _需求: 25, 26_

- [x] 1.2 创建 Mock 数据文件
  - 创建 miniprogram/mock/mock-questions.js（题库数据，包含单选、多选、判断、材料题）
  - 创建 miniprogram/mock/mock-papers.js（试卷数据）
  - 创建 miniprogram/mock/mock-users.js（用户数据）
  - 创建 miniprogram/mock/mock-knowledge.js（考点结构树）
  - 创建 miniprogram/mock/mock-materials.js（材料题数据）
  - _需求: 3, 18, 19_

- [x] 1.3 创建服务层基础框架
  - 创建 miniprogram/services/auth-service.js（认证服务，模拟登录）
  - 创建 miniprogram/services/question-service.js（题库服务）
  - 创建 miniprogram/services/record-service.js（答题记录服务）
  - 创建 miniprogram/services/statistics-service.js（统计服务）
  - 创建 miniprogram/services/user-service.js（用户服务）
  - _需求: 1, 3, 10, 11_

- [x] 1.4 创建样式变量和主题文件
  - 创建 miniprogram/styles/variables.wxss（颜色、字体、间距、圆角、阴影变量）
  - 创建 miniprogram/styles/theme.wxss（主题样式）
  - 创建 miniprogram/styles/dark-mode.wxss（暗黑模式样式）
  - 在 app.wxss 中引入全局样式
  - _需求: 15, 27_

- [x] 1.5 配置路由常量
  - 在 miniprogram/router/index.js 中添加所有页面路由常量
  - 包含主包路由、分包路由、预留分包路由
  - _需求: 所有页面跳转相关_

### 2. 主包全局组件开发（最小化自定义组件）

**说明**：主包组件应尽量使用 TDesign 现成组件，只在必要时创建自定义组件

- [x] 2.1 配置全局 TDesign 组件
  - 在 app.json 中全局注册常用 TDesign 组件：
    - t-button（按钮）
    - t-cell / t-cell-group（单元格/列表）
    - t-dialog（对话框）
    - t-popup（弹出层）
    - t-tabs / t-tab-panel（标签页）
    - t-radio / t-radio-group（单选）
    - t-checkbox / t-checkbox-group（多选）
    - t-input（输入框）
    - t-stepper（步进器）
    - t-switch（开关）
    - t-picker（选择器）
    - t-toast（轻提示）
    - t-loading（加载）
    - t-empty（空状态）
    - t-icon（图标）
  - _需求: 26_

- [x] 2.2 创建考试类型选择器（使用 TDesign）
  - 不创建独立组件，直接在首页使用 t-popup + t-radio-group
  - 考试类型列表：国考、省考、事业单位、选调生、申论、面试
  - 选择后保存到本地存储
  - _需求: 2_

### 3. 登录模块开发

- [x] 3.1 创建登录页面（使用 TDesign）
  - 创建 miniprogram/pages/login/（login.js/json/wxml/wxss）
  - 实现微信授权登录 UI（使用 t-button，type="primary"）
  - 协议勾选（使用 t-checkbox）
  - 调用 auth-service 模拟登录
  - 登录成功后保存 token 和用户信息到本地存储
  - 跳转到首页
  - _需求: 1_

- [x] 3.2 实现登录态管理
  - 在 app.js 的 onLaunch 中检查登录态
  - 在需要登录的页面 onLoad 中检查登录态
  - 未登录时跳转到登录页
  - _需求: 1_

### 4. 首页模块开发

- [x] 4.1 创建首页基础结构
  - 创建 miniprogram/pages/home/（home.js/json/wxml/wxss）
  - 实现顶部导航栏（考试类型切换、搜索、AI 入口）
  - 实现 TabBar 配置（首页、我的）
  - _需求: 2_

- [x] 4.2 实现刷题设置面板（使用 TDesign 组件）
  - 不创建独立组件，直接在首页使用 TDesign 组件组合：
    - 题目数量：t-stepper（范围 1-200）
    - 题型选择：t-checkbox-group（单选、多选、判断、材料题）
    - 考点选择：t-popup + 考点树（使用 t-cell-group 实现）
    - 难度筛选：t-radio-group（1-5 星）
    - 随机顺序：t-switch
  - 使用 t-popup 弹出设置面板
  - _需求: 3_

- [x] 4.3 实现考场模式入口卡片（使用 TDesign）
  - 不创建独立组件，使用 t-cell 或自定义 view 实现卡片样式
  - 显示考场模式介绍和入口按钮（t-button）
  - 点击跳转到试卷列表页
  - _需求: 6, 18_

- [x] 4.4 实现历年试卷列表（使用 TDesign）
  - 创建 miniprogram/pages/paper-list/（paper-list.js/json/wxml/wxss）
  - 从 Mock 数据加载试卷列表
  - 筛选器（使用 t-dropdown-menu：年份、省份、考试类型）
  - 试卷列表（使用 t-cell-group + t-cell）
  - 每个试卷显示：标题、年份、省份、题目数量、时长
  - 点击试卷显示详情（使用 t-dialog）和开始考试按钮（t-button）
  - _需求: 18_

- [x] 4.5 实现考点结构树页面（使用 TDesign）
  - 创建 miniprogram/pages/knowledge-tree/（knowledge-tree.js/json/wxml/wxss）
  - 从 Mock 数据加载考点树
  - 实现树形结构展示（使用 t-cell-group 嵌套实现，可展开/折叠）
  - 显示每个考点下的题目数量
  - 点击考点可选择并开始刷题（t-button）
  - _需求: 19_

- [x] 4.6 实现开始刷题功能
  - 在首页点击"开始刷题"按钮
  - 验证刷题设置（题目数量、题型等）
  - 调用 question-service 获取题目列表
  - 跳转到答题页（practice-xingce 分包）
  - _需求: 3, 4_

### 5. 我的模块开发

- [x] 5.1 创建我的页面基础结构（使用 TDesign）
  - 创建 miniprogram/pages/profile/（profile.js/json/wxml/wxss）
  - 用户信息卡片：使用 t-cell + 自定义样式（头像、昵称、考试类型）
  - 统计卡片：使用自定义 view 布局（总答题数、正确率、连续天数、练习次数）
  - _需求: 11, 20_

- [x] 5.2 实现功能菜单列表（使用 TDesign）
  - 使用 t-cell-group + t-cell 展示功能菜单
  - 包含：错题本、我的收藏、练习记录、刷题报告、刷题日历、个人信息、问题建议
  - 每个 t-cell 配置：left-icon（图标）、title（标题）、note（数量）、arrow（右箭头）
  - 点击跳转到对应页面
  - _需求: 8, 9, 10, 12, 13, 20_

- [ ] 5.3 创建个人信息页面（使用 TDesign）
  - 创建 miniprogram/pages/user-info/（user-info.js/json/wxml/wxss）
  - 使用 t-cell-group 显示用户信息
  - 昵称编辑（t-input）
  - 头像更换（使用 wx.chooseImage API）
  - 手机号显示（t-cell）
  - 考试类型切换（t-picker）
  - 保存按钮（t-button）
  - 保存修改到本地存储
  - _需求: 20_

### 6. 答题练习分包（practice）- 核心答题功能

**说明**：分包内组件只能在分包内使用，不能被主包引用

- [x] 6.1 创建答题页面基础结构
  - 创建 miniprogram/subpackages/practice/pages/practice/（practice.js/json/wxml/wxss）
  - 顶部导航栏：自定义 view（题号、倒计时、设置按钮）
  - 底部操作栏：使用 t-button（上一题、下一题、答题卡、提交）
  - 支持三种模式：practice（刷题模式）、analysis（解析模式）、exam（考场模式）
  - _需求: 4, 5, 6_

- [ ] 6.2 创建题目卡片组件（分包内组件）
  - 创建 miniprogram/subpackages/practice/components/question-card/
  - 显示题目类型、难度、内容
  - 支持题目图片显示（使用 image 标签）
  - 根据模式显示不同状态（答题中、已答、显示解析）
  - **注意**：此组件只能在 practice 分包内使用
  - _需求: 4, 5, 6_

- [ ] 6.3 实现答案选项（使用 TDesign）
  - 不创建独立组件，直接使用 TDesign 组件：
    - 单选题：t-radio-group + t-radio
    - 多选题：t-checkbox-group + t-checkbox
    - 判断题：t-radio-group + t-radio（正确/错误）
  - 自定义样式实现选中状态和正确/错误状态
  - 解析模式下显示正确/错误标识（使用 t-icon）
  - _需求: 4, 5_

- [ ] 6.4 实现刷题模式答题逻辑
  - 加载题目列表
  - 记录用户答案到 data.answers 对象
  - 支持上一题/下一题切换
  - 支持题目跳转
  - 不显示答案和解析
  - _需求: 4_

- [ ] 6.5 实现解析模式答题逻辑
  - 用户选择答案后立即显示正确答案和解析
  - 标记用户答案的正确性（绿色/红色）
  - 显示解析内容和知识点
  - 支持继续下一题
  - _需求: 5_

- [ ] 6.6 实现考场模式答题逻辑
  - 显示试卷信息和温馨提示
  - 开始计时（倒计时）
  - 剩余时间少于 10 分钟时显示提醒
  - 时间结束自动提交
  - 不显示答案和解析
  - _需求: 6_

- [ ] 6.7 实现答题计时器
  - 在 onLoad 时记录开始时间
  - 使用 setInterval 更新计时器
  - 考场模式显示倒计时
  - 其他模式显示正计时
  - 在 onUnload 时清除计时器
  - _需求: 6, 10_

### 7. 答题练习分包（practice）- 答题卡功能

- [ ] 7.1 创建答题卡面板组件（分包内组件）
  - 创建 miniprogram/subpackages/practice/components/answer-sheet-panel/
  - 显示答题卡标题和进度（已答/总题数）
  - 实现答题卡网格（5 列布局，使用 grid 或 flex）
  - 用不同颜色标识已答、未答、当前题目
  - 点击题号跳转到对应题目
  - 显示图例说明
  - **注意**：此组件只能在 practice 分包内使用
  - _需求: 7_

- [ ] 7.2 实现答题卡弹出逻辑（使用 TDesign）
  - 点击答题卡按钮显示答题卡面板（使用 t-popup）
  - 答题卡居中显示（placement="center"）
  - 点击题号后关闭答题卡并跳转
  - 点击遮罩层关闭答题卡
  - _需求: 7_

### 8. 答题练习分包（practice）- 材料题支持

- [ ] 8.1 创建材料题组件（分包内组件）
  - 创建 miniprogram/subpackages/practice/components/material-question/
  - 显示材料内容（支持文字和图片）
  - 支持材料折叠/展开（使用自定义按钮或 t-collapse）
  - 显示关联的题目列表
  - 在材料题之间切换时保持材料可见
  - **注意**：此组件只能在 practice 分包内使用
  - _需求: 16_

### 9. 答题练习分包（practice）- 涂鸦功能

- [ ] 9.1 创建涂鸦画板组件（分包内组件）
  - 创建 miniprogram/subpackages/practice/components/drawing-board/
  - 使用 Canvas 2D API 实现绘图
  - 工具栏使用 t-button（画笔、橡皮擦、清空、关闭）
  - 画笔颜色选择（使用 t-radio-group 或自定义颜色选择器）
  - 画笔粗细调节（使用 t-slider）
  - **注意**：此组件只能在 practice 分包内使用
  - _需求: 14_

- [ ] 9.2 实现涂鸦功能集成（使用 TDesign）
  - 在答题页添加涂鸦按钮（t-button）
  - 点击显示涂鸦画板（使用 t-popup，placement="bottom"）
  - 涂鸦内容不随题目切换而清除（可选）
  - _需求: 14_

### 10. 答题练习分包（practice）- 暗黑模式

- [ ] 10.1 实现暗黑模式切换（使用 TDesign）
  - 在答题页设置面板添加暗黑模式开关（t-switch）
  - 切换时动态修改页面样式类（添加/移除 dark-mode 类）
  - 调整背景色、文字色、组件颜色（使用 CSS 变量）
  - 保存用户偏好设置到本地存储
  - _需求: 15_

### 11. 答题练习分包（practice）- 答题结果和记录保存

- [ ] 11.1 实现答题提交逻辑（使用 TDesign）
  - 点击提交按钮显示确认对话框（t-dialog）
  - 计算答题结果（正确数、错误数、未答数）
  - 调用 record-service 保存答题记录
  - 更新错题本（调用 updateWrongQuestions）
  - 更新统计数据（调用 updateStatistics）
  - 跳转到结果页
  - _需求: 4, 5, 6, 10, 22_

- [ ] 11.2 创建答题结果页面（使用 TDesign）
  - 创建 miniprogram/subpackages/practice/pages/result/（result.js/json/wxml/wxss）
  - 显示答题统计（使用自定义卡片布局）
  - 题目列表筛选（使用 t-tabs：全部/正确/错误）
  - 每道题使用 t-cell 或自定义组件显示
  - 收藏按钮（t-button + t-icon）
  - 底部操作按钮（t-button：再来一次、返回首页）
  - _需求: 4, 5, 6_

### 12. 统计分析分包（analytics）- 错题本功能

- [ ] 12.1 创建错题本列表页面（使用 TDesign）
  - 创建 miniprogram/subpackages/analytics/pages/wrong-questions/（wrong-questions.js/json/wxml/wxss）
  - 从本地存储加载错题列表
  - 筛选器（使用 t-dropdown-menu：科目、考点）
  - 错题列表（使用 t-cell-group + t-cell）
  - 每个错题显示：题目摘要、错误次数、最后错误时间
  - 操作按钮（t-button：标记已掌握、删除、开始练习）
  - 空状态（使用 t-empty）
  - _需求: 8_

- [ ] 12.2 实现错题本更新逻辑
  - 在 record-service 的 updateWrongQuestions 方法中实现
  - 答错的题目添加到错题本
  - 同一题目多次答错累计错误次数
  - 确保同一题目在错题本中只有一条记录
  - _需求: 8, 22_

### 13. 统计分析分包（analytics）- 收藏功能

- [ ] 13.1 实现收藏题目功能（使用 TDesign）
  - 在答题页和结果页添加收藏按钮（t-button + t-icon）
  - 点击收藏显示笔记输入框（t-dialog + t-textarea）
  - 保存收藏到本地存储
  - 确保同一用户对同一题目只能收藏一次
  - _需求: 9, 22_

- [ ] 13.2 创建收藏列表页面（使用 TDesign）
  - 创建 miniprogram/subpackages/analytics/pages/collections/（collections.js/json/wxml/wxss）
  - 从本地存储加载收藏列表
  - 收藏列表（使用 t-cell-group + t-cell）
  - 每个收藏显示：题目摘要、用户笔记、收藏时间
  - 操作按钮（t-button：编辑笔记、取消收藏、开始练习）
  - 空状态（使用 t-empty）
  - _需求: 9_

### 14. 统计分析分包（analytics）- 练习记录功能

- [ ] 14.1 创建练习记录列表页面（使用 TDesign）
  - 创建 miniprogram/subpackages/analytics/pages/practice-records/（practice-records.js/json/wxml/wxss）
  - 从本地存储加载练习记录列表
  - 模式筛选（使用 t-tabs：全部/练习/解析/考场）
  - 记录列表（使用 t-cell-group + t-cell）
  - 每条记录显示：模式、题目数量、正确率、用时、日期
  - 操作按钮（t-button：查看详情、删除）
  - 空状态（使用 t-empty）
  - _需求: 10_

- [ ] 14.2 实现练习记录详情页面（使用 TDesign）
  - 显示完整的答题记录信息（使用自定义卡片）
  - 题目列表（使用 t-cell-group）
  - 每道题显示用户答案、正确答案、解析
  - 收藏按钮（t-button + t-icon）
  - _需求: 10_

### 15. 统计分析分包（analytics）- 刷题报告功能

- [ ] 15.1 创建刷题报告页面（使用 TDesign）
  - 创建 miniprogram/subpackages/analytics/pages/practice-report/（practice-report.js/json/wxml/wxss）
  - 调用 statistics-service 获取报告数据
  - 统计卡片（使用自定义 view 布局）：总题数、正确数、正确率、总时长、平均时长
  - 时间范围切换（使用 t-tabs：7 天、30 天、90 天）
  - 每日答题趋势图表（使用简单的柱状图或折线图，可使用 Canvas 或第三方图表库）
  - 科目统计（使用 t-cell-group）：按科目显示答题分布和正确率
  - _需求: 12_

### 16. 统计分析分包（analytics）- 刷题日历功能

- [ ] 16.1 创建刷题日历热力图组件（分包内组件）
  - 创建 miniprogram/subpackages/analytics/components/calendar-heatmap/
  - 生成最近 90 天的日历数据
  - 根据每日答题数量显示不同颜色深度（0-4 级）
  - 使用 grid 或 flex 布局实现日历网格
  - 点击日期显示该天的详细答题数据（使用 t-popup）
  - **注意**：此组件只能在 analytics 分包内使用
  - _需求: 13_

- [ ] 16.2 创建刷题日历页面（使用 TDesign）
  - 创建 miniprogram/subpackages/analytics/pages/practice-calendar/（practice-calendar.js/json/wxml/wxss）
  - 使用 calendar-heatmap 组件显示热力图
  - 统计卡片（使用自定义 view）：连续刷题天数、总刷题天数、当月刷题统计
  - 图例说明（使用 t-cell 或自定义 view）
  - _需求: 13_

### 17. 数资数算分包（math）开发

- [ ] 17.1 创建数资数算专项首页（使用 TDesign）
  - 创建 miniprogram/subpackages/math/pages/home/（home.js/json/wxml/wxss）
  - 题目分类列表（使用 t-cell-group + t-cell）
  - 每个分类显示题目数量
  - 开始练习按钮（t-button）
  - _需求: 17_

- [ ] 17.2 创建计算器组件（分包内组件）
  - 创建 miniprogram/subpackages/math/components/calculator/
  - 实现基本四则运算（使用 t-button 实现按键）
  - 支持小数点和负数
  - 支持清除和退格
  - 显示计算历史（使用 scroll-view）
  - **注意**：此组件只能在 math 分包内使用
  - _需求: 17_

- [ ] 17.3 创建草稿纸组件（分包内组件）
  - 创建 miniprogram/subpackages/math/components/draft-paper/
  - 使用 Canvas 实现手写功能
  - 工具栏（使用 t-button：画笔、橡皮擦、清空）
  - 支持保存草稿
  - **注意**：此组件只能在 math 分包内使用
  - _需求: 17_

- [ ] 17.4 创建数资数算答题页面（使用 TDesign）
  - 创建 miniprogram/subpackages/math/pages/practice/（practice.js/json/wxml/wxss）
  - 复用答题练习分包的答题逻辑（通过服务层共享）
  - 集成计算器和草稿纸组件
  - 支持图表题显示（使用 image 或 Canvas）
  - 底部工具栏（t-button：计算器、草稿纸、答题卡）
  - _需求: 17_

### 18. 资源管理分包（resources）开发（预留）

**说明**：此分包为预留功能，可在 MVP 完成后再实现

- [ ]* 18.1 创建答题卡扫描页面（使用 TDesign）
  - 创建 miniprogram/subpackages/resources/pages/scan/（scan.js/json/wxml/wxss）
  - 使用相机 API 扫描答题卡（wx.chooseImage + OCR）
  - 识别答题卡上的答案
  - 显示识别结果（使用 t-cell-group）
  - 确认按钮（t-button）
  - _需求: 扩展功能_

- [ ]* 18.2 创建答题卡下载页面（使用 TDesign）
  - 创建 miniprogram/subpackages/resources/pages/download/（download.js/json/wxml/wxss）
  - 生成答题卡 PDF（使用 Canvas 绘制）
  - 下载按钮（t-button）
  - 分享按钮（t-button）
  - _需求: 扩展功能_

### 19. 申论分包（essay）开发（预留扩展）

**说明**：申论模块为预留扩展功能，建议在行测模块完成后再开发

- [ ]* 19.1 创建申论专项首页
  - 创建 miniprogram/subpackages/essay/pages/home/（home.js/json/wxml/wxss）
  - 申论题目分类（使用 t-cell-group）：归纳概括、综合分析、提出对策、应用文写作、文章写作
  - 历年申论真题列表
  - 范文库入口
  - _需求: 扩展功能_

- [ ]* 19.2 创建申论答题页面
  - 创建 miniprogram/subpackages/essay/pages/practice/（practice.js/json/wxml/wxss）
  - 材料阅读区（支持折叠/展开）
  - 答题输入区（使用 t-textarea，支持字数统计）
  - 工具栏（t-button：保存草稿、提交、查看范文）
  - 倒计时功能
  - _需求: 扩展功能_

- [ ]* 19.3 创建申论批改页面
  - 创建 miniprogram/subpackages/essay/pages/review/（review.js/json/wxml/wxss）
  - 显示用户答案和参考答案对比
  - AI 批改建议（模拟）
  - 评分卡片（内容、结构、语言、格式）
  - 范文参考
  - _需求: 扩展功能_

- [ ]* 19.4 创建申论范文库页面
  - 创建 miniprogram/subpackages/essay/pages/samples/（samples.js/json/wxml/wxss）
  - 范文列表（使用 t-cell-group）
  - 范文详情（标题、材料、范文、点评）
  - 收藏功能
  - _需求: 扩展功能_

### 20. 面试分包（interview）开发（预留扩展）

**说明**：面试模块为预留扩展功能，建议在行测和申论模块完成后再开发

- [ ]* 20.1 创建面试专项首页
  - 创建 miniprogram/subpackages/interview/pages/home/（home.js/json/wxml/wxss）
  - 面试题目分类（使用 t-cell-group）：综合分析、计划组织、人际关系、应急应变、自我认知
  - 历年面试真题列表
  - 面试技巧库入口
  - _需求: 扩展功能_

- [ ]* 20.2 创建面试答题页面
  - 创建 miniprogram/subpackages/interview/pages/practice/（practice.js/json/wxml/wxss）
  - 题目显示区
  - 思考时间倒计时
  - 答题时间倒计时
  - 录音功能（wx.getRecorderManager）
  - 答题要点提示（可选）
  - _需求: 扩展功能_

- [ ]* 20.3 创建面试评分页面
  - 创建 miniprogram/subpackages/interview/pages/score/（score.js/json/wxml/wxss）
  - 播放录音
  - 评分卡片（内容、逻辑、语言、仪态）
  - 参考答案和答题要点
  - 改进建议
  - _需求: 扩展功能_

- [ ]* 20.4 创建面试技巧库页面
  - 创建 miniprogram/subpackages/interview/pages/tips/（tips.js/json/wxml/wxss）
  - 技巧分类列表（使用 t-cell-group）
  - 技巧详情（标题、内容、案例）
  - 收藏功能
  - _需求: 扩展功能_

### 21. 样式和主题优化

- [ ] 21.1 实现像素级还原
  - 根据设计稿调整所有页面样式
  - 确保颜色、字体、间距、圆角符合设计规范
  - 优化 TDesign 组件样式覆盖（使用 external-classes 或全局样式）
  - _需求: 26, 27_

- [ ] 21.2 实现响应式适配
  - 使用 rpx 单位确保不同设备适配
  - 使用 flex 布局确保响应式效果
  - 测试不同屏幕尺寸的显示效果（iPhone SE、iPhone 14 Pro Max、iPad）
  - _需求: 27_

- [ ] 21.3 实现暗黑模式全局样式
  - 完善 dark-mode.wxss 样式文件
  - 确保所有页面和组件支持暗黑模式
  - 覆盖 TDesign 组件的暗黑模式样式
  - 测试暗黑模式下的视觉效果
  - _需求: 15_

### 22. 性能优化

- [ ] 22.1 实现数据缓存策略
  - 实现题目数据缓存（QuestionCache 类）
  - 实现用户数据缓存
  - 优化本地存储读写性能（批量操作、防抖）
  - _需求: 24_

- [ ] 22.2 优化列表渲染性能
  - 长列表使用虚拟列表或分页加载（wx:if 配合 scroll-view）
  - 优化 setData 调用（使用局部更新，避免频繁全量更新）
  - 图片使用懒加载（lazy-load 属性）
  - _需求: 24_

- [ ] 22.3 优化分包加载
  - 确保主包体积最小化（< 2MB）
  - 配置分包预加载规则（preloadRule）
  - 测试分包加载速度
  - 使用分包异步化（独立分包）
  - _需求: 25_

### 21. 测试和验证

- [ ]* 21.1 编写单元测试
  - 测试工具函数（日期格式化、数据转换等）
  - 测试业务服务层（题库服务、答题记录服务等）
  - 测试数据计算逻辑（正确率计算、连续天数计算等）
  - _需求: 22_

- [ ]* 21.2 编写属性测试
  - **属性 P1: 数据一致性** - 答题记录中的正确数、错误数、未答数之和必须等于题目总数
  - **验证需求: 22.1**
  - **属性 P4: 统计准确性** - 正确率计算必须准确
  - **验证需求: 11.2, 22.2**
  - **属性 P3: 时间顺序性** - 答题记录的开始时间必须早于或等于结束时间
  - **验证需求: 22.3**
  - **属性 P5: 错题本唯一性** - 同一题目在错题本中只能有一条记录
  - **验证需求: 8.7, 22.4**
  - **属性 P6: 收藏唯一性** - 同一用户对同一题目只能收藏一次
  - **验证需求: 9.6, 22.5**

- [ ]* 21.3 编写集成测试
  - 测试完整的刷题流程（设置 → 答题 → 提交 → 查看结果）
  - 测试错题本更新流程
  - 测试统计数据更新流程
  - 测试收藏功能流程
  - _需求: 4, 5, 6, 8, 9, 10, 11_

- [ ] 21.4 功能验证和 Bug 修复
  - 验证所有需求的验收标准
  - 测试边界情况和异常场景
  - 修复发现的 Bug
  - 优化用户体验
  - _需求: 23_

### 22. 检查点 - 确保所有测试通过

- [-] 22. 检查点 - 确保所有测试通过，询问用户是否有问题

## 注意事项

1. **任务标记说明**：
   - `[ ]` - 未开始的任务
   - `[ ]*` - 可选任务（测试相关或预留扩展功能），可以跳过以加快 MVP 开发
   - `[x]` - 已完成的任务

2. **需求引用**：每个任务都标注了对应的需求编号，便于追溯

3. **依赖关系**：任务按照合理的依赖顺序排列，建议按顺序执行

4. **分包策略**：
   - 主包：登录、首页、我的等核心页面
   - practice 独立分包：答题练习、答题卡、材料题、涂鸦、暗黑模式、答题结果
   - analytics 独立分包：错题本、收藏、练习记录、刷题报告、刷题日历
   - math 独立分包：数资数算专项（计算器、草稿纸）
   - resources 独立分包：答题卡扫描和下载（预留）
   - essay 独立分包：申论模块（预留扩展）
   - interview 独立分包：面试模块（预留扩展）

5. **组件使用规范（重要）**：
   - **优先使用 TDesign 组件**：能用 TDesign 的地方不要自己创建组件
   - **主包组件**：只在 app.json 中全局注册 TDesign 组件，不创建自定义全局组件
   - **分包组件**：分包内的自定义组件只能在该分包内使用，不能跨包引用
   - **组件隔离**：
     - practice 分包组件：question-card、material-question、drawing-board、answer-sheet-panel
     - analytics 分包组件：calendar-heatmap
     - math 分包组件：calculator、draft-paper
   - **避免重复**：不同分包如需相同功能，通过服务层共享逻辑，而非共享组件

6. **TDesign 组件清单**（已全局注册，直接使用）：
   - 基础组件：t-button、t-icon、t-cell、t-cell-group
   - 表单组件：t-input、t-textarea、t-radio、t-radio-group、t-checkbox、t-checkbox-group、t-switch、t-stepper、t-picker
   - 反馈组件：t-dialog、t-toast、t-loading、t-empty、t-popup
   - 导航组件：t-tabs、t-tab-panel、t-dropdown-menu
   - 其他组件：t-slider、t-collapse

7. **技术栈**：
   - 微信小程序原生开发（WXML + WXSS + JavaScript）
   - TDesign 组件库（最大化使用）
   - Skyline 渲染引擎
   - Mock 数据（不依赖后端）

8. **开发建议**：
   - 优先完成核心功能（登录、首页、答题、结果）
   - 可选任务（标记 `*`）可以在 MVP 完成后再实现
   - 每完成一个大任务后进行自测
   - 注意代码复用，通过服务层共享业务逻辑
   - 避免创建不必要的自定义组件

9. **后续扩展**：
   - 预留了申论（essay）、面试（interview）等分包
   - 预留了 API 接口定义，便于后续对接真实后端
   - 组件化设计便于功能扩展和复用
   - 考试类型已包含：国考、省考、事业单位、选调生、申论、面试

10. **命名规范**：
    - 页面目录：小写中划线，如 `answer-card`
    - 组件目录：小写中划线，如 `question-item`
    - 分包目录：小写单词，如 `practice`、`analytics`、`math`
    - JS 变量：小驼峰
    - 数据字段：小驼峰
    - WXML 类名：小写中划线

---

**文档版本**：v2.0  
**创建日期**：2024-01-15  
**最后更新**：2024-01-15  
**任务总数**：106 个（其中可选任务 21 个）  
**预计工期**：20-28 天（含扩展功能）  
**MVP 工期**：15-18 天（不含可选任务）
