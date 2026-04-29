/**
 * 全局组件 - 空状态与加载态
 * 用于列表无数据、加载中等场景
 */
Component({
  properties: {
    // 状态类型：empty(空) / loading(加载中) / error(错误) / network(网络错误)
    type: {
      type: String,
      value: 'empty',
    },
    // 自定义图标
    icon: {
      type: String,
      value: '',
    },
    // 主文案
    title: {
      type: String,
      value: '暂无数据',
    },
    // 副文案
    description: {
      type: String,
      value: '',
    },
    // 是否显示重试按钮
    showRetry: {
      type: Boolean,
      value: false,
    },
    // 重试按钮文字
    retryText: {
      type: String,
      value: '点击重试',
    },
    // 图片高度
    imageHeight: {
      type: Number,
      value: 200,
    },
  },

  methods: {
    onRetry() {
      this.triggerEvent('retry')
    },
  },
})
