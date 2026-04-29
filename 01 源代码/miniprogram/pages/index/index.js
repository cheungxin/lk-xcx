import storage from '../../utils/storage'
import router from '../../router/index'
import {
  getHomeConfig,
  getExamTypeByName,
  getShenlunQuickEntries,
} from '../../mock/home'
import { getPracticeCategories } from '../../mock/questions'
import { getExamModePapers } from '../../mock/papers'

const tool = require('../../toolbox/tool')
const app = getApp()
const {
  statusBarHeight = 0,
  titleBarHeight = 0,
  navigationBarHeight = 0,
  clientHeight = 0,
} = app.globalData || {}

const QUESTION_DURATION_MIN = 0
const QUESTION_DURATION_MAX = 120
const QUESTION_DURATION_STEP = 5
const QUESTION_DURATION_MARK_STEP = 20

const SHENLUN_EXAM_MODE_CARDS = [
  {
    id: 'special',
    name: '限时训练',
    bgColor: '#FFF3EB',
    textColor: '#B97A40',
  },
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const getQuickEntriesBySubject = (subjectId, homeConfig) =>
  subjectId === 'shenlun'
    ? getShenlunQuickEntries()
    : clone(homeConfig.quickEntryList)

const getExamModeCardsBySubject = (subjectId, homeConfig) =>
  subjectId === 'shenlun'
    ? clone(SHENLUN_EXAM_MODE_CARDS)
    : clone(homeConfig.examModeCards)

const getPracticeSettingsBySubject = (subjectId, homeConfig) => {
  const practiceSettings = clone(homeConfig.practiceSettings)

  if (subjectId === 'shenlun') {
    return {
      ...practiceSettings,
      questionCount: Math.min(practiceSettings.questionCount, 3),
      min: 1,
      max: 5,
    }
  }

  return practiceSettings
}

const QUESTION_COUNT_STEP = 5

const DEFAULT_EXAM_CATEGORY_IDS = {
  xingce: {
    special: ['politics'],
    hybrid: ['politics', 'common'],
  },
  shenlun: {
    special: ['summary'],
    hybrid: ['summary'],
  },
}

const getSubjectDisplayTexts = (subjectId) => {
  const isShenlun = subjectId === 'shenlun'

  return {
    currentSubjectLabel: isShenlun ? '申论' : '行测',
    examModeTabLabel: isShenlun ? '限时训练' : '考场模式',
    examActionLabel: isShenlun ? '开始训练' : '开始考试',
    examNoticeLabel: isShenlun ? '限时训练须知' : '考场模式须知',
  }
}

const getUniqueIds = (list = []) => Array.from(new Set((list || []).filter(Boolean)))

const buildDurationMarks = (
  min = QUESTION_DURATION_MIN,
  max = QUESTION_DURATION_MAX,
  markStep = QUESTION_DURATION_MARK_STEP,
) => {
  const marks = {}

  for (let value = min; value <= max; value += markStep) {
    marks[value] = value === 0 ? '不限时' : `${value}`
  }

  return marks
}

const normalizeDurationValue = (
  value,
  min = QUESTION_DURATION_MIN,
  max = QUESTION_DURATION_MAX,
  step = QUESTION_DURATION_STEP,
) => {
  const safeValue = Number(value)
  const normalizedValue = Number.isNaN(safeValue) ? min : safeValue
  const clamped = Math.max(min, Math.min(max, normalizedValue))

  if (clamped === min) {
    return min
  }

  return Math.round(clamped / step) * step
}

const formatQuestionDuration = (duration = 0) => (
  Number(duration) > 0 ? `${Number(duration)}分钟` : '不限时'
)

const formatQuestionDurationHint = (duration = 0) => (
  Number(duration) > 0
    ? '拖动滑块可精细调整做题时间'
    : '当前为不限时，可拖动滑块恢复限时'
)

const walkCategoryNodes = (nodes = [], result = []) => {
  ;(nodes || []).forEach((node) => {
    result.push({
      id: node.id,
      name: node.examPoint || node.name || '未命名考点',
    })

    if (Array.isArray(node.children) && node.children.length) {
      walkCategoryNodes(node.children, result)
    }
  })

  return result
}

const getExamCategoryNameMap = (subjectId = 'xingce') =>
  walkCategoryNodes(getPracticeCategories(subjectId)).reduce((result, item) => {
    result[item.id] = item.name
    return result
  }, {})

const getDefaultExamCategoryIds = (subjectId = 'xingce', examMode = 'special') => {
  const subjectDefaults =
    DEFAULT_EXAM_CATEGORY_IDS[subjectId] || DEFAULT_EXAM_CATEGORY_IDS.xingce

  return getUniqueIds(subjectDefaults[examMode] || subjectDefaults.special || [])
}

const getResolvedExamCategoryIds = (
  subjectId = 'xingce',
  examMode = 'special',
  selectedCategoryIds = [],
) => {
  const normalizedIds = getUniqueIds(selectedCategoryIds)
  return normalizedIds.length
    ? normalizedIds
    : getDefaultExamCategoryIds(subjectId, examMode)
}

const normalizeStepCount = (
  value,
  min = QUESTION_COUNT_STEP,
  max = 50,
  step = QUESTION_COUNT_STEP,
) => {
  const safeValue = Number(value) || min
  const clamped = Math.max(min, Math.min(max, safeValue))
  return Math.round(clamped / step) * step
}

const sumCategoryConfigs = (configs = []) =>
  configs.reduce((total, item) => total + Number(item.count || 0), 0)

const buildAutoDistributedConfigs = (
  categoryIds = [],
  totalCount = 20,
) => {
  const ids = getUniqueIds(categoryIds)

  if (!ids.length) {
    return []
  }

  const safeTotal = Math.max(Number(totalCount) || 0, 0)
  const averageCount = Math.floor(safeTotal / ids.length)
  const remainder = safeTotal % ids.length

  return ids
    .map((id, index) => ({
      id,
      count: averageCount + (index < remainder ? 1 : 0),
    }))
    .filter((item) => item.count > 0)
}

const buildDistributedConfigs = (
  categoryIds = [],
  totalCount = 20,
  min = QUESTION_COUNT_STEP,
  max = 50,
  step = QUESTION_COUNT_STEP,
) => {
  const ids = getUniqueIds(categoryIds)

  if (!ids.length) {
    return []
  }

  const minimumTotal = ids.length * min
  const safeTotal = Math.max(Number(totalCount) || 0, minimumTotal)
  const baseCount = Math.max(min, Math.floor(safeTotal / ids.length / step) * step)
  let remainder = safeTotal - baseCount * ids.length

  return ids.map((id) => {
    let count = baseCount

    if (remainder > 0) {
      const bonus = Math.min(step, remainder)
      count += bonus
      remainder -= bonus
    }

    return {
      id,
      count: Math.max(min, Math.min(max, count)),
    }
  })
}

const buildNamedCategoryConfigs = (
  subjectId = 'xingce',
  configs = [],
) => {
  const categoryNameMap = getExamCategoryNameMap(subjectId)

  return configs.map((item) => ({
    ...item,
    name: categoryNameMap[item.id] || item.id,
  }))
}

const buildManualCategoryConfigs = ({
  subjectId = 'xingce',
  categoryIds = [],
  totalCount = 20,
  existingConfigs = [],
  min = QUESTION_COUNT_STEP,
  max = 50,
  step = QUESTION_COUNT_STEP,
}) => {
  const ids = getUniqueIds(categoryIds)

  if (!ids.length) {
    return []
  }

  const normalizedExisting = Array.isArray(existingConfigs) ? existingConfigs : []
  const existingIds = getUniqueIds(normalizedExisting.map((item) => item.id))
  const hasSameSet =
    ids.length === existingIds.length && ids.every((id) => existingIds.includes(id))

  const baseConfigs = hasSameSet
    ? ids.map((id) => {
        const matched = normalizedExisting.find((item) => item.id === id) || {}
        return {
          id,
          count: normalizeStepCount(matched.count, min, max, step),
        }
      })
    : buildDistributedConfigs(ids, totalCount, min, max, step)

  return buildNamedCategoryConfigs(subjectId, baseConfigs)
}

const buildExamQuestionSettingState = ({
  subjectId = 'xingce',
  examMode = 'special',
  selectedCategoryIds = [],
  questionSettings = {},
}) => {
  const baseSettings = {
    duration: 10,
    durationMin: QUESTION_DURATION_MIN,
    durationMax: QUESTION_DURATION_MAX,
    durationStep: QUESTION_DURATION_STEP,
    durationMarks: buildDurationMarks(),
    totalCount: 20,
    countOptions: [10, 20, 30, 40, 50],
    mode: 'auto',
    manualConfigs: [],
    min: QUESTION_COUNT_STEP,
    max: 50,
    step: QUESTION_COUNT_STEP,
  }

  const mergedSettings = {
    ...baseSettings,
    ...clone(questionSettings || {}),
  }

  mergedSettings.durationMin = baseSettings.durationMin
  mergedSettings.durationMax = baseSettings.durationMax
  mergedSettings.durationStep = baseSettings.durationStep
  mergedSettings.durationMarks = baseSettings.durationMarks
  mergedSettings.countOptions = baseSettings.countOptions
  mergedSettings.min = baseSettings.min
  mergedSettings.max = baseSettings.max
  mergedSettings.step = baseSettings.step
  mergedSettings.duration = normalizeDurationValue(
    mergedSettings.duration,
    mergedSettings.durationMin,
    mergedSettings.durationMax,
    mergedSettings.durationStep,
  )
  mergedSettings.totalCount = Math.max(
    baseSettings.min,
    Number(mergedSettings.totalCount) || baseSettings.totalCount,
  )

  if (examMode === 'full') {
    return {
      questionSettings: {
        ...mergedSettings,
        durationText: formatQuestionDuration(mergedSettings.duration),
        durationHint: formatQuestionDurationHint(mergedSettings.duration),
        mode: 'auto',
        previewConfigs: [],
        manualConfigs: [],
        manualTotalCount: 0,
      },
      resolvedExamCategoryIds: [],
      canUseManualQuestionMode: false,
      examAutoSummary: '',
      examSelectedCategorySummary: '',
    }
  }

  const normalizedSelectedIds = getUniqueIds(selectedCategoryIds)
  const resolvedExamCategoryIds = getResolvedExamCategoryIds(
    subjectId,
    examMode,
    normalizedSelectedIds,
  )
  const canUseManualQuestionMode = normalizedSelectedIds.length > 0
  const previewConfigs = buildNamedCategoryConfigs(
    subjectId,
    buildAutoDistributedConfigs(resolvedExamCategoryIds, mergedSettings.totalCount),
  )
  const autoTotalCount = sumCategoryConfigs(previewConfigs)
  const manualConfigs = canUseManualQuestionMode
    ? buildManualCategoryConfigs({
        subjectId,
        categoryIds: normalizedSelectedIds,
        totalCount: mergedSettings.totalCount,
        existingConfigs: mergedSettings.manualConfigs,
        min: mergedSettings.min,
        max: mergedSettings.max,
        step: mergedSettings.step,
      })
    : []
  const manualTotalCount = sumCategoryConfigs(manualConfigs)
  const categoryNameMap = getExamCategoryNameMap(subjectId)
  const selectedNames = normalizedSelectedIds.map((id) => categoryNameMap[id] || id)
  const resolvedNames = resolvedExamCategoryIds.map((id) => categoryNameMap[id] || id)

  return {
    questionSettings: {
      ...mergedSettings,
      durationText: formatQuestionDuration(mergedSettings.duration),
      durationHint: formatQuestionDurationHint(mergedSettings.duration),
      mode:
        canUseManualQuestionMode && mergedSettings.mode === 'manual'
          ? 'manual'
          : 'auto',
      previewConfigs,
      autoTotalCount,
      manualConfigs,
      manualTotalCount,
    },
    resolvedExamCategoryIds,
    canUseManualQuestionMode,
    examAutoSummary: normalizedSelectedIds.length
      ? `已选${selectedNames.length}个考点，系统会自动分配，共${autoTotalCount || mergedSettings.totalCount}题`
      : `不选考点也能直接开始，系统会从${resolvedNames.join('、')}中智能配题`,
    examSelectedCategorySummary: selectedNames.length
      ? `已选${selectedNames.length}个考点：${selectedNames.join('、')}`
      : '当前使用系统默认配题',
  }
}

const INITIAL_EXAM_QUESTION_STATE = buildExamQuestionSettingState({
  subjectId: 'xingce',
  examMode: 'special',
  selectedCategoryIds: [],
  questionSettings: {},
})

Page({
  data: {
    statusBarHeight,
    titleBarHeight,
    navigationBarHeight,
    selectedExamType: '公务员',
    selectedRegion: '全国',
    examTypes: [],
    currentRegions: [],
    subjectTabs: [],
    visibleSubjectTabs: [],
    displaySubjectList: [],
    selectedSubjectId: 'xingce',
    bannerList: [],
    swiperList: [],
    swiperAssets: [],
    bannerCurrent: 0,
    currentBanner: {},
    quickEntryList: [],
    practiceCategories: [],
    examCategoryList: [],
    examModeCards: [],
    selectedExamModeId: 'special',
    fullExamPapers: [],
    selectedCategoryIds: [],
    selectedPaperId: '',
    examReady: false,
    contentMode: 'practice',
    practiceSettings: {},
    questionSettings: clone(INITIAL_EXAM_QUESTION_STATE.questionSettings),
    tabDisplayConfig: {
      enabledSubjectIds: [],
    },
    selectedFocusNode: null,
    showExamTypePopup: false,
    showRegionPopup: false,
    showDisplayPopup: false,
    showPracticeSettings: false,
    showQuestionSettings: false,
    showExamNotice: false,
    dontShowNoticeAgain: false,
    isShenlunMode: false,
    showExamCategorySelector: false,
    resolvedExamCategoryIds: clone(INITIAL_EXAM_QUESTION_STATE.resolvedExamCategoryIds),
    canUseManualQuestionMode: INITIAL_EXAM_QUESTION_STATE.canUseManualQuestionMode,
    examAutoSummary: INITIAL_EXAM_QUESTION_STATE.examAutoSummary,
    examSelectedCategorySummary: INITIAL_EXAM_QUESTION_STATE.examSelectedCategorySummary,
    currentSubjectLabel: '行测',
    examModeTabLabel: '考场模式',
    examActionLabel: '开始考试',
    examNoticeLabel: '考场模式须知',
  },

  onLoad() {
    this.loadHomeData()
    this.setData({
      dontShowNoticeAgain: storage.getDontShowExamNotice(),
    })
  },

  buildDisplaySubjects(subjectTabs, enabledIds = []) {
    return subjectTabs.map((item) => ({
      ...item,
      enabled: enabledIds.includes(item.id),
    }))
  },

  buildPracticeEntryNavigatorProps(subjectId, node, practiceSettings = {}) {
    const commonParams = {
      practiceType: 'practice',
      count: practiceSettings.questionCount || 5,
      difficulty: practiceSettings.difficulty || 'all',
    }

    if (subjectId === 'shenlun') {
      return {
        url: router.buildUrl('SHENLUN', {
          ...commonParams,
          type: node.id,
        }),
      }
    }

    return {
      url: router.buildUrl('PRACTICE', {
        ...commonParams,
        subject: subjectId,
        focus: node.id,
        year: practiceSettings.year || 'all',
      }),
    }
  },

  buildPracticeCategories(subjectId, practiceSettings) {
    const resolvedPracticeSettings = practiceSettings || this.data.practiceSettings || {}

    const processNode = (node, index) => {
      const hasChildren = !!(node.children && node.children.length)
      const processed = {
        ...node,
        examPoint: node.examPoint || node.name,
        answerDesc: node.answerDesc || `已答 ${node.answered || 0}/${node.total || 0}`,
        hasChildren,
        isLastPracticed: index === 2,
        entryNavigatorProps: this.buildPracticeEntryNavigatorProps(
          subjectId,
          node,
          resolvedPracticeSettings,
        ),
      }

      if (processed.children && processed.children.length > 0) {
        processed.children = processed.children.map((child) => processNode(child, -1))
      }

      return processed
    }

    return getPracticeCategories(subjectId).map((node, index) => processNode(node, index))
  },

  buildExamCategories(subjectId, selectedIds = []) {
    return getPracticeCategories(subjectId).map((item) => ({
      ...item,
      selected: selectedIds.includes(item.id),
    }))
  },

  buildFullExamPapers(selectedPaperId) {
    return getExamModePapers('full').map((item) => ({
      ...item,
      selected: item.id === selectedPaperId,
    }))
  },

  refreshExamReady() {
    const examReady = this.data.selectedExamModeId === 'full'
      ? !!this.data.selectedPaperId
      : true

    this.setData({ examReady })
  },

  loadHomeData() {
    const homeConfig = getHomeConfig()
    const storedExamType = storage.getExamType()
    const matchedExamType =
      homeConfig.examTypes.find((item) => item.name === storedExamType) ||
      getExamTypeByName(storedExamType)
    const storedRegion = storage.getExamRegion()
    const selectedRegion = matchedExamType.regions.includes(storedRegion)
      ? storedRegion
      : matchedExamType.regions[0]
    const visibleSubjectTabs = homeConfig.subjectTabs.filter((item) =>
      homeConfig.tabDisplayConfig.enabledSubjectIds.includes(item.id),
    )
    const finalVisibleSubjectTabs = visibleSubjectTabs.length
      ? visibleSubjectTabs
      : homeConfig.subjectTabs
    const selectedTab = finalVisibleSubjectTabs.find(
      (item) => item.id === this.data.selectedSubjectId,
    )
    const selectedSubjectId = selectedTab
      ? selectedTab.id
      : finalVisibleSubjectTabs[0].id
    const practiceSettings = getPracticeSettingsBySubject(selectedSubjectId, homeConfig)
    const subjectDisplayTexts = getSubjectDisplayTexts(selectedSubjectId)
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: selectedSubjectId,
      examMode: 'special',
      selectedCategoryIds: [],
      questionSettings: homeConfig.questionSettings,
    })

    this.setData({
      examTypes: homeConfig.examTypes,
      currentRegions: matchedExamType.regions,
      selectedExamType: matchedExamType.name,
      selectedRegion,
      subjectTabs: homeConfig.subjectTabs,
      visibleSubjectTabs: finalVisibleSubjectTabs,
      displaySubjectList: this.buildDisplaySubjects(
        homeConfig.subjectTabs,
        homeConfig.tabDisplayConfig.enabledSubjectIds,
      ),
      selectedSubjectId,
      bannerList: homeConfig.bannerList,
      swiperList: homeConfig.swiperList || [],
      swiperAssets: homeConfig.swiperAssets,
      bannerCurrent: 0,
      currentBanner: homeConfig.swiperList ? homeConfig.swiperList[0] || {} : {},
      quickEntryList: getQuickEntriesBySubject(selectedSubjectId, homeConfig),
      practiceCategories: this.buildPracticeCategories(selectedSubjectId, practiceSettings),
      examCategoryList: this.buildExamCategories(selectedSubjectId, []),
      examModeCards: getExamModeCardsBySubject(selectedSubjectId, homeConfig),
      fullExamPapers: selectedSubjectId === 'shenlun' ? [] : this.buildFullExamPapers(''),
      practiceSettings,
      questionSettings: homeConfig.questionSettings,
      tabDisplayConfig: homeConfig.tabDisplayConfig,
      isShenlunMode: selectedSubjectId === 'shenlun',
      showExamCategorySelector: false,
      ...subjectDisplayTexts,
      ...examQuestionState,
    })

    storage.setExamType(matchedExamType.name)
    storage.setExamRegion(selectedRegion)
    this.refreshExamReady()
  },

  onBannerChange(e) {
    const detail = e.detail || {}
    const current = typeof detail.current === 'number' ? detail.current : 0
    const swiperList = this.data.swiperList || []
    const currentBanner = swiperList[current] || swiperList[0] || {}

    this.setData({
      bannerCurrent: current,
      currentBanner,
    })
  },

  handleBannerTap(e) {
    const { index } = e.currentTarget.dataset
    const currentIndex = typeof index === 'number' ? index : this.data.bannerCurrent
    const swiperList = this.data.swiperList || []
    const bannerItem = swiperList[currentIndex]

    if (!bannerItem) {
      return
    }

    tool.toast(`${bannerItem.title || '该内容'}即将开放`)
  },

  onExamTypeTap() {
    this.setData({ showExamTypePopup: true })
  },

  onExamTypePopupChange(e) {
    this.setData({ showExamTypePopup: e.detail.visible })
  },

  closeExamTypePopup() {
    this.setData({ showExamTypePopup: false })
  },

  onSelectExamType(e) {
    const { id } = e.currentTarget.dataset
    const selectedType = this.data.examTypes.find((item) => item.id === id)

    if (!selectedType) {
      return
    }

    storage.setExamType(selectedType.name)
    storage.setExamRegion(selectedType.regions[0])
    this.setData({
      selectedExamType: selectedType.name,
      currentRegions: selectedType.regions,
      selectedRegion: selectedType.regions[0],
      showExamTypePopup: false,
    })
  },

  onRegionTap() {
    this.setData({ showRegionPopup: true })
  },

  onRegionPopupChange(e) {
    this.setData({ showRegionPopup: e.detail.visible })
  },

  closeRegionPopup() {
    this.setData({ showRegionPopup: false })
  },

  onSelectRegion(e) {
    const { region } = e.currentTarget.dataset

    storage.setExamRegion(region)
    this.setData({
      selectedRegion: region,
      showRegionPopup: false,
    })
  },

  onSubjectTabChange(e) {
    const { id } = e.currentTarget.dataset

    if (!id || id === this.data.selectedSubjectId) {
      return
    }

    const homeConfig = getHomeConfig()
    const practiceSettings = getPracticeSettingsBySubject(id, homeConfig)
    const subjectDisplayTexts = getSubjectDisplayTexts(id)
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: id,
      examMode: 'special',
      selectedCategoryIds: [],
      questionSettings: this.data.questionSettings,
    })

    this.setData({
      selectedSubjectId: id,
      quickEntryList: getQuickEntriesBySubject(id, homeConfig),
      practiceCategories: this.buildPracticeCategories(id, practiceSettings),
      examCategoryList: this.buildExamCategories(id, []),
      examModeCards: getExamModeCardsBySubject(id, homeConfig),
      selectedCategoryIds: [],
      selectedExamModeId: 'special',
      selectedPaperId: '',
      fullExamPapers: id === 'shenlun' ? [] : this.buildFullExamPapers(''),
      selectedFocusNode: null,
      showPracticeSettings: false,
      showExamCategorySelector: false,
      practiceSettings,
      isShenlunMode: id === 'shenlun',
      ...subjectDisplayTexts,
      ...examQuestionState,
    })
    this.refreshExamReady()
    wx.vibrateShort({ type: 'light' })
  },

  onSearchTap() {
    tool.toast('搜索功能即将开放')
  },

  onAiTap() {
    tool.toast('AI 问答入口即将开放')
  },

  onMiniProgramTap() {
    tool.toast('更多能力即将开放')
  },

  onQuickEntryTap(e) {
    const { action } = e.currentTarget.dataset
    const { selectedSubjectId } = this.data

    if (action === 'daily') {
      router.push(selectedSubjectId === 'shenlun' ? 'DAILY_SHENLUN' : 'DAILY')
      return
    }

    if (action === 'hotspot') {
      router.push('HOTSPOT')
      return
    }

    if (action === 'expression') {
      router.push('EXPRESSION')
      return
    }

    if (action === 'current-affairs') {
      tool.toast('时政模块即将开放')
      return
    }

    if (action === 'papers') {
      tool.toast(selectedSubjectId === 'shenlun' ? '申论历年真题入口即将开放' : '历年试卷即将开放')
      return
    }

    if (action === 'suite') {
      tool.toast('套题练习即将开放')
      return
    }

    if (action === 'mock') {
      const nextExamModeId = selectedSubjectId === 'shenlun' ? 'special' : 'full'
      const examQuestionState = buildExamQuestionSettingState({
        subjectId: selectedSubjectId,
        examMode: nextExamModeId,
        selectedCategoryIds: [],
        questionSettings: this.data.questionSettings,
      })

      this.setData({
        contentMode: 'exam',
        selectedExamModeId: nextExamModeId,
        selectedCategoryIds: [],
        selectedPaperId: '',
        showExamCategorySelector: false,
        fullExamPapers: selectedSubjectId === 'shenlun' ? [] : this.buildFullExamPapers(''),
        ...examQuestionState,
      })
      this.refreshExamReady()
    }
  },

  onPracticeModeTap() {
    if (this.data.contentMode === 'practice') {
      return
    }

    this.setData({ contentMode: 'practice' })
    wx.vibrateShort({ type: 'light' })
  },

  onExamModeSectionTap() {
    if (this.data.contentMode === 'exam') {
      return
    }

    this.setData({ contentMode: 'exam' })
    wx.vibrateShort({ type: 'light' })
  },

  onExamNoticePopupChange(e) {
    this.setData({ showExamNotice: e.detail.visible })
  },

  closeExamNotice() {
    this.setData({ showExamNotice: false })
  },

  confirmExamNotice() {
    this.setData({
      showExamNotice: false,
      contentMode: 'exam',
    })
    wx.vibrateShort({ type: 'light' })
  },

  toggleDontShowNoticeAgain() {
    const nextStatus = !this.data.dontShowNoticeAgain
    this.setData({ dontShowNoticeAgain: nextStatus })
    storage.setDontShowExamNotice(nextStatus)
  },

  onPracticeCategoryTap() {
    tool.toast('专项练习即将开放')
  },

  onTreeNodeTap(e) {
    const node = e?.detail?.node

    if (!node) {
      return
    }

    if (node.hasChildren || (Array.isArray(node.children) && node.children.length > 0)) {
      tool.toast('请选择具体知识点')
      return
    }

    // 专项练习入口：直接进入题库，读取自定义设置
    if (this.data.contentMode === 'practice') {
      const { selectedSubjectId, practiceSettings } = this.data
      const isShenlun = selectedSubjectId === 'shenlun'

      if (isShenlun) {
        router.push('SHENLUN', {
          practiceType: 'practice',
          type: node.id,
          count: practiceSettings.questionCount || 5,
          difficulty: practiceSettings.difficulty || 'all',
        })
      } else {
        router.push('PRACTICE', {
          practiceType: 'practice',
          subject: selectedSubjectId,
          focus: node.id,
          count: practiceSettings.questionCount || 5,
          year: practiceSettings.year || 'all',
          difficulty: practiceSettings.difficulty || 'all',
        })
      }
      return
    }
  },

  openDisplayPopup() {
    this.setData({ showDisplayPopup: true })
  },

  onDisplayPopupChange(e) {
    this.setData({ showDisplayPopup: e.detail.visible })
  },

  closeDisplayPopup() {
    this.setData({ showDisplayPopup: false })
  },

  onDisplaySubjectToggle(e) {
    const { id } = e.currentTarget.dataset
    const baseEnabledIds = Array.isArray(this.data.tabDisplayConfig.enabledSubjectIds)
      ? this.data.tabDisplayConfig.enabledSubjectIds
      : []
    const enabledIds = [...baseEnabledIds]
    const index = enabledIds.indexOf(id)

    if (index > -1) {
      if (enabledIds.length === 1) {
        tool.toast('至少保留一个显示项')
        return
      }

      enabledIds.splice(index, 1)
    } else {
      enabledIds.push(id)
    }

    const visibleSubjectTabs = this.data.subjectTabs.filter((item) => enabledIds.includes(item.id))
    const selectedSubjectId = enabledIds.includes(this.data.selectedSubjectId)
      ? this.data.selectedSubjectId
      : visibleSubjectTabs[0].id
    const homeConfig = getHomeConfig()
    const practiceSettings = getPracticeSettingsBySubject(selectedSubjectId, homeConfig)
    const subjectDisplayTexts = getSubjectDisplayTexts(selectedSubjectId)
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: selectedSubjectId,
      examMode: 'special',
      selectedCategoryIds: [],
      questionSettings: this.data.questionSettings,
    })

    this.setData({
      'tabDisplayConfig.enabledSubjectIds': enabledIds,
      visibleSubjectTabs,
      displaySubjectList: this.buildDisplaySubjects(this.data.subjectTabs, enabledIds),
      selectedSubjectId,
      quickEntryList: getQuickEntriesBySubject(selectedSubjectId, homeConfig),
      practiceCategories: this.buildPracticeCategories(selectedSubjectId, practiceSettings),
      examCategoryList: this.buildExamCategories(selectedSubjectId, []),
      examModeCards: getExamModeCardsBySubject(selectedSubjectId, homeConfig),
      selectedCategoryIds: [],
      selectedExamModeId: 'special',
      selectedPaperId: '',
      fullExamPapers: selectedSubjectId === 'shenlun' ? [] : this.buildFullExamPapers(''),
      practiceSettings,
      isShenlunMode: selectedSubjectId === 'shenlun',
      showExamCategorySelector: false,
      ...subjectDisplayTexts,
      ...examQuestionState,
    })
    this.refreshExamReady()
  },

  onPracticePopupChange(e) {
    this.setData({ showPracticeSettings: e.detail.visible })
  },

  closePracticePopup() {
    this.setData({ showPracticeSettings: false })
  },

  resetPracticeSettings() {
    const practiceSettings = getPracticeSettingsBySubject(this.data.selectedSubjectId, getHomeConfig())

    this.setData({
      practiceSettings,
      practiceCategories: this.buildPracticeCategories(this.data.selectedSubjectId, practiceSettings),
    })
  },

  onPracticeCountChange(e) {
    const practiceSettings = {
      ...this.data.practiceSettings,
      questionCount: e.detail.value,
    }

    this.setData({
      practiceSettings,
      practiceCategories: this.buildPracticeCategories(this.data.selectedSubjectId, practiceSettings),
    })
  },

  onPracticeYearSelect(e) {
    const practiceSettings = {
      ...this.data.practiceSettings,
      year: e.currentTarget.dataset.id,
    }

    this.setData({
      practiceSettings,
      practiceCategories: this.buildPracticeCategories(this.data.selectedSubjectId, practiceSettings),
    })
  },

  onPracticeDifficultySelect(e) {
    const practiceSettings = {
      ...this.data.practiceSettings,
      difficulty: e.currentTarget.dataset.id,
    }

    this.setData({
      practiceSettings,
      practiceCategories: this.buildPracticeCategories(this.data.selectedSubjectId, practiceSettings),
    })
  },

  handleConfirmExam() {
    const {
      selectedExamModeId,
      selectedCategoryIds,
      selectedPaperId,
      selectedSubjectId,
      questionSettings,
      resolvedExamCategoryIds,
    } = this.data

    this.setData({ showQuestionSettings: false })

    if (selectedSubjectId === 'shenlun') {
      router.push('SHENLUN', {
        practiceType: 'exam',
        type:
          (resolvedExamCategoryIds && resolvedExamCategoryIds[0]) ||
          (selectedCategoryIds && selectedCategoryIds[0]) ||
          'summary',
        count: 1,
      })
      return
    }

    const usingManualPlan =
      questionSettings.mode === 'manual' &&
      Array.isArray(questionSettings.manualConfigs) &&
      questionSettings.manualConfigs.length > 0
    const count = usingManualPlan
      ? questionSettings.manualTotalCount
      : questionSettings.autoTotalCount || questionSettings.totalCount
    const categoryPlan = usingManualPlan
      ? questionSettings.manualConfigs
          .map((item) => `${item.id}:${item.count}`)
          .join(',')
      : ''

    router.push('PRACTICE', {
      practiceType: 'exam',
      examMode: selectedExamModeId,
      subject: selectedSubjectId,
      categoryIds: resolvedExamCategoryIds.join(','),
      paperId: selectedPaperId,
      duration: questionSettings.duration,
      count: selectedExamModeId === 'full' ? 0 : count,
      categoryPlan,
    })
  },

  openQuestionSettings() {
    this.setData({
      showPracticeSettings: true,
    })
  },

  onQuestionPopupChange(e) {
    this.setData({ showQuestionSettings: e.detail.visible })
  },

  closeQuestionPopup() {
    this.setData({ showQuestionSettings: false })
  },

  toggleExamCategorySelector() {
    if (this.data.selectedExamModeId === 'full') {
      return
    }

    this.setData({
      showExamCategorySelector: !this.data.showExamCategorySelector,
    })
  },

  resetExamCategorySelection() {
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: this.data.selectedExamModeId,
      selectedCategoryIds: [],
      questionSettings: this.data.questionSettings,
    })

    this.setData({
      selectedCategoryIds: [],
      showExamCategorySelector: false,
      examCategoryList: this.buildExamCategories(this.data.selectedSubjectId, []),
      ...examQuestionState,
    })
    this.refreshExamReady()
  },

  onQuestionDurationSliderChange(e) {
    const duration = normalizeDurationValue(
      e.detail.value,
      this.data.questionSettings.durationMin,
      this.data.questionSettings.durationMax,
      this.data.questionSettings.durationStep,
    )
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: this.data.selectedExamModeId,
      selectedCategoryIds: this.data.selectedCategoryIds,
      questionSettings: {
        ...this.data.questionSettings,
        duration,
      },
    })

    this.setData(examQuestionState)
  },

  onQuestionModeChange(e) {
    const { mode } = e.currentTarget.dataset

    if (mode === 'manual' && !this.data.canUseManualQuestionMode) {
      return
    }

    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: this.data.selectedExamModeId,
      selectedCategoryIds: this.data.selectedCategoryIds,
      questionSettings: {
        ...this.data.questionSettings,
        mode,
      },
    })

    this.setData(examQuestionState)
  },

  onQuestionTotalCountSelect(e) {
    const totalCount = Number(e.currentTarget.dataset.value)
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: this.data.selectedExamModeId,
      selectedCategoryIds: this.data.selectedCategoryIds,
      questionSettings: {
        ...this.data.questionSettings,
        totalCount,
      },
    })

    this.setData(examQuestionState)
  },

  onQuestionManualCountAdjust(e) {
    const { id, action } = e.currentTarget.dataset
    const { questionSettings } = this.data
    const targetConfig = (questionSettings.manualConfigs || []).find(
      (item) => item.id === id,
    )

    if (!targetConfig) {
      return
    }

    const delta = action === 'plus' ? questionSettings.step : -questionSettings.step
    const nextCount = normalizeStepCount(
      Number(targetConfig.count || questionSettings.min) + delta,
      questionSettings.min,
      questionSettings.max,
      questionSettings.step,
    )
    const nextManualConfigs = (questionSettings.manualConfigs || []).map((item) =>
      item.id === id
        ? { ...item, count: nextCount }
        : item,
    )
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: this.data.selectedExamModeId,
      selectedCategoryIds: this.data.selectedCategoryIds,
      questionSettings: {
        ...questionSettings,
        mode: 'manual',
        manualConfigs: nextManualConfigs,
      },
    })

    this.setData(examQuestionState)
  },

  onExamModeCardTap(e) {
    const { id } = e.currentTarget.dataset
    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: id,
      selectedCategoryIds: [],
      questionSettings: this.data.questionSettings,
    })

    this.setData({
      selectedExamModeId: id,
      selectedCategoryIds: [],
      selectedPaperId: '',
      showExamCategorySelector: false,
      examCategoryList: this.buildExamCategories(this.data.selectedSubjectId, []),
      fullExamPapers: this.data.selectedSubjectId === 'shenlun' ? [] : this.buildFullExamPapers(''),
      ...examQuestionState,
    })
    this.refreshExamReady()
  },

  onTreeNodeSelect(e) {
    const { id } = e.detail
    let selectedCategoryIds = [...this.data.selectedCategoryIds]
    const exists = selectedCategoryIds.includes(id)

    if (this.data.selectedExamModeId === 'special') {
      selectedCategoryIds = exists ? [] : [id]
    } else {
      selectedCategoryIds = exists
        ? selectedCategoryIds.filter((item) => item !== id)
        : [...selectedCategoryIds, id]
    }

    const examQuestionState = buildExamQuestionSettingState({
      subjectId: this.data.selectedSubjectId,
      examMode: this.data.selectedExamModeId,
      selectedCategoryIds,
      questionSettings: this.data.questionSettings,
    })

    this.setData({
      selectedCategoryIds,
      examCategoryList: this.buildExamCategories(this.data.selectedSubjectId, selectedCategoryIds),
      ...examQuestionState,
    })
    this.refreshExamReady()
    wx.vibrateShort({ type: 'light' })
  },

  onFullExamPaperTap(e) {
    const { id } = e.currentTarget.dataset

    this.setData({
      selectedPaperId: id,
      fullExamPapers: this.buildFullExamPapers(id),
    })
    this.refreshExamReady()
  },

  handleExamNotice() {
    this.setData({ showExamNotice: true })
  },

  handleStartExam() {
    if (!this.data.examReady) {
      return
    }

    const { selectedSubjectId, selectedExamModeId, selectedPaperId } = this.data

    // 如果是全套考试，直接进入，不需要设置题目数量和做题时间
    if (selectedExamModeId === 'full' && selectedPaperId) {
      router.push('PRACTICE', {
        practiceType: 'exam',
        examMode: 'full',
        subject: selectedSubjectId,
        paperId: selectedPaperId,
      })
      return
    }

    if (selectedSubjectId === 'shenlun') {
      this.handleConfirmExam()
      return
    }

    const examQuestionState = buildExamQuestionSettingState({
      subjectId: selectedSubjectId,
      examMode: selectedExamModeId,
      selectedCategoryIds: this.data.selectedCategoryIds,
      questionSettings: this.data.questionSettings,
    })

    this.setData({
      showQuestionSettings: true,
      ...examQuestionState,
    })
  },

  onContinueTap() {
    tool.toast('继续练习即将开放')
  },
})
