import router from '../../../router/index'
import storage from '../../../utils/storage'

Page({
  data: {
    paperTitle: '答题卡',
    currentIndex: 1,
    answerSheet: [],
    hasMarked: false,
    navBarHeight: 88,
  },

  onLoad() {
    // 获取导航栏高度
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = statusBarHeight + 44
    
    this.setData({ navBarHeight })
    this.loadCache()
  },

  onShow() {
    this.loadCache()
  },

  handleGoBack() {
    router.back()
  },

  loadCache() {
    const cache = storage.getPracticeCache()
    if (!cache) {
      this.setData({
        paperTitle: '暂无练习记录',
        currentIndex: 1,
        answerSheet: [],
        hasMarked: false,
      })
      return
    }

    const hasMarked = cache.answerSheet.some(item => item.marked)

    this.setData({
      paperTitle: cache.paperTitle || '答题卡',
      currentIndex: cache.currentIndex || 1,
      answerSheet: cache.answerSheet || [],
      hasMarked,
    })
  },

  handleBackPractice() {
    router.back()
  },

  handleSelectQuestion(e) {
    const { index } = e.currentTarget.dataset
    const cache = storage.getPracticeCache()
    if (cache) {
      // 更新缓存中的当前题号
      cache.currentIndex = index
      
      // 更新答题卡状态
      cache.answerSheet = cache.answerSheet.map((item) => {
        if (item.index === index) {
          return { ...item, status: 'current' }
        }
        return item
      })
      
      // 获取该题的答题状态
      const targetQuestion = cache.answerSheet[index - 1]
      cache.selectedAnswer = targetQuestion.userAnswer || ''
      cache.submitted = !!targetQuestion.userAnswer
      cache.isCorrect = targetQuestion.status === 'correct' ? true : targetQuestion.status === 'wrong' ? false : null
      
      storage.setPracticeCache(cache)
      router.back()
    }
  },

  handleOpenAnalysis() {
    const cache = storage.getPracticeCache() || {}
    const practiceType = cache.practiceType || 'practice'
    const resultSource = practiceType === 'exam' ? 'exam' : 'practice'

    router.push('ANALYSIS', {
      practiceType,
      resultSource,
      analysisTitle: cache.paperTitle || '题目解析',
    })
  },
})
