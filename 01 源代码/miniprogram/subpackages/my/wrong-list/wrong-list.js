/**
 * my 分包 - 错题分类列表页
 * 展示特定分类下的错题列表，支持重新练习
 */
const tool = require('../../../toolbox/tool')
import storage from '../../../utils/storage'
import router from '../../../router/index'

const app = getApp();

Page({
  data: {
    // 导航栏高度映射数据
    statusBarHeight: 0,
    titleBarHeight: 0,
    navigationBarHeight: 0,
    capsule: {},

    categoryName: '',
    questions: [],
    loading: true
  },

  onLoad(options) {
    // 获取应用全局导航数据
    const { 
      statusBarHeight, 
      titleBarHeight, 
      navigationBarHeight, 
      capsule 
    } = app.globalData;

    const categoryName = options.category || '全部错题';
    this.setData({
      statusBarHeight,
      titleBarHeight,
      navigationBarHeight,
      capsule,
      categoryName
    });

    this.loadQuestions(categoryName)
  },

  /**
   * 加载当前分类下的错题
   * @param {string} categoryName 分类名称 
   */
  loadQuestions(categoryName) {
    this.setData({ loading: true });
    
    // 从缓存中获取动态错题记录
    let wrongQuestions = storage.getWrongQuestions() || []
    
    // 如果不是全局展示，则按分类过滤
    if (categoryName && categoryName !== '全部错题') {
      wrongQuestions = wrongQuestions.filter(q => q.category === categoryName)
    }
    
    this.setData({
      questions: wrongQuestions,
      loading: false
    })
  },

  /**
   * 返回上一页
   */
  handleBack() {
    router.back()
  },

  /**
   * 点击错题卡片，查看详情
   */
  handleQuestionTap(e) {
    const { id } = e.currentTarget.dataset

    if (!id) {
      tool.toast('题目数据异常')
      return
    }

    router.push('QUESTION_DETAIL', {
      source: 'wrong',
      questionId: id,
      title: '错题详情',
    })
  }
})
