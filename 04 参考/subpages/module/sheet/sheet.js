const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        sheetLists: {
            type: Array,
            value: [],
            observer: function(){ 
                let $this = this
                let sheetLists = $this.data.sheetLists 
                let remainingCounts = 0
                sheetLists.forEach(item => {  
                    if(item.userAnswerOption==''){ remainingCounts++ }
                });  
                $this.setData({remainingCounts,doneCounts:sheetLists.length- remainingCounts} )
              }
        },
        showSheet: {
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
        },
        isSubmitting:{
            type: Boolean,
            value: false
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
        const nowQuestionIndex = e.currentTarget.dataset.index
        this.triggerEvent('getQuestion', nowQuestionIndex)
      },
    //点击空白处 或者取消键退出答题卡
    quitSheetLists(e){
        let $this = this  
        $this.setData({ showSheet:!$this.data.showSheet })
    },
    onSubmit(){ 
        this.triggerEvent('onSubmit')
    }, 
    }
})
