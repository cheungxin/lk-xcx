import { getHotspotById, getHotspots } from '../../../mock/hotspot'

const TABS = ['推荐', '时政', '经济', '社会', '民生', '乡村', '文化', '教育', '治理', '生态', '就业']

Page({
  data: {
    navBarHeight: 88,
    tabs: TABS,
    activeTab: '推荐',
    hotspots: [],
    selectedHotspot: {
      title: '',
      tag: '',
      date: '',
      background: '',
      keyPoints: [],
      quotations: [],
      relatedTopics: [],
    },
    showDetail: false,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0

    this.setData({
      navBarHeight: statusBarHeight + 44,
    })
    this.loadHotspots('推荐')
  },

  loadHotspots(tab) {
    this.setData({
      activeTab: tab,
      hotspots: getHotspots(tab),
    })
  },

  handleTabTap(e) {
    const tab = e.currentTarget.dataset.tab

    if (!tab || tab === this.data.activeTab) {
      return
    }

    this.loadHotspots(tab)
  },

  handleOpenDetail(e) {
    const id = e.currentTarget.dataset.id
    const selectedHotspot = getHotspotById(id)

    if (!selectedHotspot) {
      return
    }

    this.setData({
      selectedHotspot,
      showDetail: true,
    })
  },

  handleCloseDetail() {
    this.setData({
      showDetail: false,
    })
  },

  handlePopupChange(e) {
    this.setData({
      showDetail: e.detail.visible,
    })
  },
})
