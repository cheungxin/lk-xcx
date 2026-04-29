// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 示例云函数
 * 演示基本的云函数使用方法
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    success: true,
    message: '云函数调用成功',
    data: {
      // 返回调用者的 openid
      openid: wxContext.OPENID,
      // 返回调用者的 appid
      appid: wxContext.APPID,
      // 返回调用者的 unionid
      unionid: wxContext.UNIONID,
      // 返回传入的参数
      event: event,
      // 返回当前时间戳
      timestamp: Date.now()
    }
  }
}
