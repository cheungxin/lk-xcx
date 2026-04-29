---
name: wechat-miniprogram-tdesign
description: 微信小程序使用 TDesign 组件库的完整开发指引。用户提到微信小程序、TDesign 组件使用、页面/组件开发与改造、主题与样式定制、性能优化或排查 TDesign 相关问题时都应调用。
---

# 微信小程序 TDesign 开发 Skill

本技能用于在当前项目中基于 TDesign 组件库进行小程序页面与组件开发、改造与样式调整。

## 何时使用本技能

- 初始化或改造使用 TDesign 的微信小程序项目
- 新增业务页面、表单页面、列表页面，并希望用 TDesign 组件搭建
- 查询某个 TDesign 组件的用法、属性组合或典型场景示例
- 调整主题、颜色、间距等样式，或排查样式不生效问题
- 优化页面结构、交互流程或性能（按需引入组件、分包、懒加载）
- 处理 TDesign 相关报错（如 npm 构建失败、事件不触发等）

## 使用前置

在生成代码前，先读取并遵循 content7.json 中的项目结构与约定信息。
如需了解更完整的组件示例与场景实践，请按需打开根目录下的《微信小程序TDesign开发指南.md》。

## 项目结构与约定

- 项目类型：微信小程序，语言使用 JavaScript
- 入口文件：app.js / app.json / app.wxss
- 主题配置：theme.json
- 页面结构：pages/<模块>/<变体>/index.{js,json,wxml,wxss}
- 组件库：tdesign-miniprogram（位于 miniprogram_npm）

## 组件引入与配置

- 全局组件：在 app.json 的 usingComponents 中维护（如 t-button、t-icon、t-navbar）
- 页面组件：在对应页面的 index.json 中 usingComponents 按需引入
- 引入路径：tdesign-miniprogram/<component>/<component>
- 需要样式隔离时，使用 styleIsolation（shared / apply-shared），沿用同类页面的设置

如需更细的引入方式，可参考《微信小程序TDesign开发指南.md》的：
- “一、项目初始化与配置”：安装 npm、工具中构建 npm、themeLocation 引用
- “二、组件引入方式”：全局引入 / 页面级引入 / 组件级引入 示例

## 开发流程（按需执行）

1. 确认目标页面路径与是否为分包页面
2. 在页面 JSON 中配置 usingComponents 与 component
3. 在 WXML 中使用 TDesign 组件并绑定必要事件
4. 在 JS 中维护 data、lifetimes、methods，使用 setData 更新状态
5. 在 WXSS 中补充布局与样式，避免破坏组件默认样式
6. 如涉及主题，更新 theme.json 中对应键值

结合《微信小程序TDesign开发指南.md》，在具体任务中按以下方式选用内容：

- 需要搭建基础按钮、表单输入等：参考“三、常用组件使用示例”
  - Button：不同 theme、variant、size、shape 的组合
  - Input / Textarea：标签、前后缀图标、字数限制、状态（禁用、只读）
  - Radio / Checkbox：纵向、横向、卡片、全选等形态
  - Dialog / Toast：组件式与命令式调用的差异与典型用法
  - Navbar / Tabs / Popup / Loading / Icon / Cell 等
- 需要设计页面结构：参考“四、页面结构最佳实践”
  - 标准详情/表单页：顶部导航 + 容器 + 表单分组 + 底部按钮
  - 列表页：scroll-view + t-cell-group 的组合
  - 表单页：t-cell + t-input / t-checkbox-group 等组合方式
- 需要实现具体业务场景：参考“六、常见场景实现”
  - 下拉刷新 + 上拉加载
  - 搜索结果列表
  - 表单校验与错误提示（结合 Toast）
- 需要做样式/主题调整：参考“五、样式定制”
  - 使用 CSS 变量（如 --td-brand-color 等）做主题定制
  - 使用 external-classes 或 class 覆盖局部样式
- 需要做性能与调试：参考“七、性能优化建议”“八、调试技巧”
  - 按需引入组件与分包加载
  - 使用 lazy 图片、合理的滚动区域
  - setEnableDebug、Console 调试与真机调试

## 代码规范

- 仅使用 JavaScript，不使用 TypeScript
- 组件定义采用 Component({ data, lifetimes, methods })
- 不主动启动项目或开发服务
- 不添加多余注释；仅在用户明确要求时添加函数级必要注释

## 输出要求

- 修改内容以文件为维度清晰列出
- 涉及的文件路径必须明确
- 如新增页面或组件，给出对应的 JSON / WXML / JS / WXSS 变更

## 示例（引入组件的最小模式）

**页面 JSON：**
```json
{
  "component": true,
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button"
  }
}
```

**页面 WXML：**
```xml
<t-button theme="primary">确定</t-button>
```

如用户需求更复杂（例如完整表单页、列表页、搜索页、带校验的表单等），优先结合本 Skill 的流程说明，按以下顺序操作：
- 根据业务类型，在《微信小程序TDesign开发指南.md》中找到最接近的示例结构
- 以示例为基础，替换为当前业务字段与交互逻辑
- 保持 TDesign 组件属性与事件写法一致，仅调整文案、数据字段与校验规则
