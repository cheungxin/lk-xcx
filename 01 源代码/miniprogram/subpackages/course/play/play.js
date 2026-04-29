Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    courseId: 0,
    sectionId: 0,
    courseTitle: '',
    sectionTitle: '',
    showCatalog: false,
    playing: false,
    currentTime: 0,
    totalTime: 2700, // 45分钟（秒）
    progress: 0,
    sections: [],
    currentIndex: 0,
    hasNext: false,
    hasPrev: false
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    const courseId = parseInt(options.courseId) || 0
    const sectionId = parseInt(options.sectionId) || 101

    const mockSections = [
      { id: 101, title: '1.1 逻辑填空核心方法', duration: '45:00' },
      { id: 102, title: '1.2 片段阅读技巧精讲', duration: '38:00' },
      { id: 103, title: '1.3 语句排序与衔接', duration: '35:00' },
      { id: 104, title: '1.4 言语理解真题演练', duration: '42:00' },
      { id: 201, title: '2.1 数字推理规律总结', duration: '40:00' },
      { id: 202, title: '2.2 数学运算高频题型', duration: '48:00' }
    ]

    const currentIndex = mockSections.findIndex(s => s.id === sectionId)
    const idx = currentIndex >= 0 ? currentIndex : 0

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      navBarHeight: sysInfo.statusBarHeight + 44,
      courseId,
      sectionId: mockSections[idx].id,
      courseTitle: '2026国考行测系统精讲班',
      sectionTitle: mockSections[idx].title,
      sections: mockSections,
      currentIndex: idx,
      hasNext: idx < mockSections.length - 1,
      hasPrev: idx > 0
    })

    this.timer = null
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },

  onTogglePlay() {
    if (this.data.playing) {
      this.pause()
    } else {
      this.play()
    }
  },

  play() {
    this.setData({ playing: true })
    this.timer = setInterval(() => {
      let { currentTime, totalTime } = this.data
      currentTime += 1
      if (currentTime >= totalTime) {
        currentTime = totalTime
        this.pause()
      }
      const progress = Math.round((currentTime / totalTime) * 100)
      this.setData({ currentTime, progress })
    }, 1000)
  },

  pause() {
    this.setData({ playing: false })
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  },

  onSliderChange(e) {
    const { value } = e.detail
    const currentTime = Math.round((value / 100) * this.data.totalTime)
    this.setData({ currentTime, progress: value })
  },

  onPrevSection() {
    const { currentIndex, sections } = this.data
    if (currentIndex > 0) {
      this.switchSection(currentIndex - 1)
    }
  },

  onNextSection() {
    const { currentIndex, sections } = this.data
    if (currentIndex < sections.length - 1) {
      this.switchSection(currentIndex + 1)
    }
  },

  switchSection(index) {
    this.pause()
    const section = this.data.sections[index]
    this.setData({
      sectionId: section.id,
      sectionTitle: section.title,
      currentIndex: index,
      currentTime: 0,
      progress: 0,
      hasNext: index < this.data.sections.length - 1,
      hasPrev: index > 0
    })
  },

  showCatalog() {
    this.setData({ showCatalog: true })
  },

  hideCatalog() {
    this.setData({ showCatalog: false })
  },

  onCatalogItemTap(e) {
    const { index } = e.currentTarget.dataset
    this.switchSection(index)
    this.setData({ showCatalog: false })
  },

  goBack() {
    this.pause()
    wx.navigateBack()
  }
})
