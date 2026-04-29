import request from '../../interface/request-v2'
import $ from '../../toolbox/tool'
import router from '../../router/index'
import time from '../../toolbox/time'
//获取小程序全局
const app = getApp() 
const{ navigationBarHeight,clientHeight,screenHeight } = app.globalData

Page({ 
    data: {
        showSituation:false, 
        navigationBarHeight,
        clientHeight, 
        screenHeight,
        nowQuestionIndex:0,
        textSize:2,
        title:'',
        isMore:false,
        tabBar: {
            list: [
                {
                    "text": "上一题",
                    "icon": "icon-arrow-left"
                },
                {
                    "text": "下一题",
                    "icon": "icon-arrow"
                },
                {
                    "text": "移除收藏", // 默认显示“移除收藏”，收藏页面会覆盖此项
                    "icon": "icon-failure"
                }, 
                {
                    "text": "更多",
                    "icon": "icon-apps-o"
                }
            ]
        },
        collapsed: true // 控制材料是否展开
    },
   
    //底部导航栏切换
    async switchTab(e){
        const $this = this 
        const tabtxt = e.currentTarget.dataset.text; 
        let {nowQuestionIndex, favoriteLists, showSituation, isMore} = $this.data  
        const qusetionCount = favoriteLists.length;
        switch (tabtxt) {
            case '上一题':
                nowQuestionIndex > 0 ? $this.setData({ nowQuestionIndex: nowQuestionIndex - 1 }) : $.toast('已经是第一题了');
                break;
            case '下一题':
                (nowQuestionIndex < qusetionCount - 1) ? $this.setData({ nowQuestionIndex: nowQuestionIndex + 1 }) : $.toast('没有题目了'); 
                break;
            case '移除收藏': // 错题本
                $this.removeFavorite();
                break; 
            case '答题卡': 
                 $this.setData({showSituation:!showSituation}) 
                break;
            case '更多':    
                 $this.setData({isMore:!isMore})    
                break;    
            }  
   },         
    async onLoad(options) {
        const $this = this 
            try {
            const eventChannel = $this.getOpenerEventChannel()
            eventChannel.on('userAnswer', async function(data) {
              const {
                favoriteLists,
                examId,
                wrongId,
                examName, 
                title,
                page
              } = data 
            $this.setData({ 
                favoriteLists,
                examId,
                wrongId,
                examName, 
                title,
                page
             })
            })
            } catch (error) {
                console.log(error)
            }  
    }, 
     //切换下一题
     switchNext(e) {  
        const $this = this
        if ($this.data.nowQuestionIndex !== e.detail.current) {
            $this.setData({
                nowQuestionIndex: e.detail.current
            })
        }
        // 获取swiper-item高度
        wx.createSelectorQuery().selectAll('.item-box').boundingClientRect(res => {
        const swiperHeight = Math.max(...res.map(item => item.height))
        this.setData({ swiperHeight })
      }).exec()
    },
    getQuestion(e){
        const $this = this
        let nowQuestionIndex = e.detail 
        $this.setData({ nowQuestionIndex, showSituation:false })
    }, 
    async removeFavorite(){
        const $this = this
        const {nowQuestionIndex, favoriteLists, originalIds} = $this.data 
        const currentQuestion = favoriteLists[nowQuestionIndex];
        if(!currentQuestion || !currentQuestion.collectId){ return $.toast('数据丢失了或未收藏') }
        let resData = await request('post', '/questCollectKc/deleteQuestCollect', { collectId: currentQuestion.collectId } )  
        if(resData.data.code === 200){ 
            $.toast('您已成功移除该题')
            let newfavoriteLists = Array.from(favoriteLists).filter((item, index) => index !== nowQuestionIndex);
            if(newfavoriteLists.length === 0){
               router.backTo()
            }else{
               let newNowQuestionIndex = nowQuestionIndex;
               //当题目为最后一题 需对当前序号进行判断处理
               if(nowQuestionIndex >= newfavoriteLists.length){
                newNowQuestionIndex = newfavoriteLists.length - 1;
               }
               $this.setData({ 
                   favoriteLists: newfavoriteLists, 
                   nowQuestionIndex: newNowQuestionIndex
                }); 
            } 
        }else{ $.toast('移除失败') } 
    }, 
    onReady: function () {
        this.setData({ windowHeight: app.globalData.windowHeight })
    },  
    onClickLeft() { 
        router.backTo()
    }, 
    previewImage(e) {
        console.log(e)
        const imageUrl = e.currentTarget.dataset.url
         wx.previewImage({
           urls: [imageUrl], // 图片地址列表
           current: imageUrl // 当前显示图片的链接
         })
     },  
    onClose(){
        this.setData({isMore:false})
    },
    onChangeText(e){
        this.setData({textSize:e.detail})
    },  
    toggleCollapse(event) {
        this.setData({
            collapsed: !this.data.collapsed
          });
    },
    async collect(e){
        const $this = this 
        const { favoriteLists, examName, examId } = $this.data
        const { nowQuestionIndex } = $this.data
        const currentQuestion = favoriteLists[nowQuestionIndex]
        
        if(currentQuestion.isCollected){ 
            let resData = await request('post', '/questCollectKc/deleteQuestCollect', { collectId: currentQuestion.collectId } )  
            if(resData.data.code===200){
                $.toast('取消收藏成功')
                let newFavoriteLists = [...favoriteLists]
                newFavoriteLists[nowQuestionIndex].isCollected = false 
                newFavoriteLists[nowQuestionIndex].collectId = null
                $this.setData({ favoriteLists: newFavoriteLists })
            }else{
                $.toast('取消收藏失败')
            }
        }else{
            const { questionNumber, questionId, examPoint, testpoint1st, testpoint2nd, testpoint3rd, testpoint4th, testpoint5th } = currentQuestion 
            const testpointMin = examPoint
            const collectTime = time.getCurrentTime()        
            const wxOpenid = wx.getStorageSync('userInfo')._openid
            const {className, userName, userPhone} = wx.getStorageSync('studentInfos')  
            let data = {
                className,
                collectTime,
                examId,
                examName,
                "examType": "公职类",
                "examTypeId": "gwy",
                questionId,
                questionNumber,
                testpoint1st,
                testpoint2nd,
                testpoint3rd,
                testpoint4th,
                testpoint5th,
                testpointMin,
                userName, userPhone,
                wxOpenid
            }
            let resData = await request('post', '/questCollectKc/addQuestCollect', data )   
            if(resData.data.code===200){
                $.toast('收藏成功')
                let newFavoriteLists = [...favoriteLists]
                newFavoriteLists[nowQuestionIndex].isCollected = true
                newFavoriteLists[nowQuestionIndex].collectId = resData.data.data.collectId
                $this.setData({ favoriteLists: newFavoriteLists })
            }else{
                $.toast('收藏失败')
            }
        } 
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {  }, 
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {  }, 
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {  }, 
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {   }, 
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {  }, 
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {   }
})