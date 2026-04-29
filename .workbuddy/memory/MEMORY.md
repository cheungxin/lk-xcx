# 项目长期记忆

## 项目概述
- 公务员考试刷题微信小程序 (lk-xcx)
- 技术栈：微信原生小程序 + TDesign 组件库
- 主题色：#1664FF，背景色 #f7f8fa
- 仓库：https://gitee.com/cheungxin/lk-xcx.git

## 重要约定
- `app.json` 中的 `"style": "v2"` 是 TDesign 官方要求，**绝对不能移除**
- **所有页面必须设置 `navigationStyle: "custom"`**，否则会出现原生导航栏与内容重叠
- 自定义 TabBar 使用 custom-tab-bar/index.js（代理层）+ components/tabbar/tabbar（实际组件）
- 使用 router/index.js 统一管理路由跳转
- Mock 数据直接在 JS 文件中定义

## 导航栏规范
- 项目自定义导航栏组件：`/miniprogram/components/navigation-bar/`
- 组件属性：`title`, `background`, `color`, `showBack`, `showHome`, `customRight`
- 页面 JS 中需获取 `statusBarHeight` 和 `navBarHeight` 进行占位处理
- TDesign 导航栏使用 `t-navbar`，需设置 `fixed` 和 `margin-top`
- **Tab 页面（首页/估分/快练/背诵/我的）不使用 `navigationStyle: custom`**，保留原生导航栏，通过 `safeTop` 避开状态栏即可

## 项目结构
- 主包 pages/: index(首页), profile(我的), login(登录), exam-tab(估分Tab), quick-tab(快练Tab), memorize(背诵Tab)
- 分包 training/: practice(答题), exam(估分), quick(快练), answer-card(答题卡), analysis(解析), math(数资)
- 分包 my/: review(背诵), stats(统计), favorite(收藏), wrong(错题), record(记录), settings(设置)
- 分包 course/: list(课程列表), detail(课程详情), play(视频播放)
- 分包 community/: index(社群), detail(话题), publish(发帖) - 仍为空壳

## TabBar 5Tab布局
1. 首页 (index, selected=0)
2. 估分 (exam-tab, selected=1)
3. 快练 (quick-tab, selected=2)
4. 背诵 (memorize, selected=3)
5. 我的 (profile, selected=4)

## 开发进度 (2026-03-25)
- 核心刷题链路：✅ 首页→答题→答题卡→解析
- 登录/个人信息：✅
- 全部 training/my/course 分包页面：✅
- 全局组件完善：✅ (card/empty-state/fab-button/top-nav)
- community 分包：❌ 仍为空壳（非高优先级）
- 导航栏适配：✅ 已修复 exam-tab/quick-tab/memorize 三个 Tab 页的 navigationStyle 配置

## 功能规划文档 (2026-03-25 生成)
- 文档目录：`03 开发文档/`
- `00-功能开发总目录.md` —— 33个任务的全量清单（带优先级）
- `01-行测模块功能规划.md` —— 每日一练/专项练习/考场模式/数据分流
- `02-申论模块功能规划.md` —— 申论答题页/热点素材/规范表述/参考答案页
- `03-我的模块功能规划.md` —— 练习记录/错题本/收藏/统计
- `04-Mock数据扩充方案.md` —— 所有 Mock 数据新建和扩充方案

## 待实现功能（当前均为 toast 占位）
- 每日一练（首页快捷入口）→ 需新建 daily 页面
- 专项练习（考点树点击）→ 需修改 onTreeNodeTap
- 考场模式开始考试 → 需修改 handleStartExam + 新建 exam-report 页
- 申论答题页 → 需新建 shenlun 页面（主观题文本输入）
- 记录页点击进详情 → 需修改 handleRecordTap
- 错题本写入 → 需修改 handleOptionTap 答错时自动写入
- 收藏功能 → 需修改 handleCollect

## 练习类型 practiceType 规范
- `daily`：每日一练（行测5题）
- `practice`：专项练习（自主刷题）
- `exam`：考场模式（模拟刷题）
- `quick`：快练（Tab 页）
