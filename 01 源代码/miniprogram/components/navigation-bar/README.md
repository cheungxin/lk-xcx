# 自定义导航栏组件 (navigation-bar)

适配 Skyline 渲染引擎的自定义导航栏组件，支持自适应布局和多种配置选项。

## 功能特性

- ✅ 自动获取系统信息和胶囊按钮位置
- ✅ 自适应计算导航栏高度
- ✅ 支持 iOS 和 Android 平台
- ✅ 支持自定义标题、背景色、文字颜色
- ✅ 支持返回按钮和首页按钮
- ✅ 支持自定义左侧、中间、右侧内容
- ✅ 支持事件回调

## 属性列表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | String | '' | 导航栏标题 |
| background | String | '#ffffff' | 导航栏背景色 |
| color | String | '#000000' | 导航栏文字颜色 |
| showBack | Boolean | true | 是否显示返回按钮 |
| showHome | Boolean | false | 是否显示首页按钮 |
| customRight | Boolean | false | 是否使用自定义右侧内容 |
| delta | Number | 1 | 返回的层级数 |

## 事件列表

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | 点击返回按钮时触发 | { delta: Number } |
| home | 点击首页按钮时触发 | - |
| rightclick | 点击右侧自定义内容时触发 | - |

## 插槽 (Slot)

| 插槽名 | 说明 |
|--------|------|
| left | 左侧自定义内容 |
| center | 中间自定义内容（当 title 为空时显示） |
| right | 右侧自定义内容（当 customRight 为 true 时显示） |

## 使用示例

### 基础用法

```wxml
<!-- 使用默认配置 -->
<navigation-bar title="页面标题" />
```

### 自定义颜色

```wxml
<!-- 深色导航栏 -->
<navigation-bar 
  title="页面标题" 
  background="#000000" 
  color="#ffffff" 
/>
```

### 显示首页按钮

```wxml
<!-- 同时显示返回和首页按钮 -->
<navigation-bar 
  title="页面标题" 
  showBack="{{true}}" 
  showHome="{{true}}" 
/>
```

### 自定义右侧内容

```wxml
<!-- 自定义右侧按钮 -->
<navigation-bar 
  title="页面标题" 
  customRight="{{true}}"
  bind:rightclick="handleRightClick"
>
  <view slot="right" class="custom-button">
    <text>分享</text>
  </view>
</navigation-bar>
```

### 完全自定义

```wxml
<!-- 使用插槽完全自定义导航栏内容 -->
<navigation-bar 
  background="#f5f5f5"
  showBack="{{false}}"
>
  <view slot="left" class="custom-left">
    <image src="/assets/icons/menu.png" />
  </view>
  
  <view slot="center" class="custom-center">
    <text>自定义标题</text>
  </view>
  
  <view slot="right" class="custom-right">
    <image src="/assets/icons/search.png" />
  </view>
</navigation-bar>
```

### 监听事件

```javascript
Page({
  // 返回按钮点击事件
  handleBack(e) {
    console.log('返回层级:', e.detail.delta)
    // 可以在这里添加自定义逻辑
  },
  
  // 首页按钮点击事件
  handleHome() {
    console.log('跳转首页')
    // 可以在这里添加自定义逻辑
  },
  
  // 右侧按钮点击事件
  handleRightClick() {
    console.log('右侧按钮点击')
    // 可以在这里添加自定义逻辑
  }
})
```

## 注意事项

1. **全局配置**: 使用自定义导航栏需要在 `app.json` 中设置 `"navigationStyle": "custom"`

2. **页面配置**: 如果只在某些页面使用自定义导航栏，可以在页面的 `.json` 文件中单独配置

3. **高度计算**: 组件会自动计算导航栏高度，包括状态栏高度和胶囊按钮位置

4. **兼容性**: 组件已适配 iOS 和 Android 平台，并兼容不同版本的微信客户端

5. **Skyline 渲染引擎**: 组件已针对 Skyline 渲染引擎进行优化，确保在 Skyline 模式下正常工作

## 技术实现

### 高度计算逻辑

```javascript
// 获取状态栏高度
const statusBarHeight = systemInfo.statusBarHeight

// 获取胶囊按钮信息
const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

// 计算导航栏高度
const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height

// 总高度
const totalHeight = statusBarHeight + navBarHeight
```

### 布局结构

- 使用占位元素避免内容被导航栏遮挡
- 导航栏主体使用固定定位 (fixed)
- 三栏布局：左侧、中间、右侧
- 支持插槽自定义各区域内容

## 更新日志

### v1.0.0 (2024)
- ✅ 初始版本
- ✅ 支持基础导航栏功能
- ✅ 适配 Skyline 渲染引擎
- ✅ 支持自定义配置和插槽
