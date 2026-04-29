const app = getApp();
const tool = require('../../../toolbox/tool')
import storage from '../../../utils/storage'
import router from '../../../router/index'

Page({
  data: {
    // 导航栏高度关联变量
    statusBarHeight: 0,
    titleBarHeight: 0,
    navigationBarHeight: 0,
    capsule: {},

    activeTab: 'questions', // 当前标签页：questions 或 papers
    
    // 试题分类列表
    categories: [
      {
        id: 1,
        name: '常识判断',
        count: 1,
        expanded: false
      },
      {
        id: 2,
        name: '科技常识',
        count: 1,
        expanded: false
      }
    ]
  },

  onLoad(options) {
    const { statusBarHeight, titleBarHeight, navigationBarHeight, capsule } = app.globalData;
    this.setData({
      statusBarHeight,
      titleBarHeight,
      navigationBarHeight,
      capsule
    });
    this.loadFavorites()
  },

  onShow() {
    this.loadFavorites()
  },

  // 加载收藏数据
  loadFavorites() {
    // 从缓存获取收藏数据
    const favorites = storage.getFavorites() || []
    
    // 按分类统计
    const categoryMap = {}
    favorites.forEach(item => {
      const category = item.category || '综合'
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
      categories: categories.length > 0 ? categories : []
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  },

  // 更多操作
  onMoreTap() {
    wx.showActionSheet({
      itemList: ['清空收藏', '批量管理'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.clearAllFavorites()
        } else if (res.tapIndex === 1) {
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

  // 点击分类
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    const category = this.data.categories.find(c => c.id === id)
    if (category) {
      router.push('FAVORITE_LIST', { category: category.name })
    }
  },

  // 编辑分类
  onEditTap(e) {
    const { id } = e.currentTarget.dataset
    const category = this.data.categories.find(c => c.id === id)
    
    wx.showActionSheet({
      itemList: ['重命名', '删除分类'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.renameCategory(category)
        } else if (res.tapIndex === 1) {
          this.deleteCategory(category)
        }
      }
    })
  },

  // 重命名分类
  renameCategory(category) {
    tool.toast('重命名功能开发中')
  },

  // 删除分类
  deleteCategory(category) {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${category.name}"分类吗？分类下的题目将被移除收藏。`,
      success: (res) => {
        if (res.confirm) {
          const categories = this.data.categories.filter(c => c.id !== category.id)
          this.setData({ categories })
          tool.toast('删除成功')
        }
      }
    })
  },

  // 清空所有收藏
  clearAllFavorites() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有收藏吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.setFavorites([])
          this.setData({ categories: [] })
          tool.toast('已清空收藏')
        }
      }
    })
  },

  // 导出试题
  onExportTap() {
    wx.showModal({
      title: '导出试题',
      content: '是否将收藏的试题导出为PDF文件？',
      success: (res) => {
        if (res.confirm) {
          tool.toast('导出功能开发中')
        }
      }
    })
  }
})
