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
                    "text": "我会了", // 默认显示“我会了”，收藏页面会覆盖此项
                    "icon": "icon-good-job-o"
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
        let {nowQuestionIndex, wrongLists, showSituation, isMore} = $this.data  
        const qusetionCount = wrongLists.length;
        switch (tabtxt) {
            case '上一题':
                nowQuestionIndex > 0 ? $this.setData({ nowQuestionIndex: nowQuestionIndex - 1 }) : $.toast('已经是第一题了');
                break;
            case '下一题':
                (nowQuestionIndex < qusetionCount - 1) ? $this.setData({ nowQuestionIndex: nowQuestionIndex + 1 }) : $.toast('没有题目了'); 
                break;
            case '我会了': // 错题本
                $this.removeWrongs();
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
                wrongLists,
                examId,
                wrongId,
                examName, 
                title,
                page
              } = data 
            $this.setData({ 
                wrongLists,
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
        const {nowQuestionIndex, wrongLists, originalIds} = $this.data 
        const currentQuestion = wrongLists[nowQuestionIndex];
        if(!currentQuestion || !currentQuestion.collectId){ return $.toast('数据丢失了或未收藏') }
        let resData = await request('post', '/questCollectKc/deleteQuestCollect', { collectId: currentQuestion.collectId } )  
        if(resData.data.code === 200){ 
            $.toast('您已成功移除该题')
            let newwrongLists = Array.from(wrongLists).filter((item, index) => index !== nowQuestionIndex);
            if(newwrongLists.length === 0){
               router.backTo()
            }else{
               let newNowQuestionIndex = nowQuestionIndex;
               //当题目为最后一题 需对当前序号进行判断处理
               if(nowQuestionIndex >= newwrongLists.length){
                newNowQuestionIndex = newwrongLists.length - 1;
               }
               $this.setData({ 
                   wrongLists: newwrongLists, 
                   nowQuestionIndex: newNowQuestionIndex
                }); 
            } 
        }else{ $.toast('移除失败') } 
    },
    async removeWrongs() {
        const $this = this
        const { nowQuestionIndex,wrongId,wrongLists, examId } = $this.data // dataId 和 originalIds 在新逻辑中不再直接使用
        const {detailId} = wrongLists[nowQuestionIndex];
        if (!detailId) { return $.toast('题目数据错误') } 
        const data = {
            wrongId,
            detailId
        }; 
        let resData = await request('post', '/questWrongKc/deleteWrongKcDetailById', data); 
        if (resData.data.code === 200) {
            $.toast('您已成功移除该题');
            let newwrongLists = Array.from(wrongLists).filter((item, index) => index !== nowQuestionIndex); 
            if (newwrongLists.length === 0) {
                // 如果移除后没有题目了，可以考虑返回上一页或跳转到错题列表
                router.backTo(); // 或者 router.redirectTo('wrongs');
            } else {
                let newNowQuestionIndex = nowQuestionIndex;
                if (nowQuestionIndex >= newwrongLists.length) {
                    newNowQuestionIndex = newwrongLists.length - 1;
                }
                $this.setData({
                    wrongLists: newwrongLists,
                    nowQuestionIndex: newNowQuestionIndex
                });
            }
        } else {
            $.toast(resData.data.msg || '移除失败');
        }
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
        const { wrongLists, examName, examId } = $this.data
        const { nowQuestionIndex } = $this.data
        const currentQuestion = wrongLists[nowQuestionIndex]
        
        if(currentQuestion.isCollected){ 
            let resData = await request('post', '/questCollectKc/deleteQuestCollect', { collectId: currentQuestion.collectId } )  
            if(resData.data.code===200){
                $.toast('取消收藏成功')
                let newWrongLists = [...wrongLists]
                newWrongLists[nowQuestionIndex].isCollected = false 
                newWrongLists[nowQuestionIndex].collectId = null
                $this.setData({ wrongLists: newWrongLists })
            }else{ 
                  $.toast('取消收藏失败'+resData.data.msg)
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
                let newWrongLists = [...wrongLists]
                newWrongLists[nowQuestionIndex].isCollected = true
                newWrongLists[nowQuestionIndex].collectId = resData.data.data.collectId
                $this.setData({ wrongLists: newWrongLists })
            }else{ 
                 $.toast('收藏失败：'+resData.data.msg)
            }
        } 
    },
    chooseOption(e) {
        const $this = this;
        const { nowQuestionIndex, wrongLists } = $this.data;
        const {
            questionNumber,
            questionOption,
            isCorrect,
            correctAnswer,
            questionChoiceType
        } = e.currentTarget.dataset;
        
        let newWrongLists = [...wrongLists];
        const current = newWrongLists[nowQuestionIndex];
        if (!current) return;
        
        // 多选题和不定项：点击仅切换选中状态，不立即判分
        if (questionChoiceType === 2 || questionChoiceType === 4) {
            const pending = current.pendingOptions || '';
            const parts = pending ? pending.split(',') : [];
            const set = new Set(parts.filter(Boolean));
            if (set.has(questionOption)) {
                set.delete(questionOption);
            } else {
                set.add(questionOption);
            }
            const sorted = Array.from(set).sort();
            current.pendingOptions = sorted.join(',');
            current.isAnswered = false; // 仅在确认后才显示解析
            newWrongLists[nowQuestionIndex] = { ...current };
        } else {
            // 单选/判断：立即记录并显示解析
            newWrongLists[nowQuestionIndex] = {
                ...current,
                isAnswered: true,
                userOption: questionOption,
                questionOptionUser: questionOption,
                isCorrect: isCorrect === 1 ? 1 : 0
            };
        }
        
        $this.setData({ wrongLists: newWrongLists });
    },
    confirmMultiChoice(e) {
        const $this = this;
        const { nowQuestionIndex, wrongLists } = $this.data;
        const { correctAnswer } = e.currentTarget.dataset;
        
        let newWrongLists = [...wrongLists];
        const current = newWrongLists[nowQuestionIndex];
        if (!current) return;
        
        const pending = current.pendingOptions || '';
        // 未选择，标记为未作答
        if (!pending) {
            newWrongLists[nowQuestionIndex] = {
                ...current,
                isAnswered: true,
                questionOptionUser: '',
                isCorrect: -1
            };
            $this.setData({ wrongLists: newWrongLists });
            return;
        }
        
        // 归一化为有序数组并比较
        const normalize = (str) => {
            if (!str) return [];
            return str
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .sort();
        };
        const userArr = normalize(pending);
        const correctArr = normalize(correctAnswer);
        const isEqual = userArr.length === correctArr.length && userArr.every((v, i) => v === correctArr[i]);
        
        newWrongLists[nowQuestionIndex] = {
            ...current,
            isAnswered: true,
            questionOptionUser: userArr.join(','),
            isCorrect: isEqual ? 1 : 0,
            pendingOptions: ''
        };
        
        $this.setData({ wrongLists: newWrongLists });
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