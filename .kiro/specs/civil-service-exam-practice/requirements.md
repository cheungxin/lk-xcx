# 需求文档：公考刷题小程序

## 简介

本文档定义了公考刷题小程序的功能需求和非功能需求。该小程序基于 xcx-software 微信小程序基座开发，为准备公务员考试的考生提供便捷的刷题、错题管理、学习统计等功能。

## 术语表

- **System**: 公考刷题小程序系统
- **User**: 使用小程序的考生用户
- **Question**: 题目，包括单选题、多选题、判断题、材料题
- **Practice_Record**: 答题记录，记录用户的答题过程和结果
- **Wrong_Question**: 错题记录，记录用户答错的题目
- **Collection**: 收藏记录，用户收藏的题目
- **Answer_Sheet**: 答题卡，显示答题进度和状态
- **Mock_Data**: 模拟数据，前期开发使用的测试数据
- **Local_Storage**: 本地存储，用于保存用户数据
- **Practice_Mode**: 刷题模式，包括练习模式、解析模式、考场模式
- **Exam_Type**: 考试类型，如国考、省考、事业单位等
- **Knowledge_Point**: 考点，题目所属的知识点
- **Statistics**: 统计数据，用户的刷题统计信息
- **TDesign**: 腾讯 TDesign 组件库
- **Skyline**: 微信小程序 Skyline 渲染引擎

## 需求

### 需求 1：用户认证与登录

**用户故事**：作为考生，我想通过微信授权登录小程序，以便系统能够保存我的学习数据和进度。

#### 验收标准

1. WHEN 用户首次打开小程序 THEN THE System SHALL 显示登录页面
2. WHEN 用户点击微信授权登录按钮 THEN THE System SHALL 获取用户的微信信息并创建用户账号
3. WHEN 用户登录成功 THEN THE System SHALL 保存用户的登录态到 Local_Storage
4. WHEN 用户再次打开小程序且登录态有效 THEN THE System SHALL 自动登录并跳转到首页
5. WHEN 用户的登录态失效 THEN THE System SHALL 引导用户重新登录

### 需求 2：考试类型管理

**用户故事**：作为考生，我想选择不同的考试类型（国考、省考等），以便获取针对性的题目和学习内容。

#### 验收标准

1. WHEN 用户进入首页 THEN THE System SHALL 显示当前选择的考试类型
2. WHEN 用户点击考试类型选择器 THEN THE System SHALL 显示可选的考试类型列表
3. WHEN 用户选择新的考试类型 THEN THE System SHALL 更新当前考试类型并保存到 Local_Storage
4. WHEN 考试类型变更 THEN THE System SHALL 刷新相关的题目列表和考点结构

### 需求 3：刷题设置与题目获取

**用户故事**：作为考生，我想自定义刷题参数（题目数量、题型、考点等），以便进行针对性的练习。

#### 验收标准

1. WHEN 用户在首页设置刷题参数 THEN THE System SHALL 提供题目数量、题型、考点、难度等选项
2. WHEN 用户设置题目数量 THEN THE System SHALL 限制数量在 1 到 200 之间
3. WHEN 用户选择题型 THEN THE System SHALL 允许选择单选题、多选题、判断题或材料题
4. WHEN 用户选择考点 THEN THE System SHALL 显示考点结构树供用户选择
5. WHEN 用户点击开始刷题 THEN THE System SHALL 根据设置参数从 Mock_Data 中获取题目列表
6. WHEN 获取题目成功 THEN THE System SHALL 跳转到答题页面

### 需求 4：练习模式答题

**用户故事**：作为考生，我想在练习模式下答题，以便边做题边查看解析，加深理解。

#### 验收标准

1. WHEN 用户进入练习模式 THEN THE System SHALL 显示第一道题目
2. WHEN 用户选择答案 THEN THE System SHALL 记录用户的选择
3. WHEN 用户点击上一题或下一题 THEN THE System SHALL 切换到对应题目
4. WHEN 用户点击答题卡 THEN THE System SHALL 显示答题进度并允许快速跳转
5. WHEN 用户提交答案 THEN THE System SHALL 计算答题结果并保存 Practice_Record
6. WHEN 答题完成 THEN THE System SHALL 跳转到结果页面显示答题统计

### 需求 5：解析模式答题

**用户故事**：作为考生，我想在解析模式下答题，以便答题后立即看到正确答案和详细解析。

#### 验收标准

1. WHEN 用户进入解析模式 THEN THE System SHALL 显示题目和答案选项
2. WHEN 用户选择答案后 THEN THE System SHALL 立即显示正确答案和解析
3. WHEN 显示解析时 THEN THE System SHALL 标记用户答案的正确性
4. WHEN 用户查看解析后 THEN THE System SHALL 允许用户继续下一题
5. WHEN 用户完成所有题目 THEN THE System SHALL 保存 Practice_Record 并显示结果

### 需求 6：考场模式答题

**用户故事**：作为考生，我想在考场模式下模拟真实考试，以便提前适应考试节奏和压力。

#### 验收标准

1. WHEN 用户选择历年试卷进入考场模式 THEN THE System SHALL 显示试卷信息和温馨提示
2. WHEN 用户确认进入考场模式 THEN THE System SHALL 开始计时并显示倒计时
3. WHEN 考场模式答题时 THEN THE System SHALL 不显示答案和解析
4. WHEN 剩余时间少于 10 分钟 THEN THE System SHALL 显示时间提醒
5. WHEN 考试时间结束 THEN THE System SHALL 自动提交答案
6. WHEN 用户提交试卷 THEN THE System SHALL 计算分数并显示成绩报告

### 需求 7：答题卡功能

**用户故事**：作为考生，我想使用答题卡查看答题进度，以便快速定位和跳转到特定题目。

#### 验收标准

1. WHEN 用户点击答题卡按钮 THEN THE System SHALL 显示答题卡面板
2. WHEN 显示答题卡 THEN THE System SHALL 用不同颜色标识已答、未答和当前题目
3. WHEN 用户点击答题卡中的题号 THEN THE System SHALL 跳转到对应题目
4. WHEN 答题卡显示时 THEN THE System SHALL 显示已答题数和总题数
5. WHEN 用户关闭答题卡 THEN THE System SHALL 返回当前答题页面

### 需求 8：错题本管理

**用户故事**：作为考生，我想查看和管理我的错题，以便针对性地复习薄弱知识点。

#### 验收标准

1. WHEN 用户答错题目 THEN THE System SHALL 自动将题目添加到错题本
2. WHEN 同一题目多次答错 THEN THE System SHALL 累计错误次数
3. WHEN 用户进入错题本 THEN THE System SHALL 显示所有错题列表
4. WHEN 用户查看错题 THEN THE System SHALL 显示题目、用户答案、正确答案和解析
5. WHEN 用户标记错题为已掌握 THEN THE System SHALL 更新错题状态
6. WHEN 用户删除错题 THEN THE System SHALL 从错题本中移除该题目
7. WHERE 错题本功能启用 THE System SHALL 确保同一题目在错题本中只有一条记录

### 需求 9：收藏功能

**用户故事**：作为考生，我想收藏重要题目，以便后续快速查找和复习。

#### 验收标准

1. WHEN 用户在答题页面点击收藏按钮 THEN THE System SHALL 将题目添加到收藏夹
2. WHEN 用户收藏题目时 THEN THE System SHALL 允许用户添加笔记
3. WHEN 用户进入收藏夹 THEN THE System SHALL 显示所有收藏的题目列表
4. WHEN 用户查看收藏题目 THEN THE System SHALL 显示题目内容和用户笔记
5. WHEN 用户取消收藏 THEN THE System SHALL 从收藏夹中移除该题目
6. WHERE 收藏功能启用 THE System SHALL 确保同一用户对同一题目只能收藏一次

### 需求 10：练习记录管理

**用户故事**：作为考生，我想查看我的练习记录，以便了解我的学习历史和进步情况。

#### 验收标准

1. WHEN 用户完成一次答题 THEN THE System SHALL 保存完整的 Practice_Record 到 Local_Storage
2. WHEN 保存 Practice_Record THEN THE System SHALL 记录答题模式、题目列表、用户答案、答题时长和答题结果
3. WHEN 用户进入练习记录页面 THEN THE System SHALL 显示历史练习记录列表
4. WHEN 用户点击某条记录 THEN THE System SHALL 显示该次练习的详细信息
5. WHEN 用户删除练习记录 THEN THE System SHALL 从 Local_Storage 中移除该记录

### 需求 11：学习统计

**用户故事**：作为考生，我想查看我的学习统计数据，以便了解我的整体学习情况和薄弱环节。

#### 验收标准

1. WHEN 用户完成答题 THEN THE System SHALL 更新统计数据包括总答题数、正确数、错误数和正确率
2. WHEN 计算正确率 THEN THE System SHALL 使用公式：正确率 = (正确数 / 总答题数) × 100
3. WHEN 用户进入我的页面 THEN THE System SHALL 显示总答题数、正确率、连续天数和练习次数
4. WHEN 用户查看统计数据 THEN THE System SHALL 按科目分类显示答题统计
5. WHEN 用户每日答题 THEN THE System SHALL 记录每日答题数量和正确数
6. WHEN 计算连续天数 THEN THE System SHALL 统计从今天往前连续有答题记录的天数

### 需求 12：刷题报告

**用户故事**：作为考生，我想查看详细的刷题报告，以便分析我的学习效果和改进方向。

#### 验收标准

1. WHEN 用户进入刷题报告页面 THEN THE System SHALL 显示最近 30 天的刷题数据
2. WHEN 显示刷题报告 THEN THE System SHALL 包含总题数、正确数、正确率、总时长和平均时长
3. WHEN 显示刷题报告 THEN THE System SHALL 提供每日答题趋势图表
4. WHEN 显示刷题报告 THEN THE System SHALL 按科目显示答题分布和正确率
5. WHEN 用户选择不同时间范围 THEN THE System SHALL 更新报告数据

### 需求 13：刷题日历

**用户故事**：作为考生，我想通过日历热力图查看我的刷题习惯，以便保持学习连续性。

#### 验收标准

1. WHEN 用户进入刷题日历页面 THEN THE System SHALL 显示最近 90 天的日历热力图
2. WHEN 显示日历热力图 THEN THE System SHALL 用不同颜色深度表示每日答题数量
3. WHEN 用户点击日历中的某一天 THEN THE System SHALL 显示该天的详细答题数据
4. WHEN 某天无答题记录 THEN THE System SHALL 显示为空白或最浅颜色
5. WHEN 某天答题数量越多 THEN THE System SHALL 显示颜色越深

### 需求 14：涂鸦功能

**用户故事**：作为考生，我想在答题时使用涂鸦功能，以便在屏幕上进行草稿计算和标记。

#### 验收标准

1. WHEN 用户在答题页面点击涂鸦按钮 THEN THE System SHALL 显示涂鸦画板
2. WHEN 涂鸦画板显示时 THEN THE System SHALL 提供画笔和橡皮擦工具
3. WHEN 用户使用画笔 THEN THE System SHALL 在画板上绘制用户的触摸轨迹
4. WHEN 用户使用橡皮擦 THEN THE System SHALL 擦除画板上的内容
5. WHEN 用户点击清空按钮 THEN THE System SHALL 清除画板上的所有内容
6. WHEN 用户关闭涂鸦画板 THEN THE System SHALL 返回答题页面

### 需求 15：暗黑模式

**用户故事**：作为考生，我想在夜间使用暗黑模式，以便减少眼睛疲劳。

#### 验收标准

1. WHEN 用户在答题页面切换暗黑模式 THEN THE System SHALL 将页面背景改为深色
2. WHEN 暗黑模式启用 THEN THE System SHALL 将文字颜色改为浅色以保持可读性
3. WHEN 暗黑模式启用 THEN THE System SHALL 调整所有组件的颜色方案
4. WHEN 用户关闭暗黑模式 THEN THE System SHALL 恢复默认的浅色主题
5. WHEN 用户切换暗黑模式 THEN THE System SHALL 保存用户的偏好设置

### 需求 16：材料题支持

**用户故事**：作为考生，我想答材料题，以便练习需要阅读材料的题型。

#### 验收标准

1. WHEN 题目类型为材料题 THEN THE System SHALL 显示材料内容和关联的题目列表
2. WHEN 显示材料题 THEN THE System SHALL 允许用户折叠或展开材料内容
3. WHEN 用户答材料题 THEN THE System SHALL 保持材料内容可见或可快速查看
4. WHEN 材料包含图片 THEN THE System SHALL 正确显示图片内容
5. WHEN 用户在材料题之间切换 THEN THE System SHALL 显示相同的材料内容

### 需求 17：数资数算专项

**用户故事**：作为考生，我想使用数资数算专项功能，以便在答数学题时使用计算器和草稿纸。

#### 验收标准

1. WHEN 用户进入数资数算专项 THEN THE System SHALL 显示数资数算题目列表
2. WHEN 用户答数资数算题 THEN THE System SHALL 提供计算器工具
3. WHEN 用户使用计算器 THEN THE System SHALL 支持基本的四则运算
4. WHEN 用户答数资数算题 THEN THE System SHALL 提供草稿纸功能
5. WHEN 用户使用草稿纸 THEN THE System SHALL 允许用户手写计算过程

### 需求 18：历年试卷

**用户故事**：作为考生，我想查看和练习历年真题，以便了解考试难度和题型分布。

#### 验收标准

1. WHEN 用户进入试卷列表页面 THEN THE System SHALL 显示历年试卷列表
2. WHEN 显示试卷列表 THEN THE System SHALL 包含试卷标题、年份、省份、题目数量和时长
3. WHEN 用户选择试卷 THEN THE System SHALL 显示试卷详细信息
4. WHEN 用户点击开始考试 THEN THE System SHALL 进入考场模式
5. WHEN 用户筛选试卷 THEN THE System SHALL 支持按年份、省份和考试类型筛选

### 需求 19：考点结构

**用户故事**：作为考生，我想查看考点结构树，以便了解知识点体系和选择特定考点练习。

#### 验收标准

1. WHEN 用户进入考点结构页面 THEN THE System SHALL 显示树形结构的考点列表
2. WHEN 显示考点结构 THEN THE System SHALL 显示每个考点下的题目数量
3. WHEN 用户点击考点 THEN THE System SHALL 展开或折叠子考点
4. WHEN 用户选择考点 THEN THE System SHALL 允许基于该考点开始刷题
5. WHEN 考试类型变更 THEN THE System SHALL 更新考点结构树

### 需求 20：个人信息管理

**用户故事**：作为考生，我想查看和编辑我的个人信息，以便保持信息准确。

#### 验收标准

1. WHEN 用户进入个人信息页面 THEN THE System SHALL 显示用户的昵称、头像和考试类型
2. WHEN 用户修改个人信息 THEN THE System SHALL 保存修改到 Local_Storage
3. WHEN 用户更换头像 THEN THE System SHALL 允许用户选择新头像
4. WHEN 用户修改昵称 THEN THE System SHALL 验证昵称长度和格式
5. WHEN 用户切换考试类型 THEN THE System SHALL 更新用户的默认考试类型

### 需求 21：数据持久化

**用户故事**：作为考生，我想我的学习数据能够持久保存，以便下次打开小程序时继续学习。

#### 验收标准

1. WHEN 用户完成答题 THEN THE System SHALL 将 Practice_Record 保存到 Local_Storage
2. WHEN 用户收藏题目 THEN THE System SHALL 将 Collection 保存到 Local_Storage
3. WHEN 用户答错题目 THEN THE System SHALL 将 Wrong_Question 保存到 Local_Storage
4. WHEN 统计数据更新 THEN THE System SHALL 将 Statistics 保存到 Local_Storage
5. WHEN 用户设置变更 THEN THE System SHALL 将设置保存到 Local_Storage
6. WHEN 用户再次打开小程序 THEN THE System SHALL 从 Local_Storage 加载所有用户数据

### 需求 22：数据一致性

**用户故事**：作为系统，我需要确保数据的一致性和准确性，以便为用户提供可靠的学习数据。

#### 验收标准

1. WHEN 保存 Practice_Record THEN THE System SHALL 确保正确数、错误数、未答数之和等于题目总数
2. WHEN 计算正确率 THEN THE System SHALL 确保结果在 0 到 100 之间
3. WHEN 保存 Practice_Record THEN THE System SHALL 确保开始时间早于或等于结束时间
4. WHEN 添加 Wrong_Question THEN THE System SHALL 确保同一题目在错题本中只有一条记录
5. WHEN 添加 Collection THEN THE System SHALL 确保同一用户对同一题目只能收藏一次
6. WHEN 更新 Statistics THEN THE System SHALL 确保所有统计数据准确无误

### 需求 23：错误处理

**用户故事**：作为考生，当系统出现错误时，我希望能够得到清晰的提示，以便知道如何处理。

#### 验收标准

1. WHEN 数据加载失败 THEN THE System SHALL 显示友好的错误提示
2. WHEN 本地存储操作失败 THEN THE System SHALL 提示用户并提供重试选项
3. WHEN 页面跳转失败 THEN THE System SHALL 捕获错误并提示用户
4. WHEN 用户输入无效数据 THEN THE System SHALL 显示验证错误信息
5. IF 发生未预期的错误 THEN THE System SHALL 记录错误日志并显示通用错误提示

### 需求 24：性能要求

**用户故事**：作为考生，我希望小程序运行流畅，以便获得良好的使用体验。

#### 验收标准

1. WHEN 用户打开任何页面 THEN THE System SHALL 在 2 秒内完成页面加载
2. WHEN 用户切换题目 THEN THE System SHALL 在 500 毫秒内完成切换
3. WHEN 用户提交答案 THEN THE System SHALL 在 1 秒内完成数据保存和页面跳转
4. WHEN 显示长列表 THEN THE System SHALL 使用虚拟列表优化渲染性能
5. WHEN 加载图片 THEN THE System SHALL 使用懒加载减少初始加载时间

### 需求 25：分包加载

**用户故事**：作为系统，我需要使用分包加载优化小程序体积，以便提升加载速度和用户体验。

#### 验收标准

1. WHEN 小程序启动 THEN THE System SHALL 只加载主包内容
2. WHEN 用户进入答题页面 THEN THE System SHALL 按需加载行测刷题分包
3. WHEN 用户进入数资数算专项 THEN THE System SHALL 按需加载数资数算分包
4. WHEN 用户使用答题卡功能 THEN THE System SHALL 按需加载答题卡分包
5. WHERE 分包预加载配置启用 THE System SHALL 在首页时预加载答题分包

### 需求 26：UI 组件规范

**用户故事**：作为系统，我需要使用统一的 UI 组件库，以便保持界面风格一致和开发效率。

#### 验收标准

1. THE System SHALL 使用 TDesign 组件库作为基础 UI 组件
2. WHEN 显示按钮 THEN THE System SHALL 使用 t-button 组件
3. WHEN 显示列表 THEN THE System SHALL 使用 t-cell 和 t-cell-group 组件
4. WHEN 显示弹窗 THEN THE System SHALL 使用 t-dialog 或 t-popup 组件
5. WHEN 显示空状态 THEN THE System SHALL 使用 t-empty 组件
6. WHEN 显示加载状态 THEN THE System SHALL 使用 t-loading 组件

### 需求 27：响应式设计

**用户故事**：作为考生，我希望小程序能够适配不同尺寸的手机屏幕，以便在任何设备上都能正常使用。

#### 验收标准

1. WHEN 小程序在不同设备上运行 THEN THE System SHALL 自动适配屏幕尺寸
2. WHEN 显示文字 THEN THE System SHALL 使用 rpx 单位确保不同设备上的一致性
3. WHEN 显示图片 THEN THE System SHALL 根据屏幕尺寸自动调整图片大小
4. WHEN 显示布局 THEN THE System SHALL 使用 flex 布局确保响应式效果
5. WHEN 用户旋转屏幕 THEN THE System SHALL 保持界面布局正确

### 需求 28：无障碍访问

**用户故事**：作为有特殊需求的考生，我希望小程序支持无障碍功能，以便我也能正常使用。

#### 验收标准

1. WHEN 显示交互元素 THEN THE System SHALL 提供适当的 aria 标签
2. WHEN 显示图片 THEN THE System SHALL 提供替代文本描述
3. WHEN 显示按钮 THEN THE System SHALL 确保按钮有足够的点击区域
4. WHEN 显示文字 THEN THE System SHALL 确保文字大小和对比度符合可读性标准
5. WHEN 用户使用辅助功能 THEN THE System SHALL 支持屏幕阅读器

## 非功能需求

### 性能需求

- 页面加载时间不超过 2 秒
- 题目切换响应时间不超过 500 毫秒
- 支持至少 200 道题目的流畅答题
- 本地存储数据量不超过 10MB

### 可用性需求

- 界面简洁直观，符合微信小程序设计规范
- 操作流程清晰，用户无需培训即可使用
- 提供友好的错误提示和操作反馈
- 支持暗黑模式以适应不同使用场景

### 兼容性需求

- 支持微信小程序基础库 3.0.0 及以上版本
- 支持 iOS 和 Android 平台
- 适配主流手机屏幕尺寸
- 使用 Skyline 渲染引擎提升性能

### 可维护性需求

- 代码结构清晰，模块化设计
- 使用统一的代码风格和命名规范
- 提供完整的代码注释和文档
- 服务层与视图层分离，便于后续对接真实后端

### 安全性需求

- 用户数据存储在本地，不上传到服务器
- 敏感数据使用加密存储
- 输入数据进行验证和过滤，防止 XSS 攻击
- 登录态验证，保护用户隐私

### 扩展性需求

- 预留申论、面试、课程、社群等功能分包
- API 接口定义完整，便于后续对接真实后端
- 组件化设计，便于功能扩展和复用
- 支持后续添加更多考试类型和题型

---

**文档版本**：v1.0  
**创建日期**：2024-01-15  
**最后更新**：2024-01-15  
**作者**：Kiro AI Assistant
