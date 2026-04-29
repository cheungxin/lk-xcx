/**
 * my 分包 - 收藏题目列表页
 * 展示特定分类下的收藏题目列表
 */
const tool = require('../../../toolbox/tool')
import storage from '../../../utils/storage'
import router from '../../../router/index'

const app = getApp();

Page({
  data: {
    // 导航栏高度关联变量
    statusBarHeight: 0,
    titleBarHeight: 0,
    navigationBarHeight: 0,
    capsule: {},

    categoryName: '',
    questions: [],
    loading: true
  },

  onLoad(options) {
    const { statusBarHeight, titleBarHeight, navigationBarHeight, capsule } = app.globalData;
    this.setData({
      statusBarHeight,
      titleBarHeight,
      navigationBarHeight,
      capsule,
      categoryName: options.category || '全部收藏'
    });

    this.loadQuestions(this.data.categoryName)
  },

  /**
   * 加载当前分类下的收藏题目
   * @param {string} categoryName 分类名称 
   */
  loadQuestions(categoryName) {
    this.setData({ loading: true });
    
    // 从缓存获取收藏数据
    let favorites = storage.getFavorites() || []
    
    // 如果不是全局展示，则按分类过滤
    if (categoryName && categoryName !== '全部收藏') {
      favorites = favorites.filter(q => q.category === categoryName)
    }
    
    this.setData({
      questions: favorites,
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
   * 点击题目卡片，查看详情
   */
  handleQuestionTap(e) {
    const { id } = e.currentTarget.dataset

    if (!id) {
      tool.toast('题目数据异常')
      return
    }

    // 跳转到题目详情页，这里假设详情页已经可以处理 source: 'favorite'
    router.push('QUESTION_DETAIL', {
      source: 'favorite',
      questionId: id,
      title: '题目详情',
    })
  }
})
