import { getExpressions } from '../../../mock/expression'

const tool = require('../../../toolbox/tool')

const TYPES = [
  { id: 'summary', name: '概括归纳' },
  { id: 'countermeasure', name: '提出对策' },
  { id: 'analysis', name: '综合分析' },
  { id: 'execution', name: '贯彻执行' },
  { id: 'essay', name: '申发论述' },
]

const filterExpressions = (list = [], keyword = '') => {
  const value = keyword.trim().toLowerCase()

  if (!value) {
    return list
  }

  return list.filter((item) => {
    const tagText = Array.isArray(item.tags) ? item.tags.join(' ') : ''
    return [item.title, item.content, item.example, tagText]
      .join(' ')
      .toLowerCase()
      .includes(value)
  })
}

const groupExpressions = (list = [], expandedIds = []) => {
  const groups = list.reduce((result, item) => {
    if (!result[item.category]) {
      result[item.category] = []
    }

    result[item.category].push({
      ...item,
      expanded: expandedIds.includes(item.id),
    })
    return result
  }, {})

  return Object.keys(groups).map((category) => ({
    category,
    items: groups[category],
  }))
}

Page({
  data: {
    navBarHeight: 88,
    activeType: 'summary',
    types: TYPES,
    searchKeyword: '',
    groupedExpressions: [],
    expandedIds: [],
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0

    this.setData({
      navBarHeight: statusBarHeight + 44,
    })
    this.refreshExpressions()
  },

  refreshExpressions() {
    const sourceList = getExpressions(this.data.activeType)
    const filteredList = filterExpressions(sourceList, this.data.searchKeyword)

    this.setData({
      groupedExpressions: groupExpressions(filteredList, this.data.expandedIds),
    })
  },

  handleTypeTap(e) {
    const type = e.currentTarget.dataset.type

    if (!type || type === this.data.activeType) {
      return
    }

    this.setData({
      activeType: type,
      expandedIds: [],
    })
    this.refreshExpressions()
  },

  handleSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value || '',
    })
    this.refreshExpressions()
  },

  handleToggleItem(e) {
    const id = e.currentTarget.dataset.id
    const expandedIds = [...this.data.expandedIds]
    const index = expandedIds.indexOf(id)

    if (index > -1) {
      expandedIds.splice(index, 1)
    } else {
      expandedIds.push(id)
    }

    this.setData({ expandedIds })
    this.refreshExpressions()
  },

  handleCopy(e) {
    const id = e.currentTarget.dataset.id
    const flatList = this.data.groupedExpressions.reduce((result, group) => {
      if (Array.isArray(group.items)) {
        return result.concat(group.items)
      }
      return result
    }, [])
    const target = flatList.find((item) => item.id === id)

    if (!target) {
      return
    }

    const text = [target.title, target.content, target.example].filter(Boolean).join('\n')

    wx.setClipboardData({
      data: text,
      success: () => {
        tool.toast('已复制到剪贴板')
      },
    })
  },
})
