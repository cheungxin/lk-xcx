const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        answerLists: {
            type: Array,
            value: []
        },
        showSituation: {
            type: Boolean,
            value: false
        },
        examName: {
            type: String,
            value: '答题卡'
        },
        clientHeight:{
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
    data: { },
    /**
     * 组件的生命周期
     */
    lifetimes: {
        ready: function() {   }
    },
    /**
     * 组件的方法列表
     */
    methods: {
      // 调用父组件传递的更新数据的函数
    clickQusetionSerial(e) { 
        const nowQuestionIndex = e.currentTarget.dataset.idx
        this.triggerEvent('getQuestion', nowQuestionIndex)
     },
    //点击空白处 或者取消键退出答题卡
    quitSheetLists(e){
        let $this = this  
        $this.setData({ showSituation:!$this.data.showSituation })
    },
    onSubmit(){ 
        this.triggerEvent('onSubmit')
     }, 
    }
})
