/**
 * API 接口定义文件
 * 集中管理所有 API 接口，便于维护和调用
 */

const request = require('./request')

/**
 * 用户相关 API
 */
const userApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.code - 微信登录凭证
   * @returns {Promise}
   */
  login(data) {
    return request.post('/user/login', data)
  },

  /**
   * 获取用户信息
   * @param {string} userId - 用户 ID
   * @returns {Promise}
   */
  getUserInfo(userId) {
    return request.get(`/user/${userId}`)
  },

  /**
   * 更新用户信息
   * @param {Object} data - 用户信息
   * @returns {Promise}
   */
  updateUserInfo(data) {
    return request.put('/user/update', data)
  },

  /**
   * 用户登出
   * @returns {Promise}
   */
  logout() {
    return request.post('/user/logout')
  }
}

/**
 * 数据列表相关 API
 */
const dataApi = {
  /**
   * 获取数据列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} [params.keyword] - 搜索关键词
   * @returns {Promise}
   */
  getList(params) {
    return request.get('/data/list', params)
  },

  /**
   * 获取数据详情
   * @param {string} id - 数据 ID
   * @returns {Promise}
   */
  getDetail(id) {
    return request.get(`/data/detail/${id}`)
  },

  /**
   * 创建数据
   * @param {Object} data - 数据内容
   * @returns {Promise}
   */
  create(data) {
    return request.post('/data/create', data)
  },

  /**
   * 更新数据
   * @param {string} id - 数据 ID
   * @param {Object} data - 更新内容
   * @returns {Promise}
   */
  update(id, data) {
    return request.put(`/data/update/${id}`, data)
  },

  /**
   * 删除数据
   * @param {string} id - 数据 ID
   * @returns {Promise}
   */
  delete(id) {
    return request.delete(`/data/delete/${id}`)
  }
}

/**
 * 文件上传相关 API
 */
const uploadApi = {
  /**
   * 上传图片
   * @param {string} filePath - 本地文件路径
   * @returns {Promise}
   */
  uploadImage(filePath) {
    return request.upload('/upload/image', filePath)
  },

  /**
   * 上传文件
   * @param {string} filePath - 本地文件路径
   * @returns {Promise}
   */
  uploadFile(filePath) {
    return request.upload('/upload/file', filePath)
  }
}

/**
 * 配置相关 API
 */
const configApi = {
  /**
   * 获取系统配置
   * @returns {Promise}
   */
  getConfig() {
    return request.get('/config/system')
  },

  /**
   * 获取字典数据
   * @param {string} type - 字典类型
   * @returns {Promise}
   */
  getDictData(type) {
    return request.get('/config/dict', { type })
  }
}

/**
 * 导出所有 API
 */
module.exports = {
  user: userApi,
  data: dataApi,
  upload: uploadApi,
  config: configApi
}
