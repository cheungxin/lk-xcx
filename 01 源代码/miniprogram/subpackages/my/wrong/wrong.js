// my 分包 - 错题本页
const tool = require('../../../toolbox/tool')
import storage from '../../../utils/storage'
import router from '../../../router/index'

const app = getApp();
const { statusBarHeight, titleBarHeight, navigationBarHeight, capsule } = app.globalData;

Page({
  data: {
    // 导航栏高度关联变量
    statusBarHeight,
    titleBarHeight,
    navigationBarHeight,
    capsule,

    activeTab: 'knowledge', // 当前标签页：knowledge 或 papers
    
    // 筛选器选项
    categoryOptions: [
      { label: '公务员-行测', value: 1 },
      { label: '公务员-申论', value: 2 },
      { label: '事业单位', value: 3 }
    ],
    statusOptions: [
      { label: '不限', value: 0 },
      { label: '未掌握', value: 1 },
      { label: '已掌握', value: 2 }
    ],
    sortOptions: [
      { label: '新添加在前', value: 1 },
      { label: '旧添加在前', value: 2 }
    ],
    
    // 当前筛选值
    categoryValue: 1,
    statusValue: 0,
    sortValue: 1,
    
    // 知识点分类列表
    knowledgeCategories: [
      {
        id: 1,
        name: '政治理论',
        count: 1,
        expanded: false
      },
      {
        id: 2,
        name: '常识判断',
        count: 1,
        expanded: false
      },
      {
        id: 3,
        name: '科技常识',
        count: 1,
        expanded: false
      }
    ],
    
    // 试卷列表
    paperList: []
  },

  onLoad(options) {
    this.loadWrongQuestions()
  },

  onShow() {
    this.loadWrongQuestions()
  },

  onPullDownRefresh() {
    this.loadWrongQuestions()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 加载错题数据
  loadWrongQuestions() {
    // 从缓存获取错题数据
    const wrongQuestions = storage.getWrongQuestions() || []
    
    // 按分类统计
    const categoryMap = {}
    wrongQuestions.forEach(item => {
      const category = item.category || '其他'
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          count: 0,
          expanded: false
        }
      }
      categoryMap[category].count++
    })

    // 转换为数组
    const categories = Object.keys(categoryMap).map((key, index) => ({
      id: index + 1,
      ...categoryMap[key]
    }))

    this.setData({
      knowledgeCategories: categories.length > 0 ? categories : []
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },

  // 更多操作
  onMoreTap() {
    wx.showActionSheet({
      itemList: ['清空错题', '导出错题', '批量管理'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.clearAllWrongQuestions()
        } else if (res.tapIndex === 1) {
          this.exportWrongQuestions()
        } else if (res.tapIndex === 2) {
          tool.toast('批量管理功能开发中')
        }
      }
    })
  },

  // 标签页切换
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.value
    })
  },

  // 筛选器变化
  onFilterChange(e) {
    const { value } = e.detail
    const { key } = e.currentTarget.dataset
    
    this.setData({
      [`${key}Value`]: value
    })
    
    // 重新加载数据
    this.loadWrongQuestions()
  },

  // 点击知识点分类
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    const category = this.data.knowledgeCategories.find(c => String(c.id) === String(id))
    if (category) {
      router.push('WRONG_LIST', { category: category.name })
    } else {
      console.warn('Category not found for id:', id)
    }
  },

  // 编辑分类
  onEditTap(e) {
    const { id } = e.currentTarget.dataset
    const category = this.data.knowledgeCategories.find(c => String(c.id) === String(id))
    
    if (!category) return

    wx.showActionSheet({
      itemList: ['查看详情', '移除错题'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.viewCategoryDetail(category)
        } else if (res.tapIndex === 1) {
          this.removeCategoryWrongQuestions(category)
        }
      }
    })
  },

  // 查看分类详情
  viewCategoryDetail(category) {
    if (!category) return
    router.push('WRONG_LIST', { category: category.name })
  },

  // 移除分类错题
  removeCategoryWrongQuestions(category) {
    wx.showModal({
      title: '确认移除',
      content: `确定要移除"${category.name}"分类下的所有错题吗？`,
      success: (res) => {
        if (res.confirm) {
          const categories = this.data.knowledgeCategories.filter(c => c.id !== category.id)
          this.setData({ knowledgeCategories: categories })
          tool.toast('移除成功')
        }
      }
    })
  },

  // 清空所有错题
  clearAllWrongQuestions() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有错题吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.clearWrongQuestions()
          this.setData({ knowledgeCategories: [] })
          tool.toast('已清空错题')
        }
      }
    })
  },

  // 导出错题
  exportWrongQuestions() {
    wx.showModal({
      title: '导出错题',
      content: '是否将错题导出为PDF文件？',
      success: (res) => {
        if (res.confirm) {
          tool.toast('导出功能开发中')
        }
      }
    })
  },

  // 下载按钮
  onDownloadTap() {
    this.exportWrongQuestions()
  }
})
