/**
 * 全局组件 - 浮窗按钮
 * 用于答题页的继续做题、答题卡等快捷入口
 */
Component({
  properties: {
    // 图标名称
    icon: {
      type: String,
      value: 'edit',
    },
    // 图标颜色
    iconColor: {
      type: String,
      value: '#FFFFFF',
    },
    // 背景色
    bgColor: {
      type: String,
      value: '#1664FF',
    },
    // 文字
    text: {
      type: String,
      value: '',
    },
    // 位置：right-bottom(右下) / left-bottom(左下)
    position: {
      type: String,
      value: 'right-bottom',
    },
    // 是否显示
    visible: {
      type: Boolean,
      value: true,
    },
    // 距底部距离（px）
    bottom: {
      type: Number,
      value: 200,
    },
  },

  methods: {
    onTap() {
      if (!this.data.visible) return
      this.triggerEvent('tap')
    },
  },
})
