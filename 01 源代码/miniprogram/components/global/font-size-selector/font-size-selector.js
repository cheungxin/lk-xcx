const APP_SETTINGS_KEY = 'appSettings'

const FONT_SIZE_OPTIONS = [
  { id: 'small', label: '小', scale: 0.9 },
  { id: 'standard', label: '标准', scale: 1.0 },
  { id: 'large', label: '大', scale: 1.1 },
  { id: 'xlarge', label: '特大', scale: 1.2 },
]

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    currentSize: {
      type: String,
      value: 'standard',
    },
  },

  data: {
    options: FONT_SIZE_OPTIONS,
  },

  methods: {
    handleClose() {
      this.triggerEvent('close')
    },

    handleSelect(e) {
      const { id } = e.currentTarget.dataset
      const option = FONT_SIZE_OPTIONS.find(item => item.id === id)
      
      if (!option) {
        return
      }

      // 保存到本地存储
      const settings = wx.getStorageSync(APP_SETTINGS_KEY) || {}
      const updatedSettings = {
        ...settings,
        fontSize: option.id,
        fontSizeLabel: option.label,
        fontSizeScale: option.scale,
      }
      
      wx.setStorageSync(APP_SETTINGS_KEY, updatedSettings)

      // 触发选择事件
      this.triggerEvent('select', {
        fontSize: option.id,
        fontSizeLabel: option.label,
        fontSizeScale: option.scale,
      })

      // 关闭弹窗
      this.handleClose()

      // 提示
      wx.showToast({
        title: `已设置为${option.label}字体`,
        icon: 'none',
        duration: 1500,
      })
    },

    handleVisibleChange(e) {
      if (!e.detail.visible) {
        this.handleClose()
      }
    },
  },
})
