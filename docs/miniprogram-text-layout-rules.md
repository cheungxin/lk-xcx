# 微信小程序文案布局规范

适用场景：

- 图标 + 文案
- 列表项
- 操作按钮
- 标题/副标题
- 任意动态文本插值

## 1. 动态文案默认单行写在标签内

推荐：

```xml
<text class="btn__text">{{label}}</text>
<view class="desc">{{description}}</view>
```

不推荐：

```xml
<text class="btn__text">
  {{label}}
</text>
```

原因：

- 小程序模板里的换行和缩进可能变成实际空白
- 紧凑布局里更容易出现文字不齐、宽度判断失真

## 2. 图标旁边的文案只要可能换行，就顶部对齐

推荐结构：

```xml
<view class="row">
  <view class="row__main">
    <t-icon class="row__icon" name="edit" size="32rpx" />
    <text class="row__text">{{label}}</text>
  </view>
  <text class="row__side">{{status}}</text>
</view>
```

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
  word-break: break-word;
}

.row__side {
  flex-shrink: 0;
}
```

## 3. 只有明确单行时才用 `align-items: center`

需要同时满足：

- 文案不会换行
- 或者已经做了 `white-space: nowrap`

## 4. 禁止写法

- 父容器 `align-items: center`，子文案却允许换行
- `text` 自己写 `display: flex`
- 文案区没有 `min-width: 0`
- 图标没有 `flex-shrink: 0`

## 5. 本次 practice 页复盘

这次实际修了两类问题：

- 底部“确认”按钮的 `text` 节点改成单行插值，避免模板空白影响对齐
- 更多操作区的图标 + 文案改成顶部对齐，避免文案换行时图标垂直跑偏

对应技能：

- `.agents/skills/wechat-miniprogram-icon-text-layout`
