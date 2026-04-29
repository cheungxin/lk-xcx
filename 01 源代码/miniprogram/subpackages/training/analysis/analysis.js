import router from '../../../router/index'
import storage from '../../../utils/storage'
import {
  buildAnalysisViewState,
  decodeRouteParam,
} from '../../../utils/analysis-viewer'

const APP_SETTINGS_KEY = 'app_appearance_settings'

const THEME_TOKENS_MAP = {
  light: {
    iconPrimary: '#1664FF',
    iconSecondary: '#86909C',
    iconTertiary: '#4E5969',
    iconQuaternary: '#C9CDD4',
    markActive: '#FF6B00',
    collectActive: '#FFB020',
    navbarStyle: '--td-navbar-background: #FFFFFF; --td-navbar-color: #1D2129;',
  },
  dark: {
    iconPrimary: '#5A9CFF',
    iconSecondary: '#93A1B5',
    iconTertiary: '#6D7C92',
    iconQuaternary: '#4B5563',
    markActive: '#FFB357',
    collectActive: '#FFD76A',
    navbarStyle: '--td-navbar-background: #111827; --td-navbar-color: #F3F7FF;',
  },
}

const FONT_SIZE_LABEL_MAP = {
  small: '小',
  standard: '标准',
  medium: '中',
  large: '大',
  extraLarge: '特大',
}

const getResultSource = (practiceType = 'practice', resultSource = '') =>
  resultSource || (practiceType === 'exam' ? 'exam' : 'practice')

Page({
  data: {
    navBarHeight: 88,
    pageTitle: '题目解析',
    practiceType: 'practice',
    resultSource: 'practice',
    historyId: '',
    analysisFilterType: 'all',
    analysisSectionName: '',
    analysisKnowledgePath: '',
    analysisScopeName: '',
    questions: [],
    sourceQuestions: [],
    sourceAnswerSheet: [],
    sourceTitle: '题目解析',
    summary: {
      total: 0,
      correct: 0,
      wrong: 0,
      unanswered: 0,
    },
    answerSheet: [],
    currentIndex: 1, 
    hasQuestions: false,
    isScopedEntry: false, // 是否是从特定筛选（如错题）进入
    emptyTitle: '暂无解析内容',
    emptyDesc: '完成一次练习后，就可以在这里查看题目解析。',
    showMaterial: false,
    currentMaterial: {},
    materialScrollTop: 0,
    materialPopupHeight: 420,
    showAnswerCard: false,
    showMorePopup: false,
    showFontSizeSelector: false,
    themeMode: 'light',
    fontSize: 'standard',
    fontSizeLabel: '标准',
    fontSizeScale: 1.0,
    themeTokens: THEME_TOKENS_MAP.light,
  },

  onLoad(options = {}) {
    this.routeOptions = options

    const windowInfo = wx.getWindowInfo()
    const statusBarHeight = windowInfo.statusBarHeight || 0
    const materialPopupHeight = Math.max(
      Math.round((windowInfo.windowHeight || 667) * 0.82),
      420,
    )

    this.setData({
      navBarHeight: statusBarHeight + 44,
      materialPopupHeight,
    })

    this.applyAppearanceSettings()
    this.loadAnalysis(options)
  },

  /**
   * 应用外观设置（主题和字体）
   */
  applyAppearanceSettings() {
    const settings = wx.getStorageSync(APP_SETTINGS_KEY) || {
      nightMode: false,
      fontSize: 'standard',
      fontSizeLabel: '标准',
      fontSizeScale: 1.0,
    }
    const themeMode = settings.nightMode ? 'dark' : 'light'
    
    this.setData({
      themeMode,
      themeTokens: THEME_TOKENS_MAP[themeMode],
      fontSize: settings.fontSize || 'standard',
      fontSizeLabel: settings.fontSizeLabel || FONT_SIZE_LABEL_MAP[settings.fontSize] || '标准',
      fontSizeScale: settings.fontSizeScale || 1.0,
    })
  },

  loadAnalysis(options = {}) {
    const practiceType = options.practiceType || 'practice'
    const resultSource = getResultSource(practiceType, options.resultSource || '')
    const historyId = decodeRouteParam(options.historyId || '')
    const filter = options.filter || 'all'
    const section = decodeRouteParam(options.section || '')
    const knowledgePath = decodeRouteParam(options.knowledgePath || '')
    const analysisTitle = decodeRouteParam(options.analysisTitle || '')

    // 如果是通过非 'all' 的 filter 进入，或者是带有 section/knowledgePath，认为是定向展示
    const isScopedEntry = filter !== 'all' || !!section || !!knowledgePath

    const historyResult = this.getHistoryResult(practiceType, resultSource, historyId)
    const currentPayload = this.getCurrentResultPayload(practiceType, resultSource)
    const allowCurrentFallback = !historyId || !!historyResult
    const resolvedResult = historyResult || (allowCurrentFallback ? currentPayload.sourceResult : null)
    const sourceQuestions =
      (historyResult && Array.isArray(historyResult.questions) && historyResult.questions.length
        ? historyResult.questions
        : allowCurrentFallback
          ? currentPayload.questions
          : []).map((q, idx) => ({ ...q, collected: storage.isQuestionFavorited(q.questionId || q.id) }))
    const sourceAnswerSheet =
      (historyResult && Array.isArray(historyResult.answerSheet) && historyResult.answerSheet.length
        ? historyResult.answerSheet
        : allowCurrentFallback
          ? currentPayload.answerSheet
          : []).map(item => ({ ...item, marked: !!item.marked }))

    if (!Array.isArray(sourceQuestions) || !sourceQuestions.length) {
      this.setData({
        practiceType,
        resultSource,
        historyId,
        pageTitle: analysisTitle || '题目解析',
        hasQuestions: false,
        isScopedEntry,
        sourceQuestions: [],
        sourceAnswerSheet: [],
        sourceTitle: analysisTitle || '题目解析',
        questions: [],
        analysisFilterType: filter,
        analysisSectionName: section,
        analysisKnowledgePath: knowledgePath,
        summary: { total: 0, correct: 0, wrong: 0, unanswered: 0 },
        emptyTitle: historyId ? '该记录暂无详情数据' : '暂无解析内容',
        emptyDesc: historyId ? '记录缺失题目数据' : '完成练习后再查看解析。',
      })
      return
    }

    this.setData({
      practiceType,
      resultSource,
      historyId,
      isScopedEntry,
      sourceQuestions,
      sourceAnswerSheet,
      sourceTitle: analysisTitle || (resolvedResult && (resolvedResult.paperName || resolvedResult.paperTitle)) || currentPayload.cache.paperTitle || '题目解析',
      pageTitle: analysisTitle || '题目解析',
      analysisFilterType: filter,
      analysisSectionName: section,
      analysisKnowledgePath: knowledgePath,
    })

    this.updateAnalysisView({ filter, section, knowledgePath })
  },

  getHistoryResult(practiceType, resultSource, historyId) {
    if (!historyId) return null
    return getResultSource(practiceType, resultSource) === 'exam' ? storage.getExamResultById(historyId) : storage.getPracticeResultById(historyId)
  },

  getCurrentResultPayload(practiceType, resultSource) {
    const source = getResultSource(practiceType, resultSource)
    const cache = storage.getPracticeCache() || {}
    const sourceResult = source === 'exam' ? storage.getExamResult() || cache.examReport || null : storage.getPracticeResult() || null
    return { cache, sourceResult, questions: sourceResult?.questions || cache.questions || [], answerSheet: sourceResult?.answerSheet || cache.answerSheet || [] }
  },

  updateAnalysisView({ filter, section, knowledgePath } = {}) {
    const viewState = buildAnalysisViewState({
      questions: this.data.sourceQuestions,
      answerSheet: this.data.sourceAnswerSheet,
      filter,
      section,
      knowledgePath,
      title: this.data.sourceTitle || this.data.pageTitle,
    })

    if (!viewState.questions.length) {
      this.setData({
        analysisFilterType: filter,
        analysisSectionName: section,
        analysisKnowledgePath: knowledgePath,
        analysisScopeName: viewState.scopeName,
        pageTitle: viewState.pageTitle,
        questions: [],
        summary: viewState.summary,
        hasQuestions: false,
        emptyTitle: '当前筛选下暂无题目',
        emptyDesc: '切换筛选条件或返回查看全部解析。',
      })
      return
    }

    const answerSheet = viewState.answerSheet.map((item, index) => ({ ...item, index: index + 1 }))

    this.setData({
      analysisFilterType: filter,
      analysisSectionName: section,
      analysisKnowledgePath: knowledgePath,
      analysisScopeName: viewState.scopeName,
      pageTitle: viewState.pageTitle,
      questions: viewState.questions.map(q => ({ ...q, collected: storage.isQuestionFavorited(q.questionId || q.id) })),
      answerSheet,
      summary: viewState.summary,
      hasQuestions: true,
      currentIndex: 1,
    })
  },

  handleGoBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) { router.back(); return; }
    router.switchTab('INDEX')
  },

  handleFilterChange(e) {
    const filter = e.currentTarget.dataset.type || 'all'
    if (filter === this.data.analysisFilterType) return
    this.updateAnalysisView({ filter, section: this.data.analysisSectionName, knowledgePath: this.data.analysisKnowledgePath })
  },

  handleScopeReset() {
    if (!this.data.analysisSectionName && !this.data.analysisKnowledgePath) return
    this.updateAnalysisView({ filter: this.data.analysisFilterType, section: '', knowledgePath: '' })
  },

  handleShowMaterial(e) {
    const { index } = e.currentTarget.dataset
    const question = this.data.questions[index]
    if (!question || (!question.material && !question.materialImage)) return
    this.setData({ showMaterial: true, materialScrollTop: 0, currentMaterial: { title: question.materialTitle || '给定材料', text: question.material, image: question.materialImage } })
  },

  handleCloseMaterial() { this.setData({ showMaterial: false }) },
  handleMaterialChange(e) { this.setData({ showMaterial: e.detail.visible }) },
  handleSwiperChange(e) {
    const { current, source } = e.detail
    if (source === 'touch' || !source) { this.setData({ currentIndex: current + 1 }) }
  },
  handlePrev() { if (this.data.currentIndex <= 1) return; this.setData({ currentIndex: this.data.currentIndex - 1 }) },
  handleNext() { if (this.data.currentIndex >= this.data.questions.length) return; this.setData({ currentIndex: this.data.currentIndex + 1 }) },
  handleOpenAnswerCard() { this.setData({ showAnswerCard: true }) },
  handleCloseAnswerCard() { this.setData({ showAnswerCard: false }) },
  handleAnswerCardChange(e) { this.setData({ showAnswerCard: e.detail.visible }) },
  handleSelectQuestion(e) { const { index } = e.detail; this.setData({ currentIndex: index, showAnswerCard: false }) },

  /**
   * 更多操作
   */
  handleMore() {
    this.setData({ showMorePopup: true })
  },

  handlePopupChange(e) {
    this.setData({ showMorePopup: e.detail.visible })
  },

  handleTheme() {
    const isNight = this.data.themeMode === 'dark'
    const nextNightMode = !isNight
    const themeMode = nextNightMode ? 'dark' : 'light'

    const settings = wx.getStorageSync(APP_SETTINGS_KEY) || {}
    settings.nightMode = nextNightMode
    wx.setStorageSync(APP_SETTINGS_KEY, settings)

    this.setData({
      themeMode,
      themeTokens: THEME_TOKENS_MAP[themeMode],
      showMorePopup: false,
    })
  },

  handleFontSize() {
    this.setData({
      showMorePopup: false,
      showFontSizeSelector: true,
    })
  },

  handleFontSizeSelect(e) {
    const { fontSize, label, scale } = e.detail || {}
    if (!fontSize) return

    const settings = wx.getStorageSync(APP_SETTINGS_KEY) || {}
    settings.fontSize = fontSize
    settings.fontSizeLabel = label
    settings.fontSizeScale = scale
    wx.setStorageSync(APP_SETTINGS_KEY, settings)

    this.setData({
      fontSize,
      fontSizeLabel: label,
      fontSizeScale: scale,
    })
  },

  handleCloseFontSize() {
    this.setData({ showFontSizeSelector: false })
  },

  handleCollect() {
    const { questions, currentIndex, sourceQuestions } = this.data
    const currentQuestion = questions[currentIndex - 1]
    if (!currentQuestion) return

    const isCollected = !!currentQuestion.collected
    if (isCollected) {
      storage.removeFavorite(currentQuestion.questionId || currentQuestion.id)
    } else {
      storage.addFavorite(currentQuestion)
    }

    const newQuestions = questions.map((q, i) => i === currentIndex - 1 ? { ...q, collected: !isCollected } : q)
    const newSourceQuestions = sourceQuestions.map(q => (q.questionId || q.id) === (currentQuestion.questionId || currentQuestion.id) ? { ...q, collected: !isCollected } : q)

    this.setData({
      questions: newQuestions,
      sourceQuestions: newSourceQuestions,
      showMorePopup: false
    })

    wx.showToast({ title: isCollected ? '已取消收藏' : '已收藏', icon: 'none' })
  },

  handleMark() {
    const { answerSheet, currentIndex, sourceAnswerSheet } = this.data
    const currentItem = answerSheet[currentIndex - 1]
    if (!currentItem) return

    const isMarked = !!currentItem.marked
    const newAnswerSheet = answerSheet.map((item, i) => i === currentIndex - 1 ? { ...item, marked: !isMarked } : item)
    const newSourceAnswerSheet = sourceAnswerSheet.map((item, i) => i === currentIndex - 1 ? { ...item, marked: !isMarked } : item)

    this.setData({
      answerSheet: newAnswerSheet,
      sourceAnswerSheet: newSourceAnswerSheet,
      showMorePopup: false
    })

    wx.showToast({ title: isMarked ? '已取消标记' : '已标记', icon: 'none' })
  }
})
