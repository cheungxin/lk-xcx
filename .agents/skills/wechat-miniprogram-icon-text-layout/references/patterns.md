# 常用模式

## 1. 左图标 + 多行主文案 + 右侧箭头

```xml
<view class="action-row">
  <view class="action-row__main">
    <t-icon class="action-row__icon" name="edit" size="32rpx" />
    <text class="action-row__text">文字可能换行，所以左侧必须 top 对齐</text>
  </view>
  <t-icon name="chevron-right" size="32rpx" />
</view>
```

```css
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.action-row__main {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.action-row__icon {
  flex-shrink: 0;
  margin-top: 4rpx;
}

.action-row__text {
  flex: 1;
  min-width: 0;
  display: block;
  line-height: 42rpx;
  word-break: break-word;
}
```

## 2. 左图标 + 主副文案列

```xml
<view class="info-row">
  <t-icon class="info-row__icon" name="info-circle" size="32rpx" />
  <view class="info-row__content">
    <text class="info-row__title">标题可能换行</text>
    <text class="info-row__desc">副标题也可能换行</text>
  </view>
</view>
```

```css
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.info-row__icon {
  flex-shrink: 0;
  margin-top: 4rpx;
}

.info-row__content {
  flex: 1;
  min-width: 0;
}

.info-row__title,
.info-row__desc {
  display: block;
  word-break: break-word;
}
```

## 3. 单行场景

单行才居中：

```css
.single-line-row {
  display: flex;
  align-items: center;
}

.single-line-row__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 4. 复盘口诀

- 会换行，就 top 对齐
- `text` 不做 flex 容器
- 文案区一定要 `min-width: 0`
- 图标一定要 `flex-shrink: 0`

## 5. WXML 单行插值

动态文案默认单行写在标签内部：

```xml
<text class="action-btn__text">{{label}}</text>
<view class="desc">{{description}}</view>
```

避免：

```xml
<text class="action-btn__text">
  {{label}}
</text>
```
