/**
 * 全局组件 - 通用卡片
 * 可用于 Banner、功能入口、信息展示等
 */
Component({
  properties: {
    // 标题
    title: {
      type: String,
      value: '',
    },
    // 副标题
    subtitle: {
      type: String,
      value: '',
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      value: false,
    },
    // 圆角
    radius: {
      type: String,
      value: '24rpx',
    },
    // 内边距
    padding: {
      type: String,
      value: '28rpx',
    },
    // 外边距
    margin: {
      type: String,
      value: '0 32rpx 24rpx',
    },
    // 背景色
    bgColor: {
      type: String,
      value: '#FFFFFF',
    },
    // 是否显示阴影
    shadow: {
      type: Boolean,
      value: true,
    },
  },

  methods: {
    onTap() {
      if (!this.data.clickable) return
      this.triggerEvent('tap')
    },
  },
})
