/**
 * 云数据库基类
 * 提供云数据库实例初始化和常用集合引用
 * 
 * 使用说明：
 * 1. 确保在 app.js 中已初始化云开发环境
 * 2. 在需要使用数据库的地方引入此模块
 * 3. 通过 getDB() 获取数据库实例
 * 4. 通过 getCollection(name) 获取集合引用
 */

const apiConfig = require('../config/api-config.js')

// 数据库实例（延迟初始化）
let db = null

// 常用集合名称常量
const COLLECTIONS = {
  USERS: 'users',           // 用户集合
  CONFIG: 'config',         // 配置集合
  LOGS: 'logs',             // 日志集合
  FEEDBACK: 'feedback'      // 反馈集合
}

/**
 * 初始化云数据库实例
 * @returns {Object} 数据库实例
 * @throws {Error} 如果云开发未初始化
 */
function initDB() {
  if (db) {
    return db
  }

  try {
    // 检查云开发是否可用
    if (!wx.cloud) {
      throw new Error('云开发未初始化，请在 app.js 中调用 wx.cloud.init()')
    }

    // 获取数据库实例
    db = wx.cloud.database()
    
    console.log('云数据库初始化成功')
    return db
  } catch (error) {
    console.error('云数据库初始化失败:', error)
    throw error
  }
}

/**
 * 获取数据库实例
 * @returns {Object} 数据库实例
 */
function getDB() {
  if (!db) {
    return initDB()
  }
  return db
}

/**
 * 获取指定集合的引用
 * @param {string} collectionName - 集合名称
 * @returns {Object} 集合引用
 */
function getCollection(collectionName) {
  const database = getDB()
  return database.collection(collectionName)
}

/**
 * 获取用户集合引用
 * @returns {Object} 用户集合引用
 */
function getUsersCollection() {
  return getCollection(COLLECTIONS.USERS)
}

/**
 * 获取配置集合引用
 * @returns {Object} 配置集合引用
 */
function getConfigCollection() {
  return getCollection(COLLECTIONS.CONFIG)
}

/**
 * 获取日志集合引用
 * @returns {Object} 日志集合引用
 */
function getLogsCollection() {
  return getCollection(COLLECTIONS.LOGS)
}

/**
 * 获取反馈集合引用
 * @returns {Object} 反馈集合引用
 */
function getFeedbackCollection() {
  return getCollection(COLLECTIONS.FEEDBACK)
}

/**
 * 获取数据库命令对象
 * 用于构建复杂查询条件
 * @returns {Object} 命令对象
 */
function getCommand() {
  const database = getDB()
  return database.command
}

/**
 * 检查云数据库是否可用
 * @returns {boolean} 是否可用
 */
function isAvailable() {
  try {
    return !!wx.cloud && !!wx.cloud.database
  } catch (error) {
    return false
  }
}

// 导出数据库基类
module.exports = {
  // 核心方法
  initDB,
  getDB,
  getCollection,
  getCommand,
  isAvailable,
  
  // 常用集合引用
  getUsersCollection,
  getConfigCollection,
  getLogsCollection,
  getFeedbackCollection,
  
  // 集合名称常量
  COLLECTIONS
}
