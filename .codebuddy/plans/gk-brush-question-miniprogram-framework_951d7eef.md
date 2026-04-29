---
name: gk-brush-question-miniprogram-framework
overview: 基于 `miniprogram-Buddy` 搭建微信原生（Skyline + JS）公考刷题小程序框架，按截图与任务文档逐项拆解功能，先完成可执行的模块化架构、页面/组件规划与Mock数据方案，再分阶段落地实现。
design:
  architecture:
    component: tdesign
  styleKeywords:
    - 教育产品感
    - 高可读信息层级
    - 轻动效过渡
    - 卡片化布局
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 36rpx
      weight: 600
    subheading:
      size: 30rpx
      weight: 500
    body:
      size: 28rpx
      weight: 400
  colorSystem:
    primary:
      - "#2D6BFF"
      - "#4B8CFF"
      - "#1E4FD6"
    background:
      - "#F5F7FB"
      - "#FFFFFF"
      - "#0F172A"
    text:
      - "#1F2937"
      - "#4B5563"
      - "#FFFFFF"
    functional:
      - "#16A34A"
      - "#F59E0B"
      - "#EF4444"
      - "#7C3AED"
todos:
  - id: extract-content7-features
    content: 使用[subagent:code-explorer]逐图整理content7与功能点清单
    status: completed
  - id: define-architecture-routing
    content: 使用[skill:civil-service-exam-miniprogram-development-framework]设计路由分包与模块边界
    status: completed
    dependencies:
      - extract-content7-features
  - id: build-global-components
    content: 结合[skill:wechat-miniprogram-tdesign]与[mcp:TDesign MCP Server]实现全局组件体系
    status: completed
    dependencies:
      - define-architecture-routing
  - id: implement-home-auth-profile
    content: 完成首页登录我的主链路页面与登录态拦截
    status: completed
    dependencies:
      - build-global-components
  - id: implement-practice-flow
    content: 实现答题答题卡解析数资数算全流程与关键交互
    status: completed
    dependencies:
      - build-global-components
  - id: integrate-mock-and-docs
    content: 落地Mock数据、工具层与任务文档里程碑验收
    status: completed
    dependencies:
      - implement-home-auth-profile
      - implement-practice-flow
---

## User Requirements

- 基于 `d:/其他/lk-xcx/miniprogram-Buddy` 搭建微信原生刷题小程序框架，按截图目录逐图提炼功能并按逻辑顺序规划与落地。
- 业务范围覆盖：首页、答题、答题卡、解析、数资数算、我的，并新增登录页与登录态保护。
- 数据全部使用 Mock；不考虑后端。
- 采用组件化开发：`components/` 仅放全局组件，业务页面组件下沉到各分包内；并预留分包扩展（如申论等）。
- 任务必须可细分、可追踪，必要时沉淀为 Markdown 文档，避免中断后上下文断链。

## Product Overview

一个公考培训场景的刷题小程序，围绕“选模块→做题→答题卡→提交→解析→复盘（错题/收藏/报告）”形成完整闭环。整体视觉需与复刻图风格一致，页面层次清晰、过渡自然、操作路径符合真实刷题习惯。

## Core Features

- 按截图逐图梳理功能点并建立“功能点清单”，支持标注“扩展功能”。
- 首页提供考试类型切换、刷题入口、试卷/专项入口、模式设置与提示流程。
- 答题链路支持题型切换、材料题、答题卡跳转、结果页、解析模式、暗黑模式与多功能设置。
- 个人中心支持学习统计、练习记录、错题本、收藏、建议反馈、题目详情与报告查看。
- 登录页与登录态拦截保证未登录用户先授权再进入业务页面。

## Tech Stack Selection

- 当前项目基于微信小程序原生 JavaScript，已启用 Skyline 与 glass-easel（已在 `app.json` 验证），继续沿用。
- 组件层优先引入 TDesign 小程序组件（按需），与现有自定义 `components/navigation-bar` 协同复用。
- 数据层采用本地 Mock + `wx.setStorageSync` 持久化轻状态（登录态、设置、最近记录）。

## Implementation Approach

- 采用“先规范后页面、先骨架后细节”的策略：先产出 content7 与逐图功能清单，再落地路由/分包/组件/页面。
- 将页面拆成“流程页+能力组件”：流程页负责编排，组件负责复用（题目、题号矩阵、统计卡片、浮窗操作）。
- 关键决策：保留 Skyline 配置并开启按需加载，题目渲染保持单题视图，切题操作为 O(1)；答题卡统计基于一次遍历 O(n) 并结果缓存，避免重复计算。

## Implementation Notes (Execution Details)

- 复用已有代码风格（2 空格缩进、CommonJS、函数级必要注释），避免引入 TypeScript。
- 先改 `app.json` 路由与分包，再建页面，避免路径失配导致编译失败。
- 登录拦截集中在 `utils/auth.js` 与 `utils/router.js`，页面只调用统一方法，控制改动面。
- 暗黑模式、字体放大、题目设置等统一落入 `mock/settings.js` + storage，避免多页面状态分叉。
- 使用统一日志封装记录关键异常（路由失败、Mock字段缺失），不打印隐私数据。

## Architecture Design

- 分层结构：主包页面层（pages）+ 分包页面层（subpackages/*/pages）→ 组件层（components/global + subpackages/*/components）→ 领域工具层（utils）→ 数据层（mock）。
- 主流程链路：首页选练习 → 答题页作答 → 答题卡检查/跳题 → 提交结果 → 解析复盘 → 我的沉淀数据。
- 扩展策略：以分包承载申论/面试等新模块，主包仅保留高频核心链路。

## Directory Structure

目录基于 `d:/其他/lk-xcx/miniprogram-Buddy` 改造：

- `app.json` [MODIFY]：重建 pages、tabBar、subpackages、usingComponents、window 配置。
- `app.js` [MODIFY]：初始化全局状态、登录态恢复、全局配置注入。
- `app.wxss` [MODIFY]：全局主题变量、基础布局、通用动画。
- `project.config.json` [MODIFY]：补充 npm/构建相关设置以支持 TDesign 按需引入。

- `pages/auth/login/*` [NEW]：登录页（协议勾选、手机号/授权入口、登录成功回跳）。
- `pages/home/index/*` [NEW]：首页主场景（考试类型、入口区、模式设置、温馨提示）。
- `subpackages/practice/pages/index/*` [NEW]：主答题页（刷题/解析模式、切题、收藏标记、暗黑模式）。
- `subpackages/practice/pages/answer-card/*` [NEW]：答题卡页（统计、题号矩阵、跳题、提交）。
- `subpackages/practice/pages/analysis/*` [NEW]：结果与解析页（得分、正确率、单题解析）。
- `subpackages/practice/pages/math/*` [NEW]：数资数算首页与题目承接。
- `pages/profile/index/*` [NEW]：我的首页聚合入口。
- `pages/profile/report/*` [NEW]：刷题报告与日历。
- `pages/profile/errors/*` [NEW]：错题本与题目详情。
- `pages/profile/records/*` [NEW]：练习记录与收藏。
- `pages/profile/feedback/*` [NEW]：问题建议页。

- `components/top-nav/*` [NEW]：全局顶部导航（考试切换/搜索/右侧操作）。
- `components/floating-action/*` [NEW]：悬浮继续做题/答题卡按钮。
- `components/global/common-card/*` [NEW]：通用入口卡片与 Banner。
- `components/empty-state/*` [NEW]：空态与加载态。
- `subpackages/practice/components/question-item/*` [NEW]：题干+选项（含图片选项）。
- `subpackages/practice/components/question-matrix/*` [NEW]：题号矩阵状态组件。
- `subpackages/practice/components/analysis-block/*` [NEW]：答案与解析块。
- `components/navigation-bar/*` [MODIFY]：保留并增强为业务导航能力组件。

- `mock/home.js` [NEW]：首页入口、banner、模式配置。
- `mock/question-bank.js` [NEW]：题库结构（题目、选项、答案、解析、知识点）。
- `mock/user.js` [NEW]：用户信息、统计、登录态。
- `mock/practice.js` [NEW]：答题进度、答题卡状态、结果数据。
- `mock/settings.js` [NEW]：主题、字号、刷题偏好。

- `utils/auth.js` [NEW]：登录校验、登录态存取、重定向参数处理。
- `utils/router.js` [NEW]：统一跳转封装与鉴权守卫。
- `utils/question.js` [NEW]：题目归一化、判分、统计。
- `utils/storage.js` [NEW]：本地存储键管理与安全读取。
- `utils/util.js` [MODIFY]：保留时间工具并补充通用格式化。

- `docs/content7.md` [NEW]：长期复用约定（视觉、交互、命名、Mock、分包策略）。
- `docs/功能点清单.md` [NEW]：按“文件夹→截图序号→功能点”逐图清单。
- `docs/任务拆分与里程碑.md` [NEW]：可恢复执行清单与交付标准。

## Key Code Structures

- Mock题目对象结构：`id, type, stem, options, answer, analysis, knowledgePoint, difficulty, material, hasImage`
- 答题状态结构：`questionId, selected, isMarked, isCorrect, spentTime, mode`
- 登录态结构：`tokenMock, userId, nickname, avatar, expireAt, agreedProtocol`

## 设计方案

- 风格：与复刻图一致的专业教育产品风，强调信息密度与可读性。
- 页面结构：顶部业务导航 + 中部任务内容 + 底部主导航；答题页强化“题干-选项-操作区”视觉节奏。
- 交互：卡片轻阴影、页面淡入过渡、切题滑动反馈、按钮状态清晰。
- 适配：遵循小程序安全区，兼容深色模式与长列表场景。

## Agent Extensions

- **subagent: code-explorer**  
- Purpose: 批量检索与核验多目录文件、路径与调用关系。  
- Expected outcome: 产出准确的改造范围、避免漏改文件和错误路径。

- **skill: civil-service-exam-miniprogram-development-framework**  
- Purpose: 提供公考刷题业务链路、答题逻辑、分包与题型处理最佳实践。  
- Expected outcome: 形成贴合行测/公基场景的可扩展业务框架。

- **skill: wechat-miniprogram-tdesign**  
- Purpose: 指导 TDesign 组件选型、按需引入、样式与性能优化。  
- Expected outcome: 统一组件体验并降低重复造轮子成本。

- **mcp: TDesign MCP Server**  
- Purpose: 查询组件文档、DOM 与变更，确保组件实现准确可维护。  
- Expected outcome: 明确组件 API 与结构，减少集成试错。