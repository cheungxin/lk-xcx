# 数据模型使用说明

## 概述

数据模型层提供了用户相关操作和通用 CRUD 操作的封装，基于微信小程序云开发数据库。

## 模块结构

- `database.js` - 云数据库基类，提供数据库实例初始化和常用集合引用
- `index.js` - 数据模型类，提供用户操作和通用 CRUD 方法

## 使用前提

1. 确保在 `app.js` 中已初始化云开发环境
2. 确保云开发数据库已创建相应的集合

## API 文档

### 用户相关操作

#### register(userInfo)

注册新用户

```javascript
const model = require('../../model/index.js')

// 注册用户
try {
  const result = await model.register({
    openid: 'user-openid-123',
    nickName: '张三',
    avatarUrl: 'https://example.com/avatar.jpg',
    gender: 1,
    country: '中国',
    province: '广东省',
    city: '深圳市'
  })
  console.log('注册成功，用户ID:', result._id)
} catch (error) {
  console.error('注册失败:', error.message)
}
```

**参数：**
- `userInfo.openid` (string, 必填) - 用户 openid
- `userInfo.nickName` (string, 可选) - 用户昵称
- `userInfo.avatarUrl` (string, 可选) - 用户头像
- `userInfo.gender` (number, 可选) - 用户性别（0-未知，1-男，2-女）
- `userInfo.country` (string, 可选) - 国家
- `userInfo.province` (string, 可选) - 省份
- `userInfo.city` (string, 可选) - 城市

**返回：** Promise<Object> - 包含 _id 和用户信息

#### getUserInfo(identifier, identifierType)

获取用户信息

```javascript
// 通过 openid 获取
const user = await model.getUserInfo('user-openid-123', 'openid')

// 通过 _id 获取
const user = await model.getUserInfo('doc-id-456', '_id')

if (user) {
  console.log('用户信息:', user)
} else {
  console.log('用户不存在')
}
```

**参数：**
- `identifier` (string, 必填) - 用户标识（openid 或 _id）
- `identifierType` (string, 可选) - 标识类型，'openid' 或 '_id'，默认 'openid'

**返回：** Promise<Object|null> - 用户信息或 null

#### updateUserInfo(userId, updateData)

更新用户信息

```javascript
// 更新用户昵称和头像
await model.updateUserInfo('user-id-123', {
  nickName: '李四',
  avatarUrl: 'https://example.com/new-avatar.jpg'
})
```

**参数：**
- `userId` (string, 必填) - 用户 _id
- `updateData` (Object, 必填) - 要更新的数据

**返回：** Promise<Object> - 更新结果

**注意：** 不能更新 _id、openid、createTime 字段

### 通用 CRUD 操作

#### query(collectionName, whereCondition, options)

查询数据

```javascript
// 基础查询
const users = await model.query('users', { gender: 1 })

// 带选项的查询
const users = await model.query('users', 
  { age: model.getCommand().gte(18) }, // 年龄 >= 18
  {
    limit: 10,
    skip: 0,
    orderBy: { createTime: 'desc' },
    field: ['nickName', 'avatarUrl', 'createTime']
  }
)
```

**参数：**
- `collectionName` (string, 必填) - 集合名称
- `whereCondition` (Object, 可选) - 查询条件，默认 {}
- `options` (Object, 可选) - 查询选项
  - `limit` (number) - 限制返回数量，默认 20
  - `skip` (number) - 跳过数量，默认 0
  - `orderBy` (Object) - 排序，如 { createTime: 'desc' }
  - `field` (Array) - 指定返回字段

**返回：** Promise<Array> - 查询结果数组

#### add(collectionName, data)

添加数据

```javascript
// 添加配置数据
const result = await model.add('config', {
  key: 'app_version',
  value: '1.0.0',
  description: '应用版本号'
})

console.log('添加成功，ID:', result._id)
```

**参数：**
- `collectionName` (string, 必填) - 集合名称
- `data` (Object, 必填) - 要添加的数据

**返回：** Promise<Object> - 包含 _id 和添加的数据

**注意：** 会自动添加 createTime 和 updateTime 字段

#### update(collectionName, docId, updateData)

更新数据

```javascript
// 更新配置
await model.update('config', 'config-id-123', {
  value: '1.0.1',
  description: '应用版本号（已更新）'
})
```

**参数：**
- `collectionName` (string, 必填) - 集合名称
- `docId` (string, 必填) - 文档 ID
- `updateData` (Object, 必填) - 要更新的数据

**返回：** Promise<Object> - 更新结果

**注意：** 会自动更新 updateTime 字段，不能更新 _id 字段

#### delete(collectionName, docId)

删除数据

```javascript
// 删除配置
await model.delete('config', 'config-id-123')
```

**参数：**
- `collectionName` (string, 必填) - 集合名称
- `docId` (string, 必填) - 文档 ID

**返回：** Promise<Object> - 删除结果

### 扩展操作

#### queryWithCount(collectionName, options)

带总数的查询

```javascript
// 分页查询
const result = await model.queryWithCount('users', {
  where: { gender: 1 },
  limit: 10,
  skip: 0,
  orderBy: { createTime: 'desc' }
})

console.log('总数:', result.total)
console.log('数据:', result.data)
```

**参数：**
- `collectionName` (string, 必填) - 集合名称
- `options` (Object, 可选) - 查询选项
  - `where` (Object) - 查询条件
  - `limit` (number) - 限制数量
  - `skip` (number) - 跳过数量
  - `orderBy` (Object) - 排序
  - `field` (Array) - 字段过滤

**返回：** Promise<Object> - { data: Array, total: number }

## 数据库基类方法

从 `database.js` 继承的方法：

```javascript
// 获取数据库实例
const db = model.getDB()

// 获取集合引用
const collection = model.getCollection('users')

// 获取命令对象（用于复杂查询）
const cmd = model.getCommand()

// 使用命令对象
const users = await model.query('users', {
  age: cmd.gte(18).and(cmd.lte(60)) // 18 <= age <= 60
})

// 获取常用集合引用
const usersCollection = model.getUsersCollection()
const configCollection = model.getConfigCollection()
const logsCollection = model.getLogsCollection()
const feedbackCollection = model.getFeedbackCollection()

// 检查云数据库是否可用
if (model.isAvailable()) {
  console.log('云数据库可用')
}
```

## 完整示例

### 用户注册和登录流程

```javascript
const model = require('../../model/index.js')

Page({
  data: {
    userInfo: null
  },

  async onLoad() {
    await this.checkLogin()
  },

  // 检查登录状态
  async checkLogin() {
    try {
      // 获取用户 openid（实际项目中需要通过云函数获取）
      const openid = wx.getStorageSync('openid')
      
      if (openid) {
        // 查询用户信息
        const user = await model.getUserInfo(openid)
        
        if (user) {
          this.setData({ userInfo: user })
        } else {
          // 用户不存在，需要注册
          await this.register(openid)
        }
      }
    } catch (error) {
      console.error('检查登录失败:', error)
    }
  },

  // 注册用户
  async register(openid) {
    try {
      // 获取用户信息（需要用户授权）
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })

      // 注册用户
      const result = await model.register({
        openid,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        country: userInfo.country,
        province: userInfo.province,
        city: userInfo.city
      })

      this.setData({ userInfo: result })
      wx.showToast({ title: '注册成功', icon: 'success' })
    } catch (error) {
      console.error('注册失败:', error)
      wx.showToast({ title: '注册失败', icon: 'error' })
    }
  },

  // 更新用户信息
  async updateProfile() {
    try {
      const { userInfo } = this.data
      
      await model.updateUserInfo(userInfo._id, {
        nickName: '新昵称'
      })

      wx.showToast({ title: '更新成功', icon: 'success' })
    } catch (error) {
      console.error('更新失败:', error)
      wx.showToast({ title: '更新失败', icon: 'error' })
    }
  }
})
```

### 数据列表查询

```javascript
const model = require('../../model/index.js')

Page({
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    total: 0
  },

  async onLoad() {
    await this.loadList()
  },

  // 加载列表
  async loadList() {
    try {
      wx.showLoading({ title: '加载中...' })

      const { page, pageSize } = this.data
      
      const result = await model.queryWithCount('articles', {
        where: { status: 1 }, // 只查询已发布的文章
        limit: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createTime: 'desc' }
      })

      this.setData({
        list: result.data,
        total: result.total
      })

      wx.hideLoading()
    } catch (error) {
      console.error('加载列表失败:', error)
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  // 加载更多
  async loadMore() {
    const { page } = this.data
    this.setData({ page: page + 1 })
    await this.loadList()
  }
})
```

## 错误处理

所有方法都会抛出错误，建议使用 try-catch 处理：

```javascript
try {
  const result = await model.register(userInfo)
  // 处理成功
} catch (error) {
  // 处理错误
  console.error('操作失败:', error.message)
  wx.showToast({ 
    title: error.message || '操作失败', 
    icon: 'none' 
  })
}
```

## 注意事项

1. **云开发初始化**：使用前确保在 `app.js` 中已初始化云开发环境
2. **权限控制**：云数据库的权限需要在云开发控制台配置
3. **数据安全**：敏感操作建议通过云函数处理
4. **性能优化**：
   - 使用索引提高查询性能
   - 合理使用 limit 限制返回数量
   - 使用 field 只返回需要的字段
5. **错误处理**：所有异步操作都应该使用 try-catch 处理错误
