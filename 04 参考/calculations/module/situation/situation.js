const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        answer_lists: {
            type: Array,
            value: []
        },
        show_situation: {
            type: Boolean,
            value: false
        },
        exam_name: {
            type: String,
            value: '答题卡'
        },
        client_height:{
            type: Number,
            value: 0
        }
    }, 
    options: {
        addGlobalClass: true,
      },
    /**
     * 组件的初始数据
     */
    data: {

    },
    /**
     * 组件的生命周期
     */
    lifetimes: {
        ready: function() { 
            
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
      // 调用父组件传递的更新数据的函数
    clickQusetionSerial(e) { 
        const now_question_index = e.currentTarget.dataset.now_question_index
        this.triggerEvent('getQuestion', now_question_index)
      },
    //点击空白处 或者取消键退出答题卡
    quitSheetLists(e){
        let $this = this  
        $this.setData({ show_situation:!$this.data.show_situation })
    },
    onSubmit(){ 
        this.triggerEvent('onSubmit')
    }, 
    }
})
