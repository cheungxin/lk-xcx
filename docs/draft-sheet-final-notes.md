# 草稿纸组件最终说明

## 最新改进（已完成）

### 1. 触发按钮位置
- ✅ 保持在页面底部固定位置
- ✅ 不占用页面空间
- ✅ 不会被草稿纸挤上去
- ✅ 使用 `position: fixed` 和 `z-index: 10990`

### 2. 草稿纸全屏覆盖
- ✅ 覆盖整个屏幕（包括导航栏区域）
- ✅ 工具栏自动避开导航栏，显示在导航栏下方
- ✅ 使用 `margin-top: calc(var(--status-bar-height) + 44px)` 实现
- ✅ 遮罩层从顶部开始，半透明效果

### 3. 关闭功能
- ✅ 点击左上角关闭按钮可关闭
- ✅ 点击遮罩层（画布外区域）可关闭
- ✅ 工具栏和画布区域不会触发关闭

### 4. 触摸坐标
- ✅ 优化了坐标计算逻辑
- ✅ 正确处理 Canvas 2D 坐标系统
- ✅ 支持多种触摸坐标格式（x/y, clientX/clientY, pageX/pageY）

## 组件结构

```
草稿纸组件
├── 触发按钮（固定在底部右侧）
│   ├── 图标
│   └── 内容提示小圆点
│
└── 全屏草稿纸（打开时显示）
    ├── 半透明遮罩（点击关闭）
    ├── 顶部工具栏（避开导航栏）
    │   ├── 关闭按钮
    │   ├── 标题
    │   └── 操作按钮（撤销、重做、清空）
    └── 画布区域
        ├── 占位提示
        └── Canvas 2D 画布
```

## 关键技术点

### 1. 层级关系
```
导航栏: z-index: 默认（微信原生）
触发按钮: z-index: 10990
草稿纸容器: z-index: 11500
  ├── 遮罩层: z-index: 1（相对）
  ├── 工具栏: z-index: 2（相对）
  └── 画布: z-index: 2（相对）
```

### 2. 导航栏避让
```css
.draft-sheet-fullscreen__toolbar {
  margin-top: calc(var(--status-bar-height) + 44px);
}
```
- `var(--status-bar-height)`: 状态栏高度（动态获取）
- `44px`: 导航栏高度（微信标准）

### 3. 事件处理
- 遮罩层：`bindtap="handleClose"` - 点击关闭
- 工具栏：`catchtap="handleCatchTap"` - 阻止冒泡
- 画布：`catchtouchstart/move/end` - 绘画事件

### 4. 坐标转换
```javascript
// 触摸坐标 -> 画布坐标
const x = touchX - canvasRect.left
const y = touchY - canvasRect.top
```

## 使用示例

### 基本用法
```xml
<draft-sheet 
  sceneKey="question_{{questionId}}"
  themeMode="{{themeMode}}"
  bottomOffset="{{188}}"
  rightOffset="{{24}}"
/>
```

### 切换题目时更新 sceneKey
```javascript
// 页面 JS
data: {
  currentQuestionId: 1,
  draftSceneKey: 'question_1'
},

onQuestionChange(questionId) {
  this.setData({
    currentQuestionId: questionId,
    draftSceneKey: `question_${questionId}`
  })
}
```

## 测试要点

### 功能测试
- [ ] 触发按钮在底部固定位置
- [ ] 点击触发按钮打开草稿纸
- [ ] 草稿纸覆盖整个屏幕
- [ ] 工具栏在导航栏下方可见
- [ ] 可以看到底下的题目内容（半透明）
- [ ] 点击关闭按钮能关闭
- [ ] 点击遮罩层（画布外）能关闭
- [ ] 在画布上画画不会关闭
- [ ] 画笔跟手，位置准确
- [ ] 撤销、重做、清空功能正常

### 视觉测试
- [ ] 浅色模式：画笔黑色，遮罩浅色
- [ ] 深色模式：画笔白色，遮罩深色
- [ ] 工具栏按钮清晰可见
- [ ] 禁用状态按钮变灰
- [ ] 有内容时触发按钮显示橙色小圆点

### 兼容性测试
- [ ] iPhone 显示正常
- [ ] Android 显示正常
- [ ] 不同屏幕尺寸正常
- [ ] 不同状态栏高度正常

## 常见问题

### Q: 画笔还是不跟手怎么办？
A: 打开控制台，查看 `[draft-sheet] Canvas prepared` 日志，检查 `canvasRect` 的值是否正确。

### Q: 工具栏被导航栏遮挡？
A: 检查 `statusBarHeight` 是否正确获取，可以在控制台输出查看。

### Q: 点击画布会关闭草稿纸？
A: 确保画布区域使用了 `catchtap="handleCatchTap"` 阻止事件冒泡。

### Q: 触发按钮被草稿纸遮挡？
A: 检查 z-index 设置，触发按钮应该是 10990，草稿纸是 11500。

## 性能优化建议

1. **移除调试日志**：生产环境删除所有 `console.log`
2. **限制笔画数量**：超过 100 笔提示用户清空
3. **节流处理**：如果卡顿，对 touchmove 进行节流

## 后续优化方向

1. 添加画笔粗细调节
2. 添加颜色选择
3. 添加橡皮擦功能
4. 支持导出图片
5. 支持多页草稿纸
