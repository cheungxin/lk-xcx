# 项目开发规范与状态记录 (content7)

## 视觉基调
- **主题色**: TDesign 默认蓝色
- **字号**: 标题 32rpx, 正文 28rpx, 辅助 24rpx
- **间距**: 边距 32rpx, 元素间距 16rpx
- **圆角**: 12rpx

## 交互原则
- **加载**: 使用 `tool.loading()` 展示加载中
- **反馈**: 使用 `tool.toast()` 提供用户反馈
- **跳转**: 使用 `router` 封装的方法进行页面跳转

## 命名规范
- **文件**: 小写中划线 (e.g., `answer-card`)
- **变量**: 小驼峰 (e.g., `userInfo`)
- **样式**: 小写中划线 (e.g., `.nav-bar-container`)

## 最新修复记录
- [x] 2026-03-26: 修复了 `subpackages/my/record/record.js` 中 `tool` 变量重复声明的问题。
- [x] 2026-03-26: 修复了 `subpackages/my/wrong/wrong.json` 中 `navigation` 组件路径错误（已更正为 `t-navbar`）。
- [x] 2026-03-26: 修复了 `subpackages/my/settings/settings.wxml` 中 `default-avatar.png` 引用错误，并统一了各页面的头像路径清理逻辑（移除错误的 `/miniprogram` 前缀）。

## 待办事项
- [ ] 实现学习记录点击进入详情的逻辑
- [ ] 优化学习记录的时间线展示动效
- [ ] 检查所有 Mock 数据中的页面跳转路径是否仍包含 `/miniprogram` 前缀（如 `mock/banner.js`）
