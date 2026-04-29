import Api from '../../interface/request'
import Query from '../../interface/query'
import $ from '../../toolbox/tool'
import router from '../../router/index'

//获取小程序全局
const app = getApp()
//简道云表单ID
const app_id = '632eba7e35faf20008ef9e45'
const question_entry_id = '6406b53542490b00078a5b81'
const option_entry_id = '63f3314fac229f00076a8b84'
const answer_entry_id = '640ec4643efbd100081ce498'
const history_entry_id = '6412b02584d77e000829d393'
const favorite_entry_id  = '646b2166b0fb8f000896fa77'
const wrongs_entry_id = '646b182c08e2160008f78234'

let timerId // 定时器 ID
let answer_time = 0 // 记录答题时间（秒）
let timeStr = '00:00:00' // 显示在页面上的计时器格式字符串

const{ statusBarHeight,navigationBarHeight,clientHeight,screenHeight } = app.globalData

Page({

    /**
     * 页面的初始数据
     */
    data: {
        question_lists: [1,2,3,4,5,6,7,8,9], // 问题列表
        now_question_index: 0, // 当前问题编号 默认是swiper的index
        answer_time: '00:00:00', // 答题时间
        timer: null, // 定时器
        show_sheet: false, // 是否展示答题卡
        sheet_lists: [], //
        statusBarHeight,
        collapsed:true,
        navigationBarHeight, 
        screenHeight,
        clientHeight,  
        textSize:2,
        is_more:false,
        got_option_count:0, //默认起始值  监听页面 now_question_index 根据now_question_index 做响应选项数据
        exam_name:'答题卡',
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
                    "text": "答题卡",
                    "icon": "icon-sheets"
                },
                {
                    "text": "提交",
                    "icon": "icon-submit"
                },
                {
                    "text": "更多",
                    "icon": "icon-apps-o"
                }
            ]
        },
       is_favorite: false  
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() { }, 
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {  }, 
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {  }
})