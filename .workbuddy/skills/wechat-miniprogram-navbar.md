# Skill: 微信小程序自定义导航栏适配

## 描述
本 Skill 定义了小程序自定义导航栏的标准实现方式，确保所有页面都能正确适配不同机型的状态栏高度，避免内容被导航栏遮挡。

---

## 核心原则

1. **每个使用自定义导航栏的页面必须在 JSON 中设置 `"navigationStyle": "custom"`**
2. **页面内容容器必须设置 `padding-top: {{navigationBarHeight}}px`**
3. **所有导航栏相关高度必须从 `app.globalData` 获取**

---

## 全局变量定义（已在 app.js 中初始化）

```javascript
// app.js 中已计算好以下全局变量
app.globalData = {
  statusBarHeight,      // 状态栏高度（电量、时间区域）
  titleBarHeight,       // 标题栏高度（导航操作区）
  navigationBarHeight,  // 导航栏总高度 = statusBarHeight + titleBarHeight
  capsule,              // 胶囊按钮位置信息
  screenHeight,         // 屏幕高度
  clientHeight          // 窗口高度
}
```

---

## 页面开发规范

### 1. 页面 JSON 配置（必须）

```json
{
  "usingComponents": {
    "navigation": "/components/nav/nav"
  },
  "navigationStyle": "custom"
}
```

### 2. 页面 JS 模板

```javascript
const app = getApp();
// 从全局获取导航栏高度变量
const { statusBarHeight, titleBarHeight, navigationBarHeight, capsule } = app.globalData;

Page({
  data: {
    // 必须将导航栏高度注入 data，供 WXML 使用
    statusBarHeight,
    titleBarHeight,
    navigationBarHeight,
    capsule
  },
  onLoad() {}
});
```

### 3. 页面 WXML 模板

```xml
<!-- 导航栏组件 -->
<navigation 
  bgColor="#ffffff" 
  isHome="{{true}}" 
  navigationColor="dark">
  <view slot="content">页面标题</view>
</navigation>

<!-- 页面内容容器：必须设置 padding-top -->
<view class="page-container" style="padding-top:{{navigationBarHeight}}px;">
  <!-- 页面内容放这里 -->
</view>
```

### 4. 页面 WXSS 样式

```css
.page-container {
  min-height: 100vh;
  box-sizing: border-box;
}
```

---

## 导航栏组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `bgColor` | String | '' | 导航栏背景色，如 `#52ca66`、`#ffffff` |
| `isHome` | Boolean | false | 是否显示「返回+主页」胶囊按钮 |
| `isBack` | Boolean | false | 是否只显示「返回」按钮（与 isHome 二选一） |
| `navigationColor` | String | '' | 文字/图标颜色：`white` 白色，`dark` 黑色 |
| `bgImage` | String | '' | 导航栏背景图片 URL |

---

## 使用场景示例

### 场景1：普通子页面（带返回+主页按钮）
```xml
<navigation bgColor="#ffffff" isHome="{{true}}" navigationColor="dark">
  <view slot="content">我的页面</view>
</navigation>
<view class="page-container" style="padding-top:{{navigationBarHeight}}px;">
  <!-- 内容 -->
</view>
```

### 场景2：首页（无返回按钮）
```xml
<navigation bgColor="#ff6600" navigationColor="white">
  <view slot="content">首页</view>
</navigation>
<view class="page-container" style="padding-top:{{navigationBarHeight}}px;">
  <!-- 内容 -->
</view>
```

### 场景3：深色背景页面
```xml
<navigation bgColor="#333333" isHome="{{true}}" navigationColor="white">
  <view slot="content">深色页面</view>
</navigation>
<view class="page-container" style="padding-top:{{navigationBarHeight}}px;">
  <!-- 内容 -->
</view>
```

---

## 常见错误

### ❌ 错误1：忘记设置 navigationStyle
```json
// ❌ 错误
{
  "usingComponents": {
    "navigation": "/components/nav/nav"
  }
}

// ✅ 正确
{
  "usingComponents": {
    "navigation": "/components/nav/nav"
  },
  "navigationStyle": "custom"
}
```

### ❌ 错误2：页面内容未设置 padding-top
```xml
<!-- ❌ 错误：内容会被导航栏遮挡 -->
<view class="page-container">
  <!-- 内容被遮挡！ -->
</view>

<!-- ✅ 正确 -->
<view class="page-container" style="padding-top:{{navigationBarHeight}}px;">
  <!-- 内容正常显示 -->
</view>
```

### ❌ 错误3：忘记从 globalData 获取变量
```javascript
// ❌ 错误
Page({
  data: {}
});

// ✅ 正确
const app = getApp();
const { navigationBarHeight } = app.globalData;
Page({
  data: { navigationBarHeight }
});
```

---

## 检查清单

创建新页面时，确认以下事项：

- [ ] 页面 JSON 设置 `"navigationStyle": "custom"`
- [ ] 页面 JSON 注册 `"navigation": "/components/nav/nav"` 组件
- [ ] 页面 JS 从 `app.globalData` 获取 `navigationBarHeight`
- [ ] 页面 WXML 引入 `<navigation>` 组件
- [ ] 页面内容容器设置 `style="padding-top:{{navigationBarHeight}}px;"`

---

## 参考文件

- 组件实现：`/miniprogram/components/nav/`
- 全局变量定义：`/miniprogram/app.js` 中的 `getSystemInfo()` 方法
- 使用示例：`/miniprogram/pages/user/wrongs/wrongs.wxml`