/**
 * 估分Tab页 - 入口页面
 * 提供试卷选择和快捷入口，跳转到 training 分包的考试页面
 */

import { getExamModePapers } from '../../mock/papers'
import storage from '../../utils/storage'

const router = require('../../router/index')
const tool = require('../../toolbox/tool')

const DIFFICULTY_LABEL_MAP = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const resolvePaperTag = (paper = {}) => {
  const title = `${paper.title || paper.name || ''}${paper.subtitle || ''}`

  if (title.includes('国家') || title.includes('国考')) {
    return '国考'
  }

  if (title.includes('省考') || title.includes('联考')) {
    return '省考'
  }

  return '模考'
}

Page({
  data: {
    safeTop: 0,
    tabBarHeight: 124,
    // 历年试卷列表
    paperList: [],
    // 快速估分入口
    quickEntries: [
      { id: 'random', title: '随机估分', desc: '随机抽取题目进行估分', icon: 'shuffle', bgColor: '#EEF2FF', iconColor: '#4B74FF' },
      { id: 'recent', title: '近期估分', desc: '基于近期常考知识点', icon: 'time', bgColor: '#FFF7E6', iconColor: '#ED7B2F' },
      { id: 'weak', title: '薄弱专项', desc: '针对薄弱知识点估分', icon: 'chart-bar', bgColor: '#F0FFF4', iconColor: '#00A870' },
    ],
  },

  onLoad() {
    const app = getApp()
    const systemInfo = app.globalData.systemInfo || wx.getSystemInfoSync()
    const safeBottom = systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom || 0 : 0
    this.setData({
      safeTop: systemInfo.statusBarHeight || 0,
      tabBarHeight: 116 + safeBottom * 2,
    })
    this.loadPaperList()
  },

  loadPaperList() {
    const lastExamResult = storage.getExamResult()
    const paperList = getExamModePapers('full').map((paper) => {
      const isLastCompleted =
        !!lastExamResult &&
        (lastExamResult.paperName === paper.name || lastExamResult.paperName === paper.title)

      return {
        id: paper.id || paper.paperId,
        paperId: paper.paperId || paper.id,
        title: paper.title || paper.name,
        questions: paper.questionCount || paper.totalQuestions || 0,
        duration: paper.totalDuration || paper.duration || 0,
        difficulty: DIFFICULTY_LABEL_MAP[paper.difficulty] || paper.difficulty || '中等',
        tag: resolvePaperTag(paper),
        hasDone: isLastCompleted,
        score: isLastCompleted ? lastExamResult.score || 0 : 0,
      }
    })

    this.setData({ paperList })
  },

  // 选择试卷开始估分
  onPaperTap(e) {
    const { id } = e.currentTarget.dataset
    const paper = this.data.paperList.find((item) => item.id === id || item.paperId === id)

    if (!paper) {
      tool.toast('试卷数据加载失败')
      return
    }

    router.push('PRACTICE', {
      practiceType: 'exam',
      examMode: 'full',
      subject: 'xingce',
      paperId: paper.paperId || paper.id,
      duration: paper.duration || '',
      count: paper.questions || '',
    })
  },

  // 快速入口
  onQuickEntryTap() {
    router.push('EXAM')
  },

  // 查看历史估分
  onHistoryTap() {
    router.push('STATS', { type: 'exam' })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },
})
