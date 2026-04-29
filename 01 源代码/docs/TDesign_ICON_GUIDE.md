# TDesign图标使用规范

## 一、图标引入方式

### 1.1 局部引入（推荐）
在页面的 `index.json` 或组件的 `index.json` 中配置：

```json
{
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon"
  }
}
```

### 1.2 全局引入
在 `app.json` 中配置：

```json
{
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon"
  }
}
```

### 1.3 使用示例

```xml
<t-icon name="home" size="48rpx" color="#1664FF" />
<t-icon name="search" size="32rpx" color="#999999" />
```

## 二、常用图标对照表

### 2.1 导航与操作
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| home / home-filled | 首页 | TabBar首页图标 |
| search | 搜索 | 搜索框图标 |
| chevron-right | 右箭头 | 列表右侧箭头 |
| chevron-down | 下拉箭头 | 下拉选择箭头 |
| chevron-left | 左箭头 | 返回按钮 |
| more | 更多 | 导航栏更多操作 |
| close | 关闭 | 弹窗关闭按钮 |
| check | 勾选 | 选项选中状态 |
| add | 添加 | 新增按钮 |

### 2.2 用户相关
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| user / user-filled | 用户 | TabBar我的图标 |
| usercenter / usercenter-filled | 用户中心 | 个人中心 |
| avatar | 头像 | 用户头像占位 |
| logout | 退出登录 | 退出按钮 |

### 2.3 练习相关
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| edit / edit-filled | 编辑 | TabBar快练图标 |
| check-circle / check-circle-filled | 正确 | TabBar估分图标 |
| calendar | 日历 | 每日一练 |
| file | 文件 | 历年试卷 |
| layers | 图层 | 套题练习 |
| play-circle | 播放 | 开始做题 |

### 2.4 题目分类
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| government | 政府 | 政治理论 |
| bulb | 灯泡 | 常识判断 |
| book-open | 书籍 | 言语理解 |
| calculate | 计算器 | 数量关系 |
| brain | 脑图 | 判断推理 |
| chart-bar | 图表 | 资料分析 |

### 2.5 状态指示
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| star / star-filled | 星标 | 收藏 |
| star-off | 空星标 | 未收藏 |
| heart / heart-filled | 爱心 | 喜欢 |
| flag | 旗帜 | 标记/重点 |
| bookmark | 书签 | 学习记录 |
| clock | 时钟 | 用时统计 |

### 2.6 AI相关
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| robot | 机器人 | AI问答入口 |
| chat | 聊天 | 智能客服 |
| message | 消息 | 消息通知 |

### 2.7 文件相关
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| download | 下载 | 答题卡下载 |
| upload | 上传 | 答题卡上传 |
| photo | 图片 | 图片展示 |
| image | 图片 | 相册 |

### 2.8 反馈相关
| 图标名称 | 说明 | 使用场景 |
|---------|------|---------|
| check-circle | 正确 | 答案正确 |
| close-circle | 错误 | 答案错误 |
| help-circle | 帮助 | 帮助中心 |
| info-circle | 信息 | 提示信息 |

## 三、图标属性

### 3.1 基础属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| name | String | - | 图标名称 |
| size | String/Number | 24 | 图标大小 |
| color | String | inherit | 图标颜色 |

### 3.2 扩展属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| prefix | String | - | 自定义图标前缀 |
| tag | String | i | 组件根元素标签名 |

## 四、使用示例

### 4.1 首页TabBar图标

```xml
<!-- 首页 -->
<t-icon
  name="{{selected === 0 ? 'home-filled' : 'home'}}"
  size="48rpx"
  color="{{selected === 0 ? '#1664FF' : '#999999'}}"
/>

<!-- 估分 -->
<t-icon
  name="{{selected === 1 ? 'check-circle-filled' : 'check-circle'}}"
  size="48rpx"
  color="{{selected === 1 ? '#1664FF' : '#999999'}}"
/>
```

### 4.2 快捷入口图标

```xml
<!-- 每日一练 -->
<view class="icon-wrapper" style="background-color: #E8F0FF;">
  <t-icon name="calendar" size="48rpx" color="#1664FF" />
</view>

<!-- 历年试卷 -->
<view class="icon-wrapper" style="background-color: #FFF3E8;">
  <t-icon name="file" size="48rpx" color="#FF9800" />
</view>
```

### 4.3 分类图标

```xml
<!-- 政治理论 -->
<t-icon name="government" size="44rpx" color="#1664FF" />

<!-- 常识判断 -->
<t-icon name="bulb" size="44rpx" color="#07C160" />

<!-- 数量关系 -->
<t-icon name="calculate" size="44rpx" color="#E34D59" />
```

## 五、注意事项

### 5.1 开发者工具提示
控制台告警 "Failed to load font" 属于开发者工具的 bug，可以忽略，不影响真机使用。

### 5.2 图标大小
建议使用 rpx 单位，通用大小：
- 24rpx: 小图标（辅助图标）
- 32rpx: 常规图标（搜索等）
- 44rpx: 中等图标（分类图标）
- 48rpx: 大图标（TabBar图标）
- 64rpx: 特大图标（功能入口）

### 5.3 图标颜色
建议使用主题色或中性色：
- 主题色：`#1664FF`
- 成功色：`#07C160`
- 警告色：`#FF9800`
- 错误色：`#E34D59`
- 中性色：`#999999`
- 文字色：`#333333`

## 六、图标列表

完整的图标列表请参考：[TDesign图标组件](https://tdesign.tencent.com/miniprogram/components/icon)

常用图标分类：
- **基础图标**: home, search, edit, user, star, heart, clock, etc.
- **方向图标**: chevron-right, chevron-down, chevron-left, chevron-up, arrow-left, arrow-right, etc.
- **媒体图标**: photo, image, play-circle, pause-circle, etc.
- **文件图标**: file, folder, download, upload, etc.
- **位置图标**: location, pin, etc.
- **通讯图标**: chat, message, phone, mail, etc.
- **编辑图标**: edit, delete, add, remove, etc.
- **状态图标**: check-circle, close-circle, info-circle, help-circle, etc.

## 七、自定义图标

如果TDesign内置图标不满足需求，可以：

### 7.1 使用iconfont
```css
@font-face {
  font-family: 'iconfont';
  src: url('data:application/x-font-woff2;...') format('woff2');
}
```

### 7.2 使用本地图片
将图标图片放在 `assets/images/` 目录下，使用 `<image>` 标签引用。

## 八、图标命名规范

### 8.1 TDesign图标命名
- 全部小写
- 多单词用连字符分隔
- 示例：`check-circle`, `chevron-right`, `user-filled`

### 8.2 自定义图标前缀
```xml
<t-icon name="a-1h" prefix="icon" />
```

## 九、响应式图标

### 9.1 根据选中状态切换
```xml
<t-icon name="{{isActive ? 'star-filled' : 'star'}}" />
```

### 9.2 根据主题色切换
```xml
<t-icon name="heart" color="{{isLiked ? '#E34D59' : '#999999'}}" />
```

## 十、性能优化

### 10.1 按需引入
只在需要的页面引入图标组件，避免全局引入增加包体积。

### 10.2 图标缓存
微信小程序会自动缓存字体图标，第二次加载会更快。

### 10.3 图标尺寸
选择合适大小的图标，避免使用过大的图标增加内存占用。
