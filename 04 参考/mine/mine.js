// pages/mine/mine.js
import { integralDetails, getMember, checkCart, getMessage, getDistributionRecordsEmbedded,getByFirstMenu,getStudyIdsByParentPhone } from '../../utils/api'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        userInfo: {},
        shopCartInfo: 0,
        distributionRecords: 0,
        chooseid: 0,
        secondStudentMenus:[],
        showFullPhone: false, // 控制是否显示完整手机号
        formattedPhone: '******', // 格式化后的手机号
        tablist: [
            { tabname: '订单中心', id: 0 },
            { tabname: '学员中心', id: 1 },
            { tabname: '家长中心', id: 2 }
        ],
        bottomlist: [
            { name: '消息动态', icon: 'https://wqianc.com/static/member-index/my-message.png', id: 2, pageurl: '/pages/message/message', isNum: 0 },
            { name: '课程优惠权益', icon: 'https://wqianc.com/static/member-index/gonggao.png', id: 1, pageurl: '/pages/coursebenefits/coursebenefits', isNum: 0 },
            { name: '我的推广', icon: 'https://wqianc.com/static/member-index/exchange-funds.png', id: 3, pageurl: '/pages/promotion/promotion' },
            { name: '收货地址管理', icon: 'https://wqianc.com/static/member-index/zhanghao.png', id: 0, pageurl: '/pages/address/address' }, 
            { name: '意见反馈', icon: 'https://wqianc.com/static/member-index/yijian.png', id: 5, pageurl: `/pages/feedback/feedback` },
        ]
    },
    goItem(event) {
        const { id, pageurl } = event.currentTarget.dataset
        console.log(id, pageurl)
        if (!this.data.isLogin) {
            return wx.showToast({
                title: '请先登录',
                icon: "none"
            })
        }
        
        // 联系客服特殊处理
        if (id === 4) {
            // 调用微信客服功能
            wx.openCustomerServiceChat({
                extInfo: {url: ''},
                corpId: '',
                success(res) {
                    console.log('客服会话打开成功', res)
                },
                fail(err) {
                    console.log('客服会话打开失败', err)
                    wx.showToast({
                        title: '客服功能暂时不可用',
                        icon: 'none'
                    })
                }
            })
            return
        }
        
        if (!pageurl) return wx.showToast({
            title: '暂未开放',
            icon: 'none'
        })
        if (pageurl) {
            wx.navigateTo({
                url: pageurl,
            })
        }
    },
    goChangeTab(event) {
        const chooseid = event.currentTarget.dataset.id
        this.setData({
            chooseid
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
    },
    //查询购物车
    async getCart() {
        let openid = wx.getStorageSync('userInfo').openId
        let data = await checkCart(openid)
        this.setData({
            shopCartInfo: data.total
        })
    },
    //查询用户资料
    async getUserInfo() {
        let data = await getMember({ openId: wx.getStorageSync('userInfo').openId })
        if (data) {
            this.setData({
                userInfo: data,
                formattedPhone: this.formatPhone(data.phone)
            })
        }
    },
    goEditMy() {
        if (!this.data.isLogin) {
            return wx.showToast({
                title: '请先登录',
                icon: "none"
            })
        }
        wx.navigateTo({
            url: '/pages/personmessage/personmessage',
        })
    },
    goPoint() {
        if (!this.data.isLogin) {
            return wx.showToast({
                title: '请先登录',
                icon: "none"
            })
        }
        console.log(111)
        wx.navigateTo({
            url: '/pages/pointdetail/pointdetail',
        })
    },
    getPoint(){
        if (!this.data.isLogin) {
            return wx.showToast({
                title: '请先登录',
                icon: "none"
            })
        }
        console.log(111)
        wx.navigateTo({
            url: '/pages/getmemberpoints/getmemberpoints',
        })
    },
    goNoPay(event) {
        const index = event.currentTarget.dataset.index
        if (index === 3) {
            return wx.navigateTo({
                url: '/pages/shopcart/shopcart',
            })
        }
        wx.navigateTo({
            url: '/pages/allorder/allorder?index=' + index,
        })
    },
    goAllOrder() {
        wx.navigateTo({
            url: '/pages/allorder/allorder',
        })
    },
    goMemberquity() {
        if (!this.data.isLogin) {
            return wx.showToast({
                title: '请先登录',
                icon: "none"
            })
        }
        wx.navigateTo({
            url: '/pages/memberequity/memberequity',
        })
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
        this.initData()
    },
    initData() {
        this.getMenu() // 加载图标
        //本地项目
        let token = wx.getStorageSync('token')
        if (!token) {
            this.setData({
                isLogin: false,
                userInfo: {},
                showFullPhone: false,
                formattedPhone: '******'
            })
        } else {
            this.getCart()
            this.getUserInfo()
            // this.getList()
            this.getListMessage()
            this.getCourseList()
            this.setData({
                isLogin: true,
                userPhone: wx.getStorageSync('userInfo').phone,
                showFullPhone: false
            })
        }
    },
    //退出登录
    logOut() {
        wx.showModal({
            title: '提示',
            content: '是否确定退出登录',
            complete: (res) => {
                if (res.cancel) {
                    console.log('取消')
                }

                if (res.confirm) {
                    const _this = this
                    wx.clearStorageSync()
                    _this.initData()
                }
            }
        })
    },
    //获取积分
    async getList() {
        let params = {
            openId: wx.getStorageSync('userInfo').openId,
            pageNum: 1,
            pageSize: 10
        }
        let data = await integralDetails(params)
        this.setData({
            list: data.pageInfo.list || [],
            total: data.totalPoints || 0
        })
    },
    //查询未读消息条数
    async getListMessage() {
        let openid = wx.getStorageSync('userInfo').openId
        console.log('加载数据')
        let result = await getMessage(openid)
        console.log('加载数据',result)
        if (result && result.length > 0) {
            const bottomlist = this.data.bottomlist
            bottomlist[0].isNum = result.filter(item => item.msgStatus === '未读').length || 0
            this.setData({
                bottomlist
            })
        }
    },
    //获取权益条数
    async getCourseList() {
        const params = {
            toRefereeOpenid: wx.getStorageSync('userInfo').openId
        }
        let data = await getDistributionRecordsEmbedded(params)
        if (data.length > 0) {
            const bottomlist = this.data.bottomlist
            bottomlist[1].isNum = data.filter(item=>{
                let date1 = new Date()
                let date2 = new Date(item.distributionCourse.validTime)
                let Comparison = date1<date2
               return item.verifyStatus=='未使用'&&Comparison
            }).length || 0
            this.setData({
                distributionRecords: data.length || 0,
                bottomlist
            })
        }
    },
    async getMenu(){
        let result = await getByFirstMenu({firstMenu:'学员中心'})
       let secondStudentMenus = result.secondMenus
       if(secondStudentMenus.length>5){
           secondStudentMenus.length = 5
       }
        this.setData({
            secondStudentMenus
        })
    },
    goLogin() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    },
    //规定 60 分以下，为不及格；60-79 分，为中；80-89 分，为良；90 分以上，为优
    goStudentCenter() {
        console.log(111)
        wx.navigateTo({
            url: '/pages/studentcenter/studentcenter',
        })
    },
    jumpToOtherMiniProgram(event) {
        console.log(event,'点击参数')
        const {item} = event.currentTarget.dataset
        if (item.type === '网页') {
            return wx.navigateTo({
                url: '/pages/webpage/webpage?data='+encodeURIComponent(JSON.stringify(item.url))
            })
        }
        wx.navigateToMiniProgram({
            appId: item.appId,
            path: item.url,
            success(res) {
                console.log('跳转成功')
            },
            fail(err) {
                console.error('跳转失败:', err)
            }
        })
    },
    //查看学生信息
   async goLookStudent(event) {
        if (!this.data.isLogin) {
            return wx.showToast({
                title: '请先登录',
                icon: "none"
            })
        }
        const index = event.currentTarget.dataset.index
        const params = {
            parentPhone:this.data.userInfo.phone
        }
        let result = await getStudyIdsByParentPhone(params)
        if(result.length===0){
            return wx.navigateTo({
                url: '/pages/Identitycheck/Identitycheck',
            })
        }
        if (index === 1) {
            // return wx.navigateToMiniProgram({
            //     appId: 'wx6118e96b99502602',
            //     path: 'parents/aat/aat?phone='+this.data.userInfo.phone, // 跳转到小程序成绩页并附加参数
            //     success: function (res) {
            //         console.log('成功跳转到指定小程序主页');
            //     },
            //     fail: function (err) {
            //         console.log('跳转到指定小程序失败:', err);
            //         // 最后的备选方案：跳转到当前小程序首页
            //         $.toast('您已取消返回');
            //     }
            // });
            return wx.navigateTo({
              url: '/parents/aat/aat?phone='+this.data.userInfo.phone,
            })
        }
        if(index===2){
            wx.navigateTo({
              url: '/pages/newAttendance/newAttendance?phone='+encodeURIComponent(JSON.stringify(result)),
            })
        }
        if(index===3){
            wx.navigateTo({
              url: '/parents/homeschool/homeschool?phone='+this.data.userInfo.phone,
            })
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        //1-3-9-27-81-256
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },
    
    /**
     * 格式化手机号显示
     */
    formatPhone(phone) {
        if (!phone || phone.length !== 11) {
            return '******'
        }
        return phone.substring(0, 3) + '****' + phone.substring(7)
    },
    
    /**
     * 点击手机号切换显示状态
     */
    togglePhoneDisplay() {
        if (!this.data.isLogin || !this.data.userInfo.phone) {
            return
        }
        this.setData({
            showFullPhone: !this.data.showFullPhone
        })
    }, 
    handleContact(e) {
        console.log('客服消息回调', e.detail)
        // e.detail.path - 小程序消息指定的路径
        // e.detail.query - 小程序消息指定的查询参数
    }
}) 
