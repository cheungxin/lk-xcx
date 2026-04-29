# TDesign 组件库集成配置说明

## 全局组件注册位置

在 `app.json` 的 `usingComponents` 中添加 TDesign 组件的全局注册：

```json
{
  "usingComponents": {
    "navigation-bar": "/miniprogram/components/navigation-bar/navigation-bar",
    
    // TDesign 组件全局注册示例（取消注释以启用）
    // "t-button": "tdesign-miniprogram/button/button",
    // "t-cell": "tdesign-miniprogram/cell/cell",
    // "t-cell-group": "tdesign-miniprogram/cell-group/cell-group",
    // "t-icon": "tdesign-miniprogram/icon/icon",
    // "t-input": "tdesign-miniprogram/input/input",
    // "t-dialog": "tdesign-miniprogram/dialog/dialog",
    // "t-toast": "tdesign-miniprogram/toast/toast",
    // "t-loading": "tdesign-miniprogram/loading/loading",
    // "t-tabs": "tdesign-miniprogram/tabs/tabs",
    // "t-tab-panel": "tdesign-miniprogram/tab-panel/tab-panel"
  }
}
```

## 使用说明

1. 安装 TDesign 组件库
2. 在 app.json 中注册需要的组件
3. 在页面中直接使用注册的组件
4. 参考 TDesign 官方文档进行配置和使用

详细文档：https://tdesign.tencent.com/miniprogram/overview
