# 云函数目录

本目录用于存放微信小程序云函数。

## 目录结构

```
cloudfunctions/
├── example/              # 示例云函数
│   ├── index.js         # 云函数入口文件
│   └── package.json     # 云函数依赖配置
└── README.md            # 说明文档
```

## 云函数说明

### example - 示例云函数

演示基本的云函数使用方法，包括：
- 获取调用者的 openid、appid、unionid
- 接收和返回参数
- 返回当前时间戳

**调用示例：**

```javascript
// 在小程序中调用云函数
wx.cloud.callFunction({
  name: 'example',
  data: {
    message: 'Hello Cloud Function'
  }
}).then(res => {
  console.log('云函数返回结果：', res.result)
}).catch(err => {
  console.error('云函数调用失败：', err)
})
```

## 如何创建新的云函数

1. 在 `cloudfunctions` 目录下创建新的文件夹，文件夹名即为云函数名
2. 在文件夹中创建 `index.js` 作为云函数入口文件
3. 在文件夹中创建 `package.json` 配置文件
4. 在微信开发者工具中右键云函数文件夹，选择"上传并部署：云端安装依赖"

## 云函数开发注意事项

1. **环境初始化**：使用 `cloud.DYNAMIC_CURRENT_ENV` 可以自动适配当前环境
2. **依赖管理**：在 `package.json` 中声明依赖，上传时会自动安装
3. **返回格式**：建议统一返回格式，包含 `success`、`message`、`data` 字段
4. **错误处理**：使用 try-catch 捕获异常，返回友好的错误信息
5. **性能优化**：避免在云函数中进行耗时操作，合理使用缓存

## 相关文档

- [微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云函数开发指南](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html)
