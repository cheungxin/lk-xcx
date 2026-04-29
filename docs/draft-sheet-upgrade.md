# 草稿纸组件升级说明

## 改进内容

### 1. 全屏覆盖模式
- 从底部弹窗改为全屏半透明遮罩
- 用户可以看到底下的题目内容，同时在上面书写
- 完全阻止事件穿透，不会误触底下的选项

### 2. 优化的工具栏
- 顶部居中显示标题
- 左侧：关闭按钮
- 右侧：撤销、重做、清空按钮
- 所有按钮都有禁用状态提示

### 3. 画笔优化
- 画笔粗细调整为 3px（原来是 4px）
- 根据主题自动切换颜色：
  - 浅色模式：黑色 (#1D2129)
  - 深色模式：白色 (#FFFFFF)
- 使用 Canvas 2D API，性能更好

### 4. 新增重做功能
- 支持撤销后重做
- 重做栈会在新笔画时清空

### 5. 每题独立草稿
- 通过 `sceneKey` 区分不同题目
- 切换题目时自动加载对应的草稿
- 草稿自动保存到本地存储

## 使用方法

### 基本用法

```xml
<draft-sheet 
  sceneKey="question_{{currentQuestionId}}"
  themeMode="{{themeMode}}"
  bottomOffset="{{188}}"
  rightOffset="{{24}}"
/>
```

### 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| sceneKey | String | '' | 场景标识，用于区分不同题目的草稿 |
| title | String | '草稿纸' | 标题文字 |
| themeMode | String | 'light' | 主题模式：'light' 或 'dark' |
| bottomOffset | Number | 172 | 触发按钮距离底部的距离（rpx） |
| rightOffset | Number | 24 | 触发按钮距离右侧的距离（rpx） |
| showTrigger | Boolean | true | 是否显示触发按钮 |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| open | 草稿纸打开时触发 | { sceneKey, hasContent } |
| close | 草稿纸关闭时触发 | { sceneKey, hasContent } |
| change | 草稿内容变化时触发 | { sceneKey, hasContent, strokeCount } |
| clear | 草稿被清空时触发 | { sceneKey } |

### 方法

```javascript
// 获取组件实例
const draftSheet = this.selectComponent('#draftSheet')

// 打开草稿纸
draftSheet.open()

// 关闭草稿纸
draftSheet.close()
```

## 技术细节

### Canvas 2D API
使用微信小程序的 Canvas 2D API，相比旧版 API 有以下优势：
- 更好的性能
- 支持更多绘图特性
- 自动处理设备像素比（DPR）

### 事件阻止
通过以下方式防止事件穿透：
- 使用 `catch` 前缀捕获所有触摸事件
- CSS `touch-action: none` 禁止默认行为
- 高 z-index (11500) 确保在最上层

### 数据持久化
使用 `storage.js` 工具类保存草稿：
- 按 sceneKey 存储
- 记录更新时间
- 自动显示保存时间提示

## 注意事项

1. **sceneKey 必须唯一**：建议使用 `question_${questionId}` 格式
2. **主题切换**：确保传入正确的 themeMode，画笔颜色会自动适配
3. **Canvas 2D 兼容性**：需要微信基础库 2.9.0 及以上
4. **性能优化**：大量笔画时可能影响性能，建议限制笔画数量

## 测试建议

1. 测试不同主题下的画笔颜色
2. 测试切换题目时草稿的保存和加载
3. 测试撤销、重做、清空功能
4. 测试在草稿纸上书写时不会触发底下的按钮
5. 测试不同设备的显示效果（考虑 DPR）
