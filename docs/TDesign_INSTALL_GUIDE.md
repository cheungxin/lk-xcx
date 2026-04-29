# 刷题小程序 - TDesign组件安装指南

## 一、问题说明

使用TDesign组件时遇到错误，通常是因为：

1. ❌ 未安装 `tdesign-miniprogram` npm包
2. ❌ 未在微信开发者工具中构建npm
3. ❌ 组件路径配置错误
4. ❌ 未勾选"将JS编译成ES5"

## 二、正确的安装步骤

### 步骤1：初始化npm（如果项目还没有package.json）

```bash
cd d:\其他\lk-xcx\01 源代码\miniprogram
npm init -y
```

### 步骤2：安装TDesign组件包

```bash
npm install tdesign-miniprogram --save
```

**注意**：确保在 `miniprogram` 目录下执行此命令。

### 步骤3：在微信开发者工具中构建npm

1. 打开微信开发者工具
2. 打开项目目录：`d:\其他\lk-xcx\01 源代码\miniprogram`
3. 点击菜单栏：**工具** → **构建npm**
4. 或者使用快捷键：`Ctrl + Shift + B`

### 步骤4：配置项目

在 `project.config.json` 中添加配置：

```json
{
  "setting": {
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./miniprogram"
      }
    ]
  }
}
```

### 步骤5：勾选ES5编译选项

1. 在微信开发者工具中，点击右上角**详情**
2. 选择**本地设置**标签
3. 勾选 **"将JS编译成ES5"** 选项

### 步骤6：启用npm包

在 `app.json` 中添加：

```json
{
  "setting": {
    "packNpmManually": false,
    "packNpmRelationList": []
  }
}
```

## 三、组件使用方式

### 方式1：全局引入（推荐在app.json中）

```json
{
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon"
  }
}
```

### 方式2：局部引入（在页面或组件的json中）

```json
{
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon"
  }
}
```

## 四、常见错误及解决方案

### ❌ 错误1：Failed to load font

**原因**：这是开发者工具的bug，不影响真机使用。

**解决方案**：忽略此警告，真机上运行正常。

### ❌ 错误2：Can not find module 'tdesign-miniprogram'

**原因**：npm包未安装或未构建。

**解决方案**：
1. 确保已执行 `npm install tdesign-miniprogram`
2. 确保已执行**构建npm**操作

### ❌ 错误3：页面空白或组件不显示

**原因**：ES5编译未勾选。

**解决方案**：
1. 详情 → 本地设置 → 勾选"将JS编译成ES5"
2. 重新编译项目

### ❌ 错误4：组件路径错误

**原因**：组件路径配置不正确。

**解决方案**：
确保路径为 `tdesign-miniprogram/icon/icon`，不是 `/tdesign-miniprogram/...`

## 五、快速验证

如果遇到问题，可以先尝试使用简单的文本替代图标，验证页面结构是否正确：

```xml
<!-- 临时替代方案 -->
<text class="icon">🔍</text>  <!-- 搜索 -->
<text class="icon">📅</text>  <!-- 日历 -->
<text class="icon">📄</text>  <!-- 文件 -->
```

## 六、备用方案：使用图片图标

如果TDesign组件持续出现问题，可以改用本地图片图标：

1. 将图标图片放入 `assets/images/` 目录
2. 使用 `<image>` 标签引用
3. 在Mock数据中使用图片路径而非图标名称

### 示例：

```xml
<!-- 使用图片 -->
<image src="/miniprogram/assets/images/icon-search.png" mode="aspectFit" />
```

## 七、当前项目状态

当前项目已配置：
- ✅ 首页 `index.json` 已引入 `t-icon`
- ✅ TabBar组件 `tabbar.json` 已引入 `t-icon`
- ✅ Mock数据 `questions.js` 已添加 `iconName` 字段
- ❌ 需要安装npm包并构建

## 八、下一步操作

请按以下顺序执行：

1. **打开终端**，进入项目目录：
   ```bash
   cd d:\其他\lk-xcx\01 源代码\miniprogram
   ```

2. **安装TDesign包**：
   ```bash
   npm install tdesign-miniprogram --save
   ```

3. **在微信开发者工具中**：
   - 打开项目
   - 点击 **工具** → **构建npm**
   - 勾选 **"将JS编译成ES5"**
   - 重新编译项目

## 九、联系我们

如果仍有问题，请提供：
1. 错误截图
2. 微信开发者工具版本
3. 控制台错误信息

---

**祝开发顺利！** 🎉
