const normalizeAnswerIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[、,，/|\s]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (value === undefined || value === null || value === '') {
    return []
  }

  return [String(value)]
}

const hasAnswered = (item = {}) =>
  normalizeAnswerIds(item.selectedAnswers).length > 0 ||
  normalizeAnswerIds(item.userAnswer).length > 0

Component({
  properties: {
    answerSheet: {
      type: Array,
      value: [],
    },
    totalQuestions: {
      type: Number,
      value: 0,
    },
    currentIndex: {
      type: Number,
      value: 1,
    },
    paperTitle: {
      type: String,
      value: '',
    },
    themeMode: {
      type: String,
      value: 'light',
    },
    showSubmit: {
      type: Boolean,
      value: true,
    },
    submitLabel: {
      type: String,
      value: '交卷',
    },
    isAnalysis: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    activeTab: '',
    filteredAnswerSheet: [],
    sectionTitle: '全部题目',
    summary: {
      unanswered: 0,
      answered: 0,
      marked: 0,
      correct: 0,
      wrong: 0,
      total: 0,
    },
  },

  observers: {
    'answerSheet, activeTab, isAnalysis': function(answerSheet, activeTab, isAnalysis) {
      const list = Array.isArray(answerSheet) ? answerSheet : []
      const unanswered = list.filter((item) => !hasAnswered(item))
      const answered = list.filter((item) => hasAnswered(item))
      const marked = list.filter((item) => item.marked)
      const correct = list.filter((item) => item.status === 'correct')
      const wrong = list.filter((item) => item.status === 'wrong')

      let filtered = []
      let sectionTitle = isAnalysis ? '全部解析' : '未作答题目'

      if (isAnalysis) {
        // 解析模式下的分页逻辑
        const tab = activeTab || 'all'
        if (tab === 'all') {
          filtered = list
          sectionTitle = '全部解析'
        } else if (tab === 'wrong') {
          filtered = list.filter(item => item.status === 'wrong' || item.status === 'unanswered')
          sectionTitle = '错题/未答'
        } else if (tab === 'correct') {
          filtered = correct
          sectionTitle = '正确题目'
        } else {
          filtered = list
        }
      } else {
        // 练习模式下的分页逻辑
        const tab = activeTab || 'unanswered'
        if (tab === 'unanswered') {
          filtered = unanswered
          sectionTitle = '未作答题目'
        } else if (tab === 'answered') {
          filtered = answered
          sectionTitle = '已作答题目'
        } else if (tab === 'marked') {
          filtered = marked
          sectionTitle = '已标记题目'
        } else {
          filtered = unanswered
        }
      }

      this.setData({
        filteredAnswerSheet: filtered.map((item) => ({
          ...item,
          answered: isAnalysis ? true : hasAnswered(item), 
        })),
        sectionTitle,
        summary: {
          unanswered: unanswered.length,
          answered: answered.length,
          marked: marked.length,
          correct: correct.length,
          wrong: wrong.length,
          total: list.length,
        },
      })
    },
  },

  methods: {
    handleClose() {
      this.triggerEvent('close')
    },

    handleQuestionTap(e) {
      const { index } = e.currentTarget.dataset
      this.triggerEvent('select', { index })
    },

    handleTabChange(e) {
      const { tab } = e.currentTarget.dataset
      this.setData({ activeTab: tab })
    },

    handleSubmit() {
      this.triggerEvent('submit')
    },
  },
})
