# 草稿纸组件 - 最终工作版本

## 完成时间
2026-03-28

## 技术方案

### Canvas API 选择
使用**旧版 Canvas API** (`wx.createCanvasContext`)

**原因**：
1. ✅ 简单可靠，容易调试
2. ✅ 兼容性好，支持所有微信版本
3. ✅ 代码量少，维护成本低
4. ✅ 满足当前所有功能需求

**Canvas 2D API 的问题**：
- 坐标系统复杂
- 需要处理 DPR（设备像素比）
- 渲染机制不同
- 调试困难

## 核心功能

### 1. 全屏半透明草稿纸 ✅
- 覆盖整个屏幕
- 半透明背景，可以看到底下的题目
- 工具栏避开导航栏

### 2. 绘画功能 ✅
- 流畅的手写体验
- 画笔粗细：3px
- 根据主题自动切换颜色：
  - 浅色模式：黑色 (#1D2129)
  - 深色模式：白色 (#FFFFFF)

### 3. 工具栏功能 ✅
- 关闭按钮
- 撤销按钮
- 重做按钮（暂未实现）
- 清空按钮

### 4. 页面滚动阻止 ✅
- 使用 `<page-meta>` 阻止页面滚动
- 打开草稿纸时禁用滚动
- 关闭后恢复滚动

### 5. 数据持久化 ✅
- 按 sceneKey 存储草稿
- 切换题目时自动保存和加载
- 支持跨页面保留

## 核心代码

### WXML
```xml
<!-- 阻止页面滚动 -->
<page-meta page-style="{{internalVisible ? 'overflow: hidden;' : ''}}" />

<!-- Canvas 使用旧版 API -->
<canvas
  canvas-id="draft-canvas"
  class="draft-sheet-fullscreen__canvas"
  disable-scroll="{{true}}"
  bindtouchstart="handleTouchStart"
  bindtouchmove="handleTouchMove"
  bindtouchend="handleTouchEnd"
  bindtouchcancel="handleTouchCancel"
></canvas>
```

### JS - 初始化
```javascript
// 使用旧版 Canvas API
context = wx.createCanvasContext('draft-canvas', this)
context.setLineCap('round')
context.setLineJoin('round')
```

### JS - 绘画逻辑
```javascript
// 开始绘画
handleTouchStart(e) {
  isButtonDown = true
  const touch = e.changedTouches[0]
  
  // 记录路径
  this.currentPath = {
    arrx: [touch.x],
    arry: [touch.y],
    color: strokeColor,
    lineWidth: DEFAULT_LINE_WIDTH
  }
  
  // 绘制起点
  context.beginPath()
  context.setStrokeStyle(this.currentPath.color)
  context.setLineWidth(this.currentPath.lineWidth)
  context.moveTo(touch.x, touch.y)
  context.arc(touch.x, touch.y, lineWidth / 2, 0, 2 * Math.PI)
  context.setFillStyle(this.currentPath.color)
  context.fill()
  context.draw(true) // 关键：true 表示保留之前的内容
}

// 移动绘画
handleTouchMove(e) {
  if (!isButtonDown) return
  
  const touch = e.changedTouches[0]
  // 使用贝塞尔曲线平滑路径
  // ... 计算中间点
  
  context.lineTo(x, y)
  context.stroke()
  context.draw(true) // 关键：true 表示保留之前的内容
}

// 结束绘画
handleTouchEnd() {
  isButtonDown = false
  // 保存路径到数组
  this.paths.push(this.currentPath)
  // 持久化
  this.persistDraft()
}
```

### JS - 重绘
```javascript
redrawCanvas() {
  context.clearRect(0, 0, 10000, 10000)
  
  this.paths.forEach(pathObj => {
    context.beginPath()
    context.setStrokeStyle(pathObj.color)
    context.setLineWidth(pathObj.lineWidth)
    context.moveTo(pathObj.arrx[0], pathObj.arry[0])
    
    pathObj.arrx.forEach((x, index) => {
      context.lineTo(x, pathObj.arry[index])
    })
    
    context.stroke()
    context.closePath()
  })
  
  context.draw() // 不需要 true，因为是完全重绘
}
```

## 关键点

### 1. context.draw(true) vs context.draw()
- `context.draw(true)` - 保留之前的内容，增量绘制
- `context.draw()` - 清空后重新绘制

### 2. 路径存储格式
```javascript
{
  arrx: [x1, x2, x3, ...],  // x 坐标数组
  arry: [y1, y2, y3, ...],  // y 坐标数组
  color: '#1D2129',         // 颜色
  lineWidth: 3              // 粗细
}
```

### 3. 事件处理
- 使用 `bindtouchstart/move/end` 而不是 `catchtouchstart/move/end`
- Canvas 自己处理触摸事件，不需要额外的事件阻止

### 4. 页面滚动阻止
- 使用 `<page-meta page-style="overflow: hidden">` 
- 比 CSS 更可靠

## 使用方式

### 在页面中使用
```xml
<!-- 底部操作栏中添加草稿按钮 -->
<view class="exam-nav-btn" bindtap="handleOpenDraft">
  <t-icon name="edit" size="44rpx" color="#4E5969" />
  <text>草稿</text>
</view>

<!-- 草稿纸组件 -->
<draft-sheet 
  id="draftSheet"
  sceneKey="{{draftSceneKey}}" 
  themeMode="{{themeMode}}" 
  showTrigger="{{false}}"
/>
```

### 在 JS 中打开
```javascript
handleOpenDraft() {
  const draftSheet = this.selectComponent('#draftSheet')
  if (draftSheet) {
    draftSheet.open()
  }
}
```

## 已集成的页面

1. ✅ 练习模式 (`training/practice`)
2. ✅ 考试模式 (`training/exam`)
3. ✅ 快速刷题 (`training/quick`)
4. ✅ 数量关系 (`training/math`)

## 测试清单

- [x] 可以正常打开草稿纸
- [x] 可以流畅绘画
- [x] 画笔颜色根据主题切换
- [x] 点击关闭按钮可关闭
- [x] 点击遮罩层可关闭
- [x] 撤销功能正常
- [x] 清空功能正常
- [x] 页面不能滚动
- [x] 底下的按钮不会被误触
- [x] 切换题目时草稿自动保存和加载

## 未来优化方向

### 短期（可选）
1. 实现重做功能
2. 添加画笔粗细调节
3. 添加颜色选择

### 长期（如需要）
1. 升级到 Canvas 2D API（性能优化）
2. 支持导出图片
3. 支持多页草稿纸
4. 添加手势识别

## 性能建议

1. 限制笔画数量（建议 100 笔以内）
2. 超过限制时提示用户清空
3. 避免频繁的完全重绘

## 注意事项

1. **不要混用新旧 Canvas API**
2. **context.draw(true) 很重要**，忘记会导致之前的内容消失
3. **clearRect 的尺寸要足够大**，建议用 10000x10000
4. **sceneKey 必须唯一**，建议格式：`draft:${page}:${questionId}`

## 参考资料

- 微信官方文档：Canvas API
- 参考实现：`/Volumes/Xin's Disk/工作/lingkao/lk-xcx/04 参考/calculations/module/draft`
