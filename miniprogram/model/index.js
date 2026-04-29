/**
 * 数据模型类
 * 继承数据库基类，提供用户相关操作和通用 CRUD 操作
 * 
 * 使用说明：
 * 1. 用户相关操作：register、getUserInfo、updateUserInfo
 * 2. 通用 CRUD 操作：query、update、delete、add
 * 3. 所有操作返回 Promise，支持 async/await
 * 
 * 示例：
 * const model = require('./model/index.js')
 * 
 * // 注册用户
 * await model.register({ openid: 'xxx', nickName: '张三' })
 * 
 * // 查询数据
 * const users = await model.query('users', { age: 18 })
 * 
 * // 更新数据
 * await model.update('users', 'user-id-123', { nickName: '李四' })
 */

const database = require('./database.js')

/**
 * 用户注册
 * 在用户集合中创建新用户记录
 * 
 * @param {Object} userInfo - 用户信息
 * @param {string} userInfo.openid - 用户 openid（必填）
 * @param {string} [userInfo.nickName] - 用户昵称
 * @param {string} [userInfo.avatarUrl] - 用户头像
 * @param {number} [userInfo.gender] - 用户性别（0-未知，1-男，2-女）
 * @param {string} [userInfo.country] - 国家
 * @param {string} [userInfo.province] - 省份
 * @param {string} [userInfo.city] - 城市
 * @returns {Promise<Object>} 返回创建结果，包含 _id
 * @throws {Error} 如果 openid 为空或用户已存在
 */
async function register(userInfo) {
  if (!userInfo || !userInfo.openid) {
    throw new Error('用户 openid 不能为空')
  }

  try {
    const usersCollection = database.getUsersCollection()
    
    // 检查用户是否已存在
    const existingUser = await usersCollection
      .where({ openid: userInfo.openid })
      .get()
    
    if (existingUser.data && existingUser.data.length > 0) {
      throw new Error('用户已存在')
    }

    // 创建用户记录
    const userData = {
      openid: userInfo.openid,
      nickName: userInfo.nickName || '',
      avatarUrl: userInfo.avatarUrl || '',
      gender: userInfo.gender || 0,
      country: userInfo.country || '',
      province: userInfo.province || '',
      city: userInfo.city || '',
      createTime: database.getDB().serverDate(), // 使用服务器时间
      updateTime: database.getDB().serverDate()
    }

    const result = await usersCollection.add({
      data: userData
    })

    console.log('用户注册成功:', result._id)
    return {
      _id: result._id,
      ...userData
    }
  } catch (error) {
    console.error('用户注册失败:', error)
    throw error
  }
}

/**
 * 获取用户信息
 * 根据 openid 或 _id 查询用户信息
 * 
 * @param {string} identifier - 用户标识（openid 或 _id）
 * @param {string} [identifierType='openid'] - 标识类型，'openid' 或 '_id'
 * @returns {Promise<Object|null>} 返回用户信息，不存在则返回 null
 */
async function getUserInfo(identifier, identifierType = 'openid') {
  if (!identifier) {
    throw new Error('用户标识不能为空')
  }

  try {
    const usersCollection = database.getUsersCollection()
    
    // 构建查询条件
    const whereCondition = identifierType === '_id' 
      ? { _id: identifier }
      : { openid: identifier }

    const result = await usersCollection
      .where(whereCondition)
      .get()

    if (result.data && result.data.length > 0) {
      return result.data[0]
    }

    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}

/**
 * 更新用户信息
 * 根据 _id 更新用户信息
 * 
 * @param {string} userId - 用户 _id
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 返回更新结果
 * @throws {Error} 如果用户不存在
 */
async function updateUserInfo(userId, updateData) {
  if (!userId) {
    throw new Error('用户 ID 不能为空')
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error('更新数据不能为空')
  }

  try {
    const usersCollection = database.getUsersCollection()
    
    // 添加更新时间
    const dataToUpdate = {
      ...updateData,
      updateTime: database.getDB().serverDate()
    }

    // 移除不允许更新的字段
    delete dataToUpdate._id
    delete dataToUpdate.openid
    delete dataToUpdate.createTime

    const result = await usersCollection
      .doc(userId)
      .update({
        data: dataToUpdate
      })

    if (result.stats.updated === 0) {
      throw new Error('用户不存在或更新失败')
    }

    console.log('用户信息更新成功:', userId)
    return result
  } catch (error) {
    console.error('更新用户信息失败:', error)
    throw error
  }
}

/**
 * 通用查询操作
 * 从指定集合查询数据
 * 
 * @param {string} collectionName - 集合名称
 * @param {Object} [whereCondition={}] - 查询条件
 * @param {Object} [options={}] - 查询选项
 * @param {number} [options.limit=20] - 限制返回数量
 * @param {number} [options.skip=0] - 跳过数量
 * @param {Object} [options.orderBy] - 排序字段，如 { createTime: 'desc' }
 * @param {Array} [options.field] - 指定返回字段
 * @returns {Promise<Array>} 返回查询结果数组
 */
async function query(collectionName, whereCondition = {}, options = {}) {
  if (!collectionName) {
    throw new Error('集合名称不能为空')
  }

  try {
    const collection = database.getCollection(collectionName)
    
    // 构建查询
    let queryBuilder = collection.where(whereCondition)

    // 应用限制
    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit)
    } else {
      queryBuilder = queryBuilder.limit(20) // 默认限制 20 条
    }

    // 应用跳过
    if (options.skip) {
      queryBuilder = queryBuilder.skip(options.skip)
    }

    // 应用排序
    if (options.orderBy) {
      const orderField = Object.keys(options.orderBy)[0]
      const orderType = options.orderBy[orderField]
      queryBuilder = queryBuilder.orderBy(orderField, orderType)
    }

    // 应用字段过滤
    if (options.field && Array.isArray(options.field)) {
      const fieldObj = {}
      options.field.forEach(f => {
        fieldObj[f] = true
      })
      queryBuilder = queryBuilder.field(fieldObj)
    }

    const result = await queryBuilder.get()
    return result.data || []
  } catch (error) {
    console.error('查询数据失败:', error)
    throw error
  }
}

/**
 * 通用更新操作
 * 更新指定集合中的文档
 * 
 * @param {string} collectionName - 集合名称
 * @param {string} docId - 文档 ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 返回更新结果
 */
async function update(collectionName, docId, updateData) {
  if (!collectionName) {
    throw new Error('集合名称不能为空')
  }

  if (!docId) {
    throw new Error('文档 ID 不能为空')
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error('更新数据不能为空')
  }

  try {
    const collection = database.getCollection(collectionName)
    
    // 添加更新时间
    const dataToUpdate = {
      ...updateData,
      updateTime: database.getDB().serverDate()
    }

    // 移除 _id 字段（不允许更新）
    delete dataToUpdate._id

    const result = await collection
      .doc(docId)
      .update({
        data: dataToUpdate
      })

    console.log('数据更新成功:', collectionName, docId)
    return result
  } catch (error) {
    console.error('更新数据失败:', error)
    throw error
  }
}

/**
 * 通用删除操作
 * 删除指定集合中的文档
 * 
 * @param {string} collectionName - 集合名称
 * @param {string} docId - 文档 ID
 * @returns {Promise<Object>} 返回删除结果
 */
async function deleteDoc(collectionName, docId) {
  if (!collectionName) {
    throw new Error('集合名称不能为空')
  }

  if (!docId) {
    throw new Error('文档 ID 不能为空')
  }

  try {
    const collection = database.getCollection(collectionName)
    
    const result = await collection
      .doc(docId)
      .remove()

    if (result.stats.removed === 0) {
      throw new Error('文档不存在或删除失败')
    }

    console.log('数据删除成功:', collectionName, docId)
    return result
  } catch (error) {
    console.error('删除数据失败:', error)
    throw error
  }
}

/**
 * 通用添加操作
 * 向指定集合添加新文档
 * 
 * @param {string} collectionName - 集合名称
 * @param {Object} data - 要添加的数据
 * @returns {Promise<Object>} 返回添加结果，包含 _id
 */
async function add(collectionName, data) {
  if (!collectionName) {
    throw new Error('集合名称不能为空')
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error('添加数据不能为空')
  }

  try {
    const collection = database.getCollection(collectionName)
    
    // 添加创建时间和更新时间
    const dataToAdd = {
      ...data,
      createTime: database.getDB().serverDate(),
      updateTime: database.getDB().serverDate()
    }

    const result = await collection.add({
      data: dataToAdd
    })

    console.log('数据添加成功:', collectionName, result._id)
    return {
      _id: result._id,
      ...dataToAdd
    }
  } catch (error) {
    console.error('添加数据失败:', error)
    throw error
  }
}

/**
 * 批量查询操作
 * 支持更复杂的查询条件
 * 
 * @param {string} collectionName - 集合名称
 * @param {Object} options - 查询选项
 * @param {Object} [options.where] - 查询条件
 * @param {number} [options.limit] - 限制数量
 * @param {number} [options.skip] - 跳过数量
 * @param {Object} [options.orderBy] - 排序
 * @param {Array} [options.field] - 字段过滤
 * @returns {Promise<Object>} 返回查询结果，包含 data 和 total
 */
async function queryWithCount(collectionName, options = {}) {
  if (!collectionName) {
    throw new Error('集合名称不能为空')
  }

  try {
    const collection = database.getCollection(collectionName)
    const whereCondition = options.where || {}
    
    // 获取总数
    const countResult = await collection.where(whereCondition).count()
    const total = countResult.total

    // 获取数据
    const data = await query(collectionName, whereCondition, {
      limit: options.limit,
      skip: options.skip,
      orderBy: options.orderBy,
      field: options.field
    })

    return {
      data,
      total
    }
  } catch (error) {
    console.error('批量查询失败:', error)
    throw error
  }
}

// 导出数据模型
module.exports = {
  // 用户相关操作
  register,
  getUserInfo,
  updateUserInfo,
  
  // 通用 CRUD 操作
  query,
  update,
  delete: deleteDoc, // delete 是保留字，使用 deleteDoc
  add,
  
  // 扩展操作
  queryWithCount,
  
  // 继承数据库基类的方法和常量
  ...database
}
