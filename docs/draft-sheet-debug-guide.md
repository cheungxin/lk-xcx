# 草稿纸组件调试指南

## 已修复的问题

### 1. 导航栏遮挡问题
- 草稿纸现在会自动避开顶部导航栏
- 使用 `padding-top: calc(var(--status-bar-height) + 44px)` 留出空间
- 状态栏高度通过 `wx.getSystemInfoSync()` 动态获取

### 2. 触摸坐标不跟手问题
- 优化了触摸坐标计算逻辑
- 添加了详细的调试日志
- 正确处理 Canvas 2D 的坐标系统

## 调试步骤

### 查看控制台日志

打开草稿纸并尝试画画时，控制台会输出以下信息：

```
[draft-sheet] Canvas prepared: {
  canvasSize: { width: 375, height: 667, dpr: 2 },
  canvasRect: { left: 0, top: 88, width: 375, height: 667 }
}

[draft-sheet] Touch start: {
  x: 100, y: 200,
  clientX: 100, clientY: 200,
  pageX: 100, pageY: 200
}

[draft-sheet] Canvas rect: {
  left: 0, top: 88, width: 375, height: 667
}

[draft-sheet] Touch point: {
  touchX: 100, touchY: 200,
  rect: { left: 0, top: 88, width: 375, height: 667 },
  point: { x: 100, y: 112 }
}
```

### 检查项

1. **canvasRect.top 是否正确**
   - 应该等于 `状态栏高度 + 导航栏高度 + 工具栏高度`
   - 通常是 88px 左右（状态栏 44px + 工具栏 44px）

2. **触摸坐标是否有效**
   - `touch.x` 和 `touch.y` 应该有值
   - 如果没有，会尝试使用 `clientX/clientY` 或 `pageX/pageY`

3. **计算后的 point 坐标**
   - `point.x` 和 `point.y` 应该在画布范围内
   - 应该与手指触摸位置一致

### 常见问题排查

#### 问题1：画笔位置偏移固定距离

**症状**：画笔总是在手指下方或上方固定距离

**原因**：canvasRect.top 计算不正确

**解决方案**：
1. 检查 `statusBarHeight` 是否正确获取
2. 确认导航栏高度（通常是 44px）
3. 检查 CSS 中的 padding-top 计算

#### 问题2：画笔完全不跟手

**症状**：画笔位置与手指位置完全不对应

**原因**：触摸坐标获取失败或坐标系统不匹配

**解决方案**：
1. 查看控制台日志，确认 touch 对象有值
2. 检查 canvasRect 是否正确初始化
3. 确认 Canvas 2D 是否正确创建

#### 问题3：DPR 导致的模糊

**症状**：画布内容模糊

**原因**：设备像素比（DPR）未正确处理

**解决方案**：
1. 检查 `canvas.width` 和 `canvas.height` 是否乘以了 DPR
2. 确认 `ctx.scale(dpr, dpr)` 是否执行
3. 查看日志中的 dpr 值

## 临时禁用调试日志

如果调试完成，想要移除日志输出，可以搜索并删除以下代码：

```javascript
console.log('[draft-sheet] ...')
console.warn('[draft-sheet] ...')
```

或者使用条件编译：

```javascript
const DEBUG = false

if (DEBUG) {
  console.log('[draft-sheet] ...')
}
```

## 性能优化建议

1. **减少日志输出**：在生产环境中移除所有 console.log
2. **节流处理**：如果画笔卡顿，可以对 touchmove 事件进行节流
3. **限制笔画数量**：超过一定数量后提示用户清空

## 测试设备建议

- iPhone（高 DPR，通常是 2 或 3）
- Android（不同 DPR，1.5 到 3）
- 不同屏幕尺寸的设备
- 不同微信版本

## 联系支持

如果问题仍然存在，请提供：
1. 设备型号和系统版本
2. 微信版本和基础库版本
3. 控制台完整日志
4. 问题截图或录屏
