# 微信小程序自定义导航栏 (TDesign) 开发规范

本规范定义了项目中“自定义导航栏”的标准实现方式，适用于所有使用 `navigationStyle: custom` 的页面。

## 1. 配置文件 (.json)
必须在页面配置文件中开启自定义导航：
```json
{
  "navigationStyle": "custom",
  "usingComponents": {
    "t-navbar": "tdesign-miniprogram/navbar/navbar"
  }
}
```

## 2. 页面结构 (.wxml)
**标准结构：** 导航栏组件与内容容器并列，不进行嵌套。
- 导航栏使用 `fixed` 属性固定在顶部。
- 内容容器使用内联样式 `padding-top` 动态补偿导航栏高度，防止内容被遮挡。

```xml
<!-- 1. 顶部导航栏 (置于最顶层，代码块保持简洁易读) -->
<t-navbar title="页面标题" left-arrow fixed bind:go-back="onBack">
  <!-- 如需右侧操作，使用 slot="right" -->
  <view slot="right" class="nav-right" bindtap="onMoreTap">
    <t-icon name="ellipsis" size="48rpx" />
  </view>
</t-navbar>

<!-- 2. 主体内容页 (内容容器) -->
<!-- 必须给 padding-top 赋予动态高度数据 -->
<view class="favorite-page" style="padding-top: {{navigationBarHeight}}px;">
  <!-- 业务内容逐步展开 -->
</view>
```

## 3. 逻辑处理 (.js)
**核心严禁规则：** 严禁在脚本文件顶层（Page 构造器之外）直接对 `app.globalData` 进行数据解构。

**原因：** 顶层代码执行时，全局变量可能未就绪，且不具备响应式，会导致页面布局高度为 0。

**正确做法：** 必须在 `onLoad` 生命周期函数中进行赋值。

```javascript
const app = getApp();

Page({
  data: {
    // 初始化关键布局变量
    statusBarHeight: 0,
    titleBarHeight: 0,
    navigationBarHeight: 0,
    capsule: {}
  },

  onLoad(options) {
    // 在页面加载后，从 app.globalData 提取已经计算好的最新高度值
    const { 
      statusBarHeight, 
      titleBarHeight, 
      navigationBarHeight, 
      capsule 
    } = app.globalData;

    // 必须通过 setData 触发重新渲染
    this.setData({
      statusBarHeight,
      titleBarHeight,
      navigationBarHeight,
      capsule
    });

    // 这里处理后续加载逻辑
  },

  onBack() {
    wx.navigateBack();
  }
});
```

## 4. 经验 Checkbox
- [ ] 页面配置开启 custom 模式。
- [ ] 导航栏放在内容容器外层。
- [ ] 容器 padding-top 绑定了高度 px。
- [ ] JS 中 onLoad 动态获取高度，而非顶层常量引入。
