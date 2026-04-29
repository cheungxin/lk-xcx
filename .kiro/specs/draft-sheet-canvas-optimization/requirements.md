# 需求文档：草稿画板组件 Canvas 优化

## 简介

本需求文档定义了微信小程序草稿画板组件 (draft-sheet) 的 Canvas 绘画功能优化需求。当前组件使用旧版 Canvas API，存在性能问题、坐标转换不准确、高 DPI 屏幕模糊等问题。本次优化旨在升级到 Canvas 2D API，提供高性能、流畅、准确的手写绘画体验。

## 术语表

- **Canvas_Manager**: Canvas 管理器，负责 Canvas 2D 上下文的初始化和管理
- **Coordinate_Transformer**: 坐标转换器，负责将触摸事件坐标转换为 Canvas 坐标
- **Drawing_Engine**: 绘画引擎，负责管理绘画操作、笔画路径和渲染逻辑
- **Stroke_Path**: 笔画路径，包含颜色、线宽和点坐标数组的数据结构
- **DPR**: 设备像素比 (Device Pixel Ratio)，用于适配高清屏幕
- **Canvas_2D_Context**: Canvas 2D 渲染上下文，用于执行绘画操作
- **Scene_Key**: 场景标识符，用于隔离不同题目的草稿数据
- **Touch_Event**: 触摸事件，包含用户触摸屏幕的坐标信息
- **Storage_Layer**: 存储层，负责草稿数据的持久化

## 需求

### 需求 1: Canvas 2D API 升级

**用户故事**: 作为开发者，我希望组件使用 Canvas 2D API，以便获得更好的性能和兼容性。

#### 验收标准

1. THE Canvas_Manager SHALL 使用 Canvas 2D API 替代旧版 `wx.createCanvasContext`
2. WHEN 组件初始化时，THE Canvas_Manager SHALL 通过 `wx.createSelectorQuery()` 获取 Canvas 节点
3. WHEN 获取 Canvas 节点后，THE Canvas_Manager SHALL 调用 `canvas.getContext('2d')` 获取 Canvas_2D_Context
4. THE Canvas_Manager SHALL 设置 Canvas 的 `type` 属性为 `"2d"`
5. WHEN Canvas 2D API 不可用时，THE Canvas_Manager SHALL 返回初始化失败状态

### 需求 2: Canvas 初始化与重试机制

**用户故事**: 作为用户，我希望打开草稿画板时能够可靠地初始化 Canvas，即使在 DOM 未完全准备好的情况下。

#### 验收标准

1. WHEN 组件的弹窗打开时，THE Canvas_Manager SHALL 初始化 Canvas_2D_Context
2. WHEN Canvas 节点查询失败时，THE Canvas_Manager SHALL 等待 50ms 后重试
3. WHEN 重试次数达到 5 次后仍失败时，THE Canvas_Manager SHALL 返回初始化失败状态
4. WHEN 初始化成功时，THE Canvas_Manager SHALL 返回包含 Canvas_2D_Context、Canvas 对象、DPR 和边界矩形的结果对象
5. WHEN 组件在初始化过程中关闭时，THE Canvas_Manager SHALL 停止初始化并返回失败状态

### 需求 3: 高 DPI 屏幕适配

**用户故事**: 作为用户，我希望在高分辨率屏幕上绘画时笔迹清晰，不会出现模糊现象。

#### 验收标准

1. WHEN Canvas 初始化时，THE Canvas_Manager SHALL 获取设备的 DPR 值
2. WHEN 设置 Canvas 尺寸时，THE Canvas_Manager SHALL 将物理宽度设置为逻辑宽度乘以 DPR
3. WHEN 设置 Canvas 尺寸时，THE Canvas_Manager SHALL 将物理高度设置为逻辑高度乘以 DPR
4. WHEN Canvas 尺寸设置完成后，THE Canvas_Manager SHALL 调用 `ctx.scale(dpr, dpr)` 缩放上下文
5. THE Canvas_Manager SHALL 确保 Canvas 样式尺寸保持为逻辑尺寸

### 需求 4: 触摸坐标转换

**用户故事**: 作为用户，我希望触摸屏幕时绘画位置准确，笔迹出现在我手指触摸的位置。

#### 验收标准

1. WHEN 接收到触摸事件时，THE Coordinate_Transformer SHALL 从触摸对象中提取坐标值
2. WHEN 提取坐标时，THE Coordinate_Transformer SHALL 按优先级尝试 `x`、`clientX`、`pageX` 属性
3. WHEN 计算 Canvas 坐标时，THE Coordinate_Transformer SHALL 将触摸坐标减去 Canvas 边界偏移量
4. WHEN 坐标超出 Canvas 范围时，THE Coordinate_Transformer SHALL 将坐标裁剪到 Canvas 边界内
5. WHEN 触摸对象不包含有效坐标时，THE Coordinate_Transformer SHALL 返回 null

### 需求 5: 绘画操作 - 开始笔画

**用户故事**: 作为用户，我希望触摸屏幕时能够开始新的笔画，并在触摸点显示绘画起点。

#### 验收标准

1. WHEN 用户触摸屏幕时 (touchstart)，THE Drawing_Engine SHALL 创建新的 Stroke_Path 对象
2. WHEN 创建 Stroke_Path 时，THE Drawing_Engine SHALL 设置默认颜色为 `#FF7D00`
3. WHEN 创建 Stroke_Path 时，THE Drawing_Engine SHALL 设置默认线宽为 4
4. WHEN 开始笔画时，THE Drawing_Engine SHALL 将触摸点添加到 Stroke_Path 的点数组
5. WHEN 笔画只有一个点时，THE Drawing_Engine SHALL 绘制圆点作为起始标记
6. WHEN 开始绘画时，IF 显示占位符为 true，THEN THE 组件 SHALL 隐藏占位符

### 需求 6: 绘画操作 - 绘制线段

**用户故事**: 作为用户，我希望移动手指时能够流畅地绘制连续的线条，跟随我的手指轨迹。

#### 验收标准

1. WHEN 用户移动手指时 (touchmove)，THE Drawing_Engine SHALL 获取当前触摸坐标
2. WHEN 获取新坐标后，THE Drawing_Engine SHALL 将新点添加到当前 Stroke_Path 的点数组
3. WHEN 添加新点后，THE Drawing_Engine SHALL 从上一个点绘制线段到新点
4. WHEN 绘制线段时，THE Drawing_Engine SHALL 使用当前 Stroke_Path 的颜色和线宽
5. WHEN 绘制线段时，THE Drawing_Engine SHALL 设置线条端点样式为圆形 (`lineCap = 'round'`)
6. WHEN 绘制线段时，THE Drawing_Engine SHALL 设置线条连接样式为圆形 (`lineJoin = 'round'`)
7. WHEN 用户未开始绘画时，THE Drawing_Engine SHALL 忽略 touchmove 事件

### 需求 7: 绘画操作 - 结束笔画

**用户故事**: 作为用户，我希望抬起手指时能够完成当前笔画，并自动保存绘画内容。

#### 验收标准

1. WHEN 用户抬起手指时 (touchend)，THE Drawing_Engine SHALL 完成当前 Stroke_Path
2. WHEN 完成笔画时，THE Drawing_Engine SHALL 将 Stroke_Path 添加到路径数组
3. WHEN 保存笔画后，THE Drawing_Engine SHALL 清空当前 Stroke_Path 引用
4. WHEN 笔画保存后，THE Storage_Layer SHALL 将路径数组持久化到本地存储
5. WHEN 保存成功后，THE 组件 SHALL 更新状态为有内容 (`hasContent = true`)
6. WHEN 保存成功后，THE 组件 SHALL 启用撤销功能 (`canUndo = true`)
7. WHEN 保存成功后，THE 组件 SHALL 更新保存提示文本为当前时间
8. WHEN 保存成功后，THE 组件 SHALL 触发 `change` 事件通知父组件

### 需求 8: 路径重绘

**用户故事**: 作为用户，我希望重新打开草稿画板时能够看到之前绘制的内容，保持原样。

#### 验收标准

1. WHEN 组件打开时，THE Drawing_Engine SHALL 从 Storage_Layer 加载已保存的路径数组
2. WHEN 加载路径后，THE Drawing_Engine SHALL 清空 Canvas
3. WHEN 重绘路径时，THE Drawing_Engine SHALL 按保存顺序遍历所有 Stroke_Path
4. WHEN 重绘单个路径时，IF 路径只有一个点，THEN THE Drawing_Engine SHALL 绘制圆点
5. WHEN 重绘单个路径时，IF 路径有多个点，THEN THE Drawing_Engine SHALL 连接所有点为线段
6. WHEN 重绘路径时，THE Drawing_Engine SHALL 使用路径保存的颜色和线宽
7. FOR ALL 有效的路径数组，THE Drawing_Engine SHALL 确保多次重绘产生相同的视觉结果（幂等性）

### 需求 9: 撤销操作

**用户故事**: 作为用户，我希望能够撤销最后一笔绘画，以便纠正错误。

#### 验收标准

1. WHEN 用户点击撤销按钮时，THE 组件 SHALL 从路径数组中移除最后一个 Stroke_Path
2. WHEN 移除路径后，THE Drawing_Engine SHALL 重绘所有剩余路径
3. WHEN 移除路径后，THE Storage_Layer SHALL 更新持久化数据
4. WHEN 路径数组为空时，THE 组件 SHALL 禁用撤销按钮 (`canUndo = false`)
5. WHEN 路径数组为空时，THE 组件 SHALL 显示占位符
6. WHEN 路径数组为空时，THE 组件 SHALL 更新状态为无内容 (`hasContent = false`)
7. WHEN 撤销操作完成后，THE 组件 SHALL 更新保存提示文本

### 需求 10: 清空操作

**用户故事**: 作为用户，我希望能够清空整个草稿画板，以便重新开始绘画。

#### 验收标准

1. WHEN 用户点击清空按钮时，THE 组件 SHALL 显示确认对话框
2. WHEN 用户确认清空时，THE 组件 SHALL 清空路径数组
3. WHEN 清空路径后，THE Drawing_Engine SHALL 清空 Canvas
4. WHEN 清空路径后，THE Storage_Layer SHALL 删除对应 Scene_Key 的持久化数据
5. WHEN 清空完成后，THE 组件 SHALL 更新状态为无内容 (`hasContent = false`)
6. WHEN 清空完成后，THE 组件 SHALL 禁用撤销按钮 (`canUndo = false`)
7. WHEN 清空完成后，THE 组件 SHALL 显示占位符
8. WHEN 清空完成后，THE 组件 SHALL 重置保存提示文本
9. WHEN 用户取消清空时，THE 组件 SHALL 保持当前状态不变

### 需求 11: 场景数据隔离

**用户故事**: 作为用户，我希望在不同题目中使用草稿画板时，每个题目的草稿内容独立保存，互不影响。

#### 验收标准

1. WHEN 组件接收 Scene_Key 属性时，THE Storage_Layer SHALL 使用 Scene_Key 作为存储键的一部分
2. WHEN 保存草稿时，THE Storage_Layer SHALL 将数据保存到对应 Scene_Key 的存储空间
3. WHEN 加载草稿时，THE Storage_Layer SHALL 从对应 Scene_Key 的存储空间读取数据
4. WHEN 清空草稿时，THE Storage_Layer SHALL 只清空对应 Scene_Key 的数据
5. FOR ALL 不同的 Scene_Key，THE Storage_Layer SHALL 确保数据完全隔离

### 需求 12: 错误处理 - Canvas 初始化失败

**用户故事**: 作为用户，即使 Canvas 初始化失败，我也希望应用不会崩溃，并能够重试。

#### 验收标准

1. WHEN Canvas 节点查询失败时，THE Canvas_Manager SHALL 返回失败状态而不抛出异常
2. WHEN 初始化失败时，THE 组件 SHALL 保持可用状态
3. WHEN 用户关闭并重新打开弹窗时，THE Canvas_Manager SHALL 重新尝试初始化
4. WHEN 初始化失败时，THE 组件 SHALL 记录警告信息（如果有日志系统）

### 需求 13: 错误处理 - 触摸坐标无效

**用户故事**: 作为用户，即使触摸事件数据异常，我也希望应用能够继续正常工作。

#### 验收标准

1. WHEN 触摸对象不包含有效坐标时，THE Coordinate_Transformer SHALL 返回 null
2. WHEN 坐标转换返回 null 时，THE Drawing_Engine SHALL 忽略该触摸事件
3. WHEN 忽略触摸事件时，THE Drawing_Engine SHALL 保持当前绘画状态不变
4. WHEN 下一个有效触摸事件到达时，THE Drawing_Engine SHALL 恢复正常绘画

### 需求 14: 错误处理 - 存储操作失败

**用户故事**: 作为用户，即使存储空间不足导致保存失败，我也希望能够继续绘画，并收到提示。

#### 验收标准

1. WHEN 存储操作抛出异常时，THE Storage_Layer SHALL 捕获异常
2. WHEN 存储失败时，THE 组件 SHALL 显示提示信息："草稿保存失败，请清理存储空间"
3. WHEN 存储失败时，THE Drawing_Engine SHALL 保持绘画功能可用
4. WHEN 存储失败时，THE 组件 SHALL 在内存中保留当前会话的绘画内容
5. WHEN 用户清理存储空间后，THE Storage_Layer SHALL 在下次绘画时重新尝试保存

### 需求 15: 错误处理 - 组件在绘画过程中关闭

**用户故事**: 作为用户，如果我在绘画过程中关闭草稿画板，我希望已完成的笔画被保存，未完成的笔画被丢弃。

#### 验收标准

1. WHEN 组件关闭时，THE 组件 SHALL 设置绘画状态为 false (`isDrawing = false`)
2. WHEN 绘画状态为 false 时，THE Drawing_Engine SHALL 忽略后续的 touchmove 和 touchend 事件
3. WHEN 丢弃未完成笔画时，THE Drawing_Engine SHALL 不将其添加到路径数组
4. WHEN 组件关闭时，THE Storage_Layer SHALL 保留已完成的笔画数据
5. WHEN 重新打开组件时，THE Drawing_Engine SHALL 恢复已保存的笔画内容

### 需求 16: 性能优化 - 增量绘制

**用户故事**: 作为用户，我希望绘画过程流畅，没有明显的延迟或卡顿。

#### 验收标准

1. WHEN 处理 touchmove 事件时，THE Drawing_Engine SHALL 只绘制新增的线段
2. WHEN 绘制新线段时，THE Drawing_Engine SHALL 不重绘整个 Canvas
3. WHEN 绘制线段时，THE Drawing_Engine SHALL 直接调用 `ctx.stroke()` 而不调用 `draw()`
4. THE Drawing_Engine SHALL 确保触摸响应延迟小于 16ms（60 FPS）
5. THE Drawing_Engine SHALL 确保单笔绘制时间小于 50ms

### 需求 17: 性能优化 - 坐标计算缓存

**用户故事**: 作为开发者，我希望减少不必要的 DOM 查询，提升坐标转换性能。

#### 验收标准

1. WHEN Canvas 初始化时，THE Canvas_Manager SHALL 查询并缓存 Canvas 边界矩形
2. WHEN 处理触摸事件时，THE Coordinate_Transformer SHALL 使用缓存的边界矩形
3. THE Coordinate_Transformer SHALL 避免在每次触摸事件中重复查询 DOM
4. WHEN 组件关闭时，THE Canvas_Manager SHALL 清除缓存的边界矩形

### 需求 18: 性能优化 - 内存管理

**用户故事**: 作为用户，我希望应用的内存占用合理，不会因为长时间使用而变慢。

#### 验收标准

1. THE 组件 SHALL 限制路径数组的最大大小为 100 笔
2. WHEN 路径数组达到上限时，THE 组件 SHALL 移除最早的笔画
3. WHEN 组件销毁时，THE Canvas_Manager SHALL 释放 Canvas 资源
4. WHEN 组件销毁时，THE 组件 SHALL 清空路径数组和当前笔画引用
5. THE 组件 SHALL 确保总内存占用小于 5MB（包含路径数据）

### 需求 19: 兼容性要求

**用户故事**: 作为开发者，我希望组件能够在支持的微信小程序版本上正常工作。

#### 验收标准

1. THE 组件 SHALL 要求微信小程序基础库版本 >= 2.9.0
2. WHEN 基础库版本低于 2.9.0 时，THE 组件 SHALL 显示不支持提示
3. THE 组件 SHALL 在 iOS 和 Android 平台上提供一致的绘画体验
4. THE 组件 SHALL 在不同 DPR 设备（1x, 2x, 3x）上正确显示

### 需求 20: 用户界面反馈

**用户故事**: 作为用户，我希望在操作草稿画板时能够获得清晰的状态反馈。

#### 验收标准

1. WHEN 草稿画板为空时，THE 组件 SHALL 显示占位符文本
2. WHEN 用户开始绘画时，THE 组件 SHALL 隐藏占位符
3. WHEN 保存草稿后，THE 组件 SHALL 显示保存时间提示
4. WHEN 没有可撤销内容时，THE 组件 SHALL 禁用撤销按钮
5. WHEN 草稿画板为空时，THE 组件 SHALL 禁用清空按钮
6. WHEN 执行清空操作时，THE 组件 SHALL 显示确认对话框
