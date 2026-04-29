# 公考刷题小程序实现任务清单

## 任务概述

本任务清单基于需求文档和设计文档，将小程序开发工作拆分为可执行的编码任务。每个任务都包含具体的实现目标和相关需求引用。

---

- [ ] 1. 项目初始化与基础架构搭建
  - 创建小程序项目结构，配置全局文件，建立开发规范
  - _需求: 14_

- [ ] 1.1 创建项目并配置app.json
  - 使用微信开发者工具创建小程序项目
  - 配置app.json：页面路由、窗口样式、TabBar、分包结构
  - 配置sitemap.json
  - _需求: 13, 14_

- [ ] 1.2 创建全局样式文件app.wxss
  - 定义CSS变量：主题色、辅助色、字体大小、间距、圆角
  - 定义通用样式类：flex布局、文字省略、按钮样式
  - 使用BEM命名规范
  - _需求: 14_

- [ ] 1.3 创建常量定义文件
  - constants/question-type.js：题目类型常量（SINGLE、MULTIPLE、MATERIAL、SUBJECTIVE）
  - constants/answer-status.js：答题状态常量（NOT_ANSWERED、ANSWERED、MARKED）
  - constants/exam-config.js：考试配置常量
  - constants/module-type.js：模块类型常量（XINGCE、ESSAY、INTERVIEW）
  - _需求: 14_

- [ ] 1.4 创建工具函数库
  - utils/time.js：时间格式化、倒计时计算函数
  - utils/format.js：数据格式化、数字处理函数
  - utils/validator.js：数据验证函数
  - _需求: 14_

- [ ] 1.5 创建本地缓存服务
  - services/storage.js：封装wx.setStorageSync、wx.getStorageSync等API
  - 提供set、get、remove、clear方法
  - 添加错误处理和日志记录
  - _需求: 15_

---

- [ ] 2. Mock数据服务开发
  - 创建Mock数据生成器和数据接口封装
  - _需求: 15_

- [ ] 2.1 创建题库Mock数据生成器
  - services/mock/question.js：实现QuestionMock类
  - 实现generateQuestions方法：生成指定数量和类型的题目
  - 实现generateContent、generateOptions、generateAnswer等辅助方法
  - 支持行测各科目的题目模板
  - _需求: 15_

- [ ] 2.2 创建用户数据Mock服务
  - services/mock/user.js：实现UserMock类
  - 生成用户基本信息、学习统计数据
  - 模拟用户学习天数、答题数量、正确率等数据
  - _需求: 15_

- [ ] 2.3 创建学习记录Mock服务
  - services/mock/record.js：实现RecordMock类
  - 生成答题记录、练习记录、学习统计数据
  - 模拟历史答题数据
  - _需求: 15_

- [ ] 2.4 创建统一数据接口服务
  - services/api.js：实现ApiService类
  - 封装getQuestions、getUserInfo、saveAnswerRecord等方法
  - 使用Promise模拟异步请求（setTimeout）
  - 确保接口数据结构与真实后端一致
  - _需求: 15_

---

- [ ] 3. 模块适配器开发
  - 实现行测和申论模块的适配器，支持多模块架构
  - _需求: 12_

- [ ] 3.1 创建行测模块适配器
  - modules/xingce/adapters/xingce-adapter.js：实现XingceAdapter类
  - 实现getAnswerPagePath、getAnalysisPagePath、getQuestionDetailPath方法
  - 实现checkAnswer方法：判断客观题答案正确性
  - 实现calculateScore方法：计算客观题得分
  - 实现formatQuestionData方法：格式化题目数据
  - _需求: 12_

- [ ] 3.2 创建申论模块适配器
  - modules/essay/adapters/essay-adapter.js：实现EssayAdapter类
  - 实现getAnswerPagePath、getAnalysisPagePath、getQuestionDetailPath方法
  - 实现aiScore方法：模拟AI评分（返回立意、结构、语言三个维度分数）
  - 实现calculateScore方法：计算主观题得分
  - 实现formatQuestionData方法：格式化题目数据
  - _需求: 12_

---

- [ ] 4. 统一数据服务开发
  - 创建题目、收藏、错题的统一服务接口
  - _需求: 9, 12_

- [ ] 4.1 创建题目服务
  - services/question-service.js：实现QuestionService类
  - 实现getAdapter方法：根据模块类型获取适配器
  - 实现navigateToAnswer、navigateToAnalysis、navigateToQuestionDetail方法
  - 实现buildQuery方法：构建URL查询字符串
  - _需求: 12_

- [ ] 4.2 创建收藏服务
  - services/collection-service.js：实现CollectionService类
  - 实现addCollection方法：添加收藏（支持moduleType字段）
  - 实现getCollections方法：获取收藏列表（支持按模块筛选）
  - 实现removeCollection方法：删除收藏
  - 实现isCollected方法：检查是否已收藏
  - _需求: 9, 12_

- [ ] 4.3 创建错题服务
  - services/wrong-question-service.js：实现WrongQuestionService类
  - 实现addWrongQuestion方法：添加错题（支持moduleType字段）
  - 实现getWrongQuestions方法：获取错题列表（支持按模块筛选）
  - 实现markAsMastered方法：标记为已掌握
  - _需求: 9, 12_

---

- [ ] 5. 全局组件开发
  - 创建可复用的全局UI组件
  - _需求: 12_

- [ ] 5.1 创建顶部导航栏组件
  - components/NavBar/：创建NavBar组件
  - 支持自定义标题、返回按钮、右侧操作按钮
  - 支持自定义背景色
  - 添加点击事件处理
  - _需求: 12_

- [ ] 5.2 创建答题卡组件（行测专用）
  - modules/xingce/components/AnswerSheet/：创建AnswerSheet组件
  - 以网格形式显示所有题目序号
  - 使用不同颜色标识题目状态（未答、已答、标记）
  - 支持点击题号跳转
  - 显示已答/未答统计
  - _需求: 5, 12_

- [ ] 5.3 创建题目卡片组件（通用容器）
  - components/QuestionContainer/：创建QuestionContainer组件
  - 作为题目展示的通用容器
  - 支持插槽，允许不同模块自定义内容
  - _需求: 12_

- [ ] 5.4 创建客观题组件（行测专用）
  - modules/xingce/components/ObjectiveQuestion/：创建ObjectiveQuestion组件
  - 展示题目内容、选项
  - 支持单选、多选、材料题
  - 支持选项图片展示
  - _需求: 4, 12_

- [ ] 5.5 创建选项组件（行测专用）
  - modules/xingce/components/OptionItem/：创建OptionItem组件
  - 支持单选和多选样式
  - 支持文字和图片选项
  - 显示选中状态和正确/错误标识（解析模式）
  - _需求: 4, 12_

- [ ] 5.6 创建涂鸦画板组件
  - components/DrawingBoard/：创建DrawingBoard组件
  - 使用Canvas实现手写绘制功能
  - 提供橡皮擦、清空、保存功能
  - 支持自定义线条粗细和颜色
  - _需求: 4, 12_

- [ ] 5.7 创建设置面板组件
  - components/SettingPanel/：创建SettingPanel组件
  - 提供答题模式切换（练习/考试）
  - 提供主题模式切换（明亮/暗黑）
  - 提供字体大小调节
  - 从右侧滑入动画
  - _需求: 7, 12_

---

- [ ] 6. 登录页面开发
  - 实现用户登录和授权功能
  - _需求: 1_

- [ ] 6.1 创建登录页面UI
  - pages/login/login.wxml：创建登录页面布局
  - 顶部显示Logo和小程序名称
  - 中部显示登录说明文字
  - 底部显示微信授权登录按钮和隐私政策链接
  - _需求: 1_

- [ ] 6.2 实现登录页面逻辑
  - pages/login/login.js：实现登录逻辑
  - 调用wx.getUserProfile获取用户信息
  - 将用户信息存储到本地缓存
  - 登录成功后跳转到首页
  - 添加错误处理
  - _需求: 1_

- [ ] 6.3 实现登录状态检查
  - app.js：在onLaunch中检查登录状态
  - 如果已登录，直接进入首页
  - 如果未登录，跳转到登录页
  - _需求: 1_

---

- [ ] 7. 首页开发
  - 实现首页功能导航和专项练习列表
  - _需求: 2_

- [ ] 7.1 创建首页UI布局
  - pages/home/home.wxml：创建首页布局
  - 顶部导航区：考试类型切换、AI问答、更多按钮
  - Banner区：阶段刷题总结
  - 快捷入口区：每日一练、最新时政、历年试卷、套题练习、模拟试卷
  - 专项练习区：专项列表（政治理论、常识判断等）
  - 底部TabBar：首页、估分、快练、背诵、我的
  - _需求: 2_

- [ ] 7.2 实现首页数据加载
  - pages/home/home.js：实现数据加载逻辑
  - 从Mock服务获取专项练习数据
  - 从本地缓存读取用户答题进度
  - 实时更新已完成题目数量
  - _需求: 2_

- [ ] 7.3 实现首页交互功能
  - 实现考试类型切换功能
  - 实现快捷入口点击跳转
  - 实现专项练习点击进入设置页
  - 实现TabBar切换
  - _需求: 2_

---

- [ ] 8. 行测答题页面开发
  - 实现行测客观题答题功能
  - _需求: 3, 4_

- [ ] 8.1 创建行测答题页面UI
  - modules/xingce/pages/answer/answer.wxml：创建答题页面布局
  - 顶部状态栏：科目、题目序号、剩余时间、设置按钮
  - 题目区：使用ObjectiveQuestion组件展示题目
  - 操作栏：标记按钮、上一题、下一题、答题卡按钮
  - _需求: 3, 4_

- [ ] 8.2 实现行测答题页面逻辑
  - modules/xingce/pages/answer/answer.js：实现答题逻辑
  - 从路由参数获取试卷ID和题目列表
  - 从本地缓存读取答题进度（如果存在）
  - 实现答案选择和状态更新
  - 实现上一题/下一题切换
  - 每5秒自动保存答题进度
  - 实现提交答案功能（弹出确认对话框）
  - _需求: 3_

- [ ] 8.3 实现答题卡浮层功能
  - 使用AnswerSheet组件
  - 点击答题卡按钮显示浮层
  - 点击题号跳转到对应题目
  - 点击提交试卷弹出二次确认
  - _需求: 5_

- [ ] 8.4 实现特殊题型支持
  - 材料题：在题目上方显示材料内容区域
  - 图片选项：支持图片展示和点击放大
  - 多选题：支持多选逻辑
  - _需求: 4_

- [ ] 8.5 实现草稿纸功能
  - 集成DrawingBoard组件
  - 点击草稿纸按钮显示涂鸦画板
  - 支持保存涂鸦内容
  - _需求: 4_

---

- [ ] 9. 行测解析页面开发
  - 实现答题结果展示和题目解析功能
  - _需求: 6_

- [ ] 9.1 创建行测解析页面UI
  - modules/xingce/pages/analysis/analysis.wxml：创建解析页面布局
  - 顶部导航栏
  - 成绩统计区：得分、用时、正确率
  - 筛选标签：全部、正确、错误
  - 题目列表：显示题目预览和答题结果
  - 底部操作：查看详细报告、再练一次
  - _需求: 6_

- [ ] 9.2 实现行测解析页面逻辑
  - modules/xingce/pages/analysis/analysis.js：实现解析逻辑
  - 使用XingceAdapter计算成绩
  - 实现筛选功能（全部/正确/错误）
  - 点击题目卡片跳转到单题解析页
  - 实现再练一次功能
  - _需求: 6_

- [ ] 9.3 实现错题自动收集
  - 答错的题目自动添加到错题本
  - 使用WrongQuestionService保存错题
  - _需求: 6, 9_

---

- [ ] 10. 行测单题解析页面开发
  - 实现单题详细解析展示
  - _需求: 6, 9_

- [ ] 10.1 创建单题解析页面UI
  - modules/xingce/pages/question-detail/question-detail.wxml：创建页面布局
  - 顶部导航栏：返回、标题、收藏按钮
  - 题目区：完整显示题目和选项
  - 答案对比区：用户答案、正确答案、结果标识
  - 解析区：详细解析内容
  - 知识点标签区
  - 导航按钮：上一题、下一题
  - _需求: 6_

- [ ] 10.2 实现单题解析页面逻辑
  - modules/xingce/pages/question-detail/question-detail.js：实现逻辑
  - 从路由参数获取题目ID
  - 加载题目详情和解析
  - 实现收藏功能（使用CollectionService）
  - 实现上一题/下一题导航
  - _需求: 6, 9_

---

- [ ] 11. 个人中心页面开发
  - 实现用户信息展示和功能入口
  - _需求: 8_

- [ ] 11.1 创建个人中心页面UI
  - pages/profile/profile.wxml：创建个人中心布局
  - 用户信息区：头像、昵称、学习天数
  - 数据统计区：总答题数、正确率、连续天数
  - 功能列表：我的收藏、错题本、练习记录、刷题报告、刷题日历、设置
  - 底部TabBar
  - _需求: 8_

- [ ] 11.2 实现个人中心数据加载
  - pages/profile/profile.js：实现数据加载逻辑
  - 从本地缓存读取用户信息
  - 计算学习统计数据
  - 实时更新数据
  - _需求: 8_

- [ ] 11.3 实现功能入口跳转
  - 实现点击各功能项跳转到对应页面
  - 实现头像点击进入个人信息编辑
  - _需求: 8_

---

- [ ] 12. 收藏列表页面开发
  - 实现统一的收藏列表（支持多模块）
  - _需求: 9, 12_

- [ ] 12.1 创建收藏列表页面UI
  - pages/collection/collection.wxml：创建收藏列表布局
  - 模块切换标签：行测、申论
  - 收藏列表：显示题目预览、分类、收藏时间
  - _需求: 9, 12_

- [ ] 12.2 实现收藏列表页面逻辑
  - pages/collection/collection.js：实现逻辑
  - 实现模块切换功能
  - 使用CollectionService加载收藏列表（按模块筛选）
  - 点击题目跳转到对应模块的题目详情页
  - 实现取消收藏功能
  - _需求: 9, 12_

---

- [ ] 13. 错题列表页面开发
  - 实现统一的错题列表（支持多模块）
  - _需求: 9, 12_

- [ ] 13.1 创建错题列表页面UI
  - pages/wrong-questions/wrong-questions.wxml：创建错题列表布局
  - 模块切换标签：行测、申论
  - 错题列表：显示题目预览、错误次数、最近错误时间
  - 筛选选项：全部、未掌握、已掌握
  - _需求: 9, 12_

- [ ] 13.2 实现错题列表页面逻辑
  - pages/wrong-questions/wrong-questions.js：实现逻辑
  - 实现模块切换功能
  - 使用WrongQuestionService加载错题列表（按模块筛选）
  - 实现筛选功能
  - 点击题目跳转到对应模块的题目详情页
  - 实现标记为已掌握功能
  - _需求: 9, 12_

---

- [ ] 14. 专项练习设置页面开发
  - 实现专项练习的题目设置功能
  - _需求: 10_

- [ ] 14.1 创建专项设置页面UI
  - pages/practice-setting/practice-setting.wxml：创建设置页面布局
  - 题目数量选择：10题、20题、50题、全部
  - 题目来源选择：全部题目、未做题目、错题
  - 开始练习按钮
  - _需求: 10_

- [ ] 14.2 实现专项设置页面逻辑
  - pages/practice-setting/practice-setting.js：实现逻辑
  - 从路由参数获取专项类型
  - 实现设置选项的交互
  - 点击开始练习，生成题目列表并跳转到答题页
  - _需求: 10_

---

- [ ] 15. 历年试卷和模拟考试功能开发
  - 实现历年真题和模拟考试功能
  - _需求: 11_

- [ ] 15.1 创建历年试卷列表页面
  - pages/past-papers/past-papers.wxml：创建试卷列表布局
  - 按年份和地区分类显示试卷
  - 显示试卷详情：题目数量、考试时长、难度
  - _需求: 11_

- [ ] 15.2 实现历年试卷列表逻辑
  - pages/past-papers/past-papers.js：实现逻辑
  - 从Mock服务加载历年试卷数据
  - 点击试卷进入试卷详情页
  - _需求: 11_

- [ ] 15.3 实现考试模式
  - 在答题页面支持考试模式
  - 启动倒计时，时间到自动提交
  - 禁用查看解析功能
  - _需求: 11_

---

- [ ] 16. 答题模式和设置功能开发
  - 实现答题设置和模式切换
  - _需求: 7_

- [ ] 16.1 实现设置面板功能
  - 使用SettingPanel组件
  - 实现答题模式切换（练习/考试）
  - 实现主题模式切换（明亮/暗黑）
  - 实现字体大小调节
  - 将设置保存到本地缓存
  - _需求: 7_

- [ ] 16.2 实现暗黑模式
  - 定义暗黑模式样式变量
  - 根据设置动态切换主题
  - 所有页面支持暗黑模式
  - _需求: 7_

---

- [ ] 17. 申论模块开发（子包）
  - 实现申论模块的答题和解析功能
  - _需求: 12, 13_

- [ ] 17.1 创建申论答题页面
  - modules/essay/pages/answer/answer.wxml：创建申论答题页面
  - 题目区：显示申论题目要求
  - 答题区：多行文本输入框，显示字数统计
  - 操作栏：保存草稿、提交答案
  - _需求: 12_

- [ ] 17.2 实现申论答题逻辑
  - modules/essay/pages/answer/answer.js：实现逻辑
  - 实现文本输入和字数统计
  - 实现自动保存草稿
  - 提交后使用EssayAdapter进行AI评分
  - _需求: 12_

- [ ] 17.3 创建申论解析页面
  - modules/essay/pages/analysis/analysis.wxml：创建申论解析页面
  - 评分结果区：总分、各维度得分（立意、结构、语言）
  - 用户答案展示区
  - 参考答案区
  - 详细点评区
  - _需求: 12_

- [ ] 17.4 实现申论解析逻辑
  - modules/essay/pages/analysis/analysis.js：实现逻辑
  - 显示AI评分结果
  - 显示用户答案和参考答案对比
  - 支持收藏功能
  - _需求: 12_

---

- [ ] 18. 动画和交互优化
  - 实现页面切换动画和用户反馈
  - _需求: 无直接对应，属于用户体验优化_

- [ ] 18.1 实现页面切换动画
  - 配置页面切换动画（右滑进入、左滑退出）
  - 实现组件动画（答题卡滑入、设置面板滑入）
  - _需求: 无_

- [ ] 18.2 实现用户反馈
  - 实现触觉反馈（选择答案震动、提交成功震动）
  - 实现视觉反馈（按钮hover状态、选项选中动画）
  - 实现加载状态（骨架屏、loading组件）
  - _需求: 无_

---

- [ ]* 19. 测试和优化
  - 进行功能测试和性能优化
  - _需求: 无直接对应，属于质量保证_

- [ ]* 19.1 功能测试
  - 测试完整的答题流程
  - 测试数据保存和读取
  - 测试页面跳转逻辑
  - 测试多模块切换
  - _需求: 无_

- [ ]* 19.2 性能优化
  - 优化图片加载（懒加载、WebP格式）
  - 优化数据缓存策略
  - 优化渲染性能（避免频繁setData）
  - 优化分包加载
  - _需求: 无_

- [ ]* 19.3 真机测试
  - 在不同型号手机上测试
  - 测试不同网络环境
  - 测试性能和内存占用
  - _需求: 无_

