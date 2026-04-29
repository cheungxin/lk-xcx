import storage from '../../../utils/storage'

const DEFAULT_LINE_WIDTH = 3
const LIGHT_STROKE_COLOR = '#1D2129'
const DARK_STROKE_COLOR = '#FFFFFF'
const DEFAULT_SAVE_HINT = '切题和收起都不会丢失'

let context = null
let isButtonDown = false

const pad = (value) => String(value).padStart(2, '0')
const pickTouchCoordinate = (touch = {}, keys = []) => {
  for (let index = 0; index < keys.length; index += 1) {
    const value = touch[keys[index]]
    if (typeof value === 'number') {
      return value
    }
  }

  return 0
}

const formatSavedHint = (updatedAt) => {
  if (!updatedAt) {
    return '已自动保存'
  }

  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) {
    return '已自动保存'
  }

  return `已自动保存 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Component({
  properties: {
    sceneKey: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '草稿纸',
    },
    buttonText: {
      type: String,
      value: '草稿',
    },
    placeholder: {
      type: String,
      value: '手指直接书写，不用担心切题后丢失。',
    },
    bottomOffset: {
      type: Number,
      value: 172,
    },
    rightOffset: {
      type: Number,
      value: 24,
    },
    showTrigger: {
      type: Boolean,
      value: true,
    },
    themeMode: {
      type: String,
      value: 'light',
    },
  },

  data: {
    internalVisible: false,
    hasContent: false,
    canUndo: false,
    canRedo: false,
    showPlaceholder: true,
    saveHintText: DEFAULT_SAVE_HINT,
    statusBarHeight: 0,
  },

  observers: {
    sceneKey(sceneKey) {
      this.loadDraft(sceneKey)
    },
  },

  lifetimes: {
    attached() {
      this.paths = []
      this.currentPath = { arrx: [], arry: [] }
      
      // 获取系统信息
      try {
        const windowInfo = wx.getWindowInfo()
        const statusBarHeight = windowInfo.statusBarHeight || 0
        this.setData({ statusBarHeight })
      } catch (e) {
        console.warn('[draft-sheet] Failed to get window info:', e)
      }
      
      // 使用旧版 Canvas API
      context = wx.createCanvasContext('draft-canvas', this)
      context.setLineCap('round')
      context.setLineJoin('round')
      
      this.loadDraft(this.data.sceneKey)
    },

    detached() {
      context = null
      this.currentPath = null
    },
  },

  methods: {
    open() {
      this.handleOpen()
    },

    close() {
      this.closePanel()
    },

    handleOpen() {
      if (!this.data.sceneKey || this.data.internalVisible) {
        return
      }

      this.setData({ internalVisible: true }, () => {
        this.triggerEvent('open', {
          sceneKey: this.data.sceneKey,
          hasContent: this.data.hasContent,
        })
      })
    },

    handleClose() {
      this.closePanel()
    },



    handleCatchTap() {
      // catchtap 已自动阻止事件冒泡，无需手动处理
    },

    handleOverlayTap() {
      // 点击遮罩层关闭草稿纸
      this.handleClose()
    },

    closePanel() {
      if (!this.data.internalVisible) {
        return
      }

      isButtonDown = false
      this.currentPath = null
      this.persistDraft()
      this.setData({ internalVisible: false })
      
      this.triggerEvent('close', {
        sceneKey: this.data.sceneKey,
        hasContent: this.data.hasContent,
      })
    },

    loadDraft(sceneKey = this.data.sceneKey) {
      this.currentStroke = null
      this.redoStack = []

      if (!sceneKey) {
        this.paths = []
        this.setData({
          hasContent: false,
          canUndo: false,
          canRedo: false,
          showPlaceholder: true,
          saveHintText: DEFAULT_SAVE_HINT,
        })
        return
      }

      const draft = storage.getDraftSheet(sceneKey)
      this.paths = Array.isArray(draft?.paths) ? draft.paths : []
      const hasContent = this.paths.length > 0

      this.setData({
        hasContent,
        canUndo: hasContent,
        canRedo: false,
        showPlaceholder: !hasContent,
        saveHintText: hasContent ? formatSavedHint(draft.updatedAt) : DEFAULT_SAVE_HINT,
      })

      if (this.data.internalVisible && context) {
        this.redrawCanvas()
      }
    },

    handleTouchStart(e) {
      if (!context) {
        return
      }

      isButtonDown = true
      const touch = e.changedTouches[0]
      
      this.currentPath = {
        arrx: [touch.x],
        arry: [touch.y],
        color: this.data.themeMode === 'dark' ? DARK_STROKE_COLOR : LIGHT_STROKE_COLOR,
        lineWidth: DEFAULT_LINE_WIDTH
      }

      context.beginPath()
      context.setStrokeStyle(this.currentPath.color)
      context.setLineWidth(this.currentPath.lineWidth)
      context.moveTo(touch.x, touch.y)
      context.arc(touch.x, touch.y, this.currentPath.lineWidth / 2, 0, 2 * Math.PI)
      context.setFillStyle(this.currentPath.color)
      context.fill()
      context.draw(true)

      if (this.data.showPlaceholder) {
        this.setData({ showPlaceholder: false })
      }
    },

    handleTouchMove(e) {
      if (!isButtonDown || !context) {
        return
      }

      const touch = e.changedTouches[0]
      const arrxLen = this.currentPath.arrx.length
      const arryLen = this.currentPath.arry.length
      const sx = this.currentPath.arrx[arrxLen - 1]
      const sy = this.currentPath.arry[arryLen - 1]
      const ex = touch.x
      const ey = touch.y

      context.moveTo(sx, sy)
      const cx = (ex - sx) / 2 + sx
      const cy = (ey - sy) / 2 + sy
      const lcx = (cx - sx) / 2 + sx
      const lcy = (cy - sy) / 2 + sy
      const rcx = (ex - cx) / 2 + cx
      const rcy = (ey - cy) / 2 + cy

      this.currentPath.arrx.push(lcx, cx, rcx, ex)
      this.currentPath.arry.push(lcy, cy, rcy, ey)

      context.lineTo(lcx, lcy)
      context.lineTo(cx, cy)
      context.lineTo(rcx, rcy)
      context.lineTo(ex, ey)
      context.stroke()
      context.draw(true)
    },

    handleTouchEnd() {
      if (!isButtonDown) {
        return
      }

      isButtonDown = false
      
      if (this.currentPath && this.currentPath.arrx.length > 0) {
        this.paths.push({
          arrx: [...this.currentPath.arrx],
          arry: [...this.currentPath.arry],
          color: this.currentPath.color,
          lineWidth: this.currentPath.lineWidth
        })
        
        this.currentPath = { arrx: [], arry: [] }
        this.persistDraft()
        this.updateMetaState()
        
        this.triggerEvent('change', {
          sceneKey: this.data.sceneKey,
          hasContent: this.paths.length > 0,
          strokeCount: this.paths.length,
        })
      }
    },

    handleTouchCancel() {
      isButtonDown = false
      this.handleTouchEnd()
    },

    beginStroke(touch) {
      console.log('[draft-sheet] beginStroke called, ctx:', !!this.ctx)
      if (!this.ctx) {
        console.log('[draft-sheet] No ctx, cannot draw')
        return
      }

      const point = this.getTouchPoint(touch)
      console.log('[draft-sheet] Got point:', point)
      if (!point) {
        console.log('[draft-sheet] No valid point')
        return
      }

      const strokeColor = this.data.themeMode === 'dark' ? DARK_STROKE_COLOR : LIGHT_STROKE_COLOR

      this.currentStroke = {
        color: strokeColor,
        lineWidth: DEFAULT_LINE_WIDTH,
        points: [point],
      }

      console.log('[draft-sheet] Drawing dot at:', point)
      this.drawDot(point, this.currentStroke, true)
      if (this.data.showPlaceholder) {
        this.setData({ showPlaceholder: false })
      }
    },

    finishStroke() {
      if (!this.currentStroke || !this.currentStroke.points.length) {
        return
      }

      this.paths.push({
        color: this.currentStroke.color,
        lineWidth: this.currentStroke.lineWidth,
        points: this.currentStroke.points.map((point) => ({ ...point })),
      })
      this.currentStroke = null
      this.redoStack = []

      this.persistDraft()
      this.updateMetaState()
      this.triggerEvent('change', {
        sceneKey: this.data.sceneKey,
        hasContent: this.paths.length > 0,
        strokeCount: this.paths.length,
      })
    },

    handleUndo() {
      if (!this.paths.length || !context) {
        return
      }

      this.paths.pop()
      
      context.clearRect(0, 0, 10000, 10000)
      this.paths.forEach(pathObj => {
        if (!pathObj.arrx || !pathObj.arrx.length) {
          return
        }

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
      
      context.draw()
      
      this.persistDraft()
      this.updateMetaState()
      this.triggerEvent('change', {
        sceneKey: this.data.sceneKey,
        hasContent: this.paths.length > 0,
        strokeCount: this.paths.length,
      })
    },

    handleRedo() {
      if (!this.redoStack.length) {
        return
      }

      const path = this.redoStack.pop()
      this.paths.push(path)
      this.redrawCanvas()
      this.persistDraft()
      this.updateMetaState()
      this.triggerEvent('change', {
        sceneKey: this.data.sceneKey,
        hasContent: this.paths.length > 0,
        strokeCount: this.paths.length,
      })
    },

    handleClear() {
      if (!this.paths.length) {
        return
      }

      wx.showModal({
        title: '清空草稿纸',
        content: '当前草稿会被清空，确定继续吗？',
        confirmText: '清空',
        cancelText: '保留',
        success: (res) => {
          if (!res.confirm) {
            return
          }

          this.paths = []
          this.redoStack = []
          this.currentStroke = null
          storage.clearDraftSheet(this.data.sceneKey)
          this.redrawCanvas()
          this.updateMetaState()
          this.triggerEvent('clear', {
            sceneKey: this.data.sceneKey,
          })
        },
      })
    },

    updateMetaState() {
      const hasContent = this.paths.length > 0
      this.setData({
        hasContent,
        canUndo: hasContent,
        canRedo: this.redoStack.length > 0,
        showPlaceholder: !hasContent,
        saveHintText: hasContent ? formatSavedHint(Date.now()) : DEFAULT_SAVE_HINT,
      })
    },

    persistDraft() {
      if (!this.data.sceneKey) {
        return
      }

      if (!this.paths.length) {
        storage.clearDraftSheet(this.data.sceneKey)
        return
      }

      const updatedAt = Date.now()
      storage.setDraftSheet(this.data.sceneKey, {
        paths: this.paths,
        updatedAt,
      })

      this.setData({
        saveHintText: formatSavedHint(updatedAt),
        hasContent: true,
        canUndo: true,
        showPlaceholder: false,
      })
    },

    redrawCanvas() {
      if (!context) {
        return
      }

      context.clearRect(0, 0, 10000, 10000)
      
      this.paths.forEach(pathObj => {
        if (!pathObj.arrx || !pathObj.arrx.length) {
          return
        }

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
      
      context.draw()
    },
  },
})
