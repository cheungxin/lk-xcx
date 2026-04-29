import router from "../../../router/index"
import Api from "../../../interface/request"
import $ from '../../../toolbox/tool'

//获取小程序全局
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    treeNodes: {
      type: Array,
      value: []
    },
    expandAll: {    //是否展开全部节点
      type: Boolean,
      value: false
    },
    page: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    }
  },
  options: {
    addGlobalClass: true,
  },
  options: {
    styleIsolation: 'shared',
  },

  observers: {
    'treeNodes': function (params) {
      params.forEach(item => {
        item.open = this.properties.expandAll // 是否展开
      })
      this.setData({
        tree: params
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    tree: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    isOpen(e) {
      const open = 'tree[' + e.currentTarget.dataset.index + '].open'  
      this.setData({
        [open]: !this.data.tree[e.currentTarget.dataset.index].open 
      })
    },
    //调用函数
    async goExamPoint(e) {
      const { item } = e.currentTarget.dataset;
      const { examLevel, examPoint } = item; 
      // 直接触发goAnalysis事件，向父组件发送数据  
      this.triggerEvent('goAnalysis', { examLevel, examPoint });
    },
    tapNode(e) {
     // console.log(e.detail)
      const { detail } = e; // detail中包含了C组件传递的数据   
      // 触发goAnalysis事件，向父组件发送数据  
      this.triggerEvent('goAnalysis', detail);
    },
  }
})
