 import router from "../../../router/index"
 import Api from "../../../interface/request"  
 import $ from '../../../toolbox/tool' 
 
 //获取小程序全局
 const app = getApp()
 //简道云表单ID
 const app_id = '632eba7e35faf20008ef9e45'
 const question_entry_id = '6406b53542490b00078a5b81'     //组题明细题目ID
 const questionbank_entry_id = '63f31de7a7d95b000873d000'   //题库ID

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
      page:{
        type:String,
        value:''
      },
      title:{
        type:String,
        value:''
      }
    },
    options: {
      addGlobalClass: true,
    },
    options: {
      styleIsolation: 'shared',
    },
    
    observers: {
      'treeNodes': function(params) {
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
      async goExam(e){
        let txt = e.currentTarget.dataset.title
       // 触发事件，向父组件发送数据  
       this.triggerEvent('treeData', txt); 
      },
      tapNode(e){
        const { detail } = e; // detail中包含了C组件传递的数据  
        // 触发事件，向父组件发送数据  
       this.triggerEvent('treeData', detail); 
      },
    }
  })
  