/*页面引用*/
import Api from '../../interface/request'
import query from '../../interface/query'
import $ from '../../toolbox/tool'
import router from '../../router/index'
import time from '../../toolbox/time'
/*云开发*/
import Model from '../../model/index';
const model = new Model()


let timeStr = '00:00' // 显示在页面上的计时器格式字符串

/*页面全局变量*/
const app = getApp()
const {capsule, statusBarHeight, titleBarHeight, navigationBarHeight, screenHeight } = app.globalData;
const static_url = 'https://wqianc.com/dashujiaoyu/upload/xcx/index/'

//简道云表单ID
const app_id = '632eba7e35faf20008ef9e45'
const class_entry_id = '63fd76fe35718000085af0ad'    //班级任务ID
const history_entry_id = '640ec4643efbd100081ce498'  //历史答题记录ID 

Page({
    data: {
        capsule,
        statusBarHeight, titleBarHeight, navigationBarHeight, screenHeight,
        questionLists: [{ userAnswer: '' }, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 问题列表
        questionAllNum: 10,
        nowQuestionIndex: 0, // 当前问题编号 默认是swiper的index
        answerTime: '00:00', // 答题时间 
        statusBarHeight,
        collapsed: true,
        navigationBarHeight,
        textSize: 2,
        isDraft: true,
        nowUserAnswer: '', 
        examName: '数资速算',
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
                    "text": "提交",
                    "icon": "icon-submit"
                }
            ]
        },
    },  
    /**
  * 生命周期函数--监听页面加载
  */
    async onLoad(options) { 
        const $this = this 
        try {
            const eventChannel = $this.getOpenerEventChannel()
            eventChannel.on('calculate_analysis', async function (data) { 
                const { 
                    firstSerial,
                    firstSort,
                    secondSerial, 
                    secondSort,
                    questionLists } = data.examData 
                let newQuestionLists = questionLists.map((item) => { 
                    if(item.multipleAnswers){
                        item.correctAnswer = $this.arrayToString(item.correctAnswer)
                    }
                    return item
                })      
                $this.setData({
                    firstSortName: firstSerial+firstSort,
                    secondSortName:secondSerial+secondSort, 
                    examSortName:`${firstSerial}${firstSort} > ${secondSerial}${secondSort}`,
                    questionLists:newQuestionLists 
                })
                $this.setData({ loading: false });  //骨架隐藏 
            })
        } catch (error) { console.log(error) }
    }, 
    arrayToString(arr) {
        return arr.join('或');
    }, 
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() { },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() { },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() { },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() { },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() { },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() { }, 
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() { }
});
