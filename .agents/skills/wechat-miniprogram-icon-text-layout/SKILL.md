---
name: wechat-miniprogram-icon-text-layout
description: 微信小程序中涉及图标与文字混排、列表项、Cell、按钮、标题副标题、左右文案等场景时使用。用于避免 text 换行后图标、标题、副文案垂直不对齐，统一 single-line 与 multi-line 的布局规则、WXML 结构与 WXSS 写法。
---

# 微信小程序图标文字对齐规范

用于处理这类高频问题：

- 图标左侧，文案可能换成 2 行
- 标题 + 副标题与图标混排
- 左侧主文案可换行，右侧状态文案/箭头固定
- `text` 一换行，图标就“飘”到中间
- WXML 里的动态文案跨行写，首尾会混进空白

按下面顺序做，不要凭感觉堆 `align-items: center`。

## 1. 先判断文案类型

- 单行且必须居中：可以用 `align-items: center`
- 可能换行：用“顶部对齐”方案
- 标题 + 副标题：用“图标 + 文案列”方案

只要左侧文字存在换行可能，就不要把图标和文字放在同一个 `align-items: center` 的组里。

## 2. 多行场景默认结构

WXML：

```xml
<view class="row">
  <view class="row__main">
    <t-icon class="row__icon" name="info-circle" size="32rpx" />
    <text class="row__text">这段文案可能会换成两行甚至三行，所以要按多行规则处理</text>
  </view>

  <text class="row__side">未完成</text>
</view>
```

WXSS：

```css
.row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.row__main {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.row__icon {
  flex-shrink: 0;
  margin-top: 4rpx;
}

.row__text {
  flex: 1;
  min-width: 0;
  display: block;
  line-height: 1.5;
  word-break: break-word;
}

.row__side {
  flex-shrink: 0;
}
```

核心点：

- 图标容器 `flex-shrink: 0`
- 文案容器 `flex: 1` + `min-width: 0`
- 文案用 `display: block`，不要给 `text` 自己再套 `display: flex`
- 左侧主组用 `align-items: flex-start`

## 3. 单行场景才允许居中

只有在下面两个条件同时满足时，才用 `align-items: center`：

- 文案不会换行
- 或者你已经明确做了单行截断

示例：

```css
.cell {
  display: flex;
  align-items: center;
}

.cell__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 4. 禁止写法

下面这些最容易把页面做歪：

- 父容器 `align-items: center`，但子文案允许换行
- `text` 自己写成 `display: flex; align-items: center`
- 少了 `min-width: 0`，结果文本不收缩、挤爆布局
- 图标没有 `flex-shrink: 0`，窄屏时被压缩

## 5. 标题 + 副标题场景

结构：

```xml
<view class="item">
  <t-icon class="item__icon" name="assignment" size="32rpx" />
  <view class="item__content">
    <text class="item__title">这里是标题，可能换行</text>
    <text class="item__desc">这里是副标题，也可能换行</text>
  </view>
</view>
```

规则：

- 外层 `align-items: flex-start`
- 标题副标题放进单独列容器
- 列容器 `flex: 1; min-width: 0`

## 6. 交付前检查

- 把文案临时改长，看 2 行时图标是否贴着第一行
- 看窄屏下是否仍然对齐
- 看右侧状态文案/箭头是否被挤压
- 看是否误把 `text` 当 flex 容器使用

## 7. WXML 动态文案换行规则

短文案、按钮文案、标签文案、状态文案，默认都写成单行：

```xml
<text class="btn__text">{{label}}</text>
```

不要写成：

```xml
<text class="btn__text">
  {{label}}
</text>
```

原因：

- 小程序会把源码里的换行和缩进当成文本空白处理
- 在按钮、chip、图标旁文字这类紧凑布局里，特别容易出现视觉不齐
- 动态值前后多一个空格，就可能让文本宽度判断失真

即使该文案允许多行展示，也优先保持“标签内单行插值”，把换行交给样式，而不是交给模板源码：

```xml
<text class="content-text">{{content}}</text>
<view class="content-block">{{content}}</view>
```

## 8. 在这个仓库里怎么用

优先检查这几类位置：

- `more-action-row`
- 带 `t-icon + text` 的操作行
- 卡片标题区
- 答题页顶部/底部工具按钮
- 任意 `{{dynamicText}}` 被单独包在多行 `text/view` 里的地方

需要更具体的模式时，再打开 [references/patterns.md](references/patterns.md)。
