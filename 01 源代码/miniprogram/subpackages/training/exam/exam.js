import router from '../../../router/index'
import { getExamModePapers } from '../../../mock/papers'

const tool = require('../../../toolbox/tool')

Page({
  data: {
    navBarHeight: 88,
    papers: [],
  },

  onLoad(options) {
    const app = getApp()
    const { statusBarHeight } = app.globalData

    this.setData({
      navBarHeight: (statusBarHeight || 0) + 44,
      papers: getExamModePapers('full'),
    })
  },

  handleSelectPaper(e) {
    const { index } = e.currentTarget.dataset
    const paper = this.data.papers[index]

    if (!paper) {
      return
    }

    router
      .push('PRACTICE', {
        practiceType: 'exam',
        examMode: 'full',
        paperId: paper.id || paper.paperId,
        subject: 'xingce',
        duration: paper.totalDuration || paper.duration || '',
        count: paper.questionCount || paper.totalQuestions || '',
      })
      .catch(() => {
        tool.toast('试卷加载失败')
      })
  },

  handleGoHome() {
    const pages = getCurrentPages()

    if (pages.length > 1) {
      router.back()
      return
    }

    router.switchTab('INDEX')
  },
})
