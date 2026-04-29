# 需求文档

## 介绍

本文档定义了微信小程序基座模板（template-base）的功能需求。该模板旨在合并现有的 template-init（功能丰富的官方模板）和 template-skyline（基础的 Skyline 渲染引擎模板）的优势，同时采用良好的文件组织架构，为后续使用 TDesign 组件库做准备。

该模板将提供：
- 基于 Skyline 渲染引擎的现代化渲染能力
- 模块化的文件组织结构（router、config、interface、utils、toolbox 等）
- 统一的路由管理系统
- 统一的 API 配置和网络请求封装
- 实用的工具函数库
- 可选的云开发能力支持
- 为 TDesign 组件库集成预留的配置空间

## 术语表

- **Template_Base**: 新创建的微信小程序基座模板系统
- **Skyline_Engine**: 微信小程序的新一代渲染引擎
- **Router_Manager**: 路由管理模块，负责页面跳转和路由配置
- **API_Config**: API 配置管理模块，负责管理不同环境的 API 地址
- **Request_Module**: 网络请求封装模块，负责统一的 HTTP 请求处理
- **Toolbox**: 工具函数库，包含常用的业务工具函数
- **Utils**: 通用工具库，包含基础的工具函数
- **Environment_Config**: 环境配置，用于区分开发环境和生产环境
- **Cloud_Development**: 微信小程序云开发能力
- **TDesign**: 腾讯开源的企业级设计体系和组件库

## 需求

### 需求 1: 项目基础结构

**用户故事:** 作为开发者，我希望有一个清晰的项目文件组织结构，以便我能够快速定位和管理不同类型的代码文件。

#### 验收标准

1. THE Template_Base SHALL 创建包含以下目录的项目结构：miniprogram/router、miniprogram/config、miniprogram/interface、miniprogram/utils、miniprogram/toolbox、miniprogram/components、miniprogram/pages
2. THE Template_Base SHALL 在根目录包含 project.config.json、sitemap.json、.eslintrc.js 配置文件
3. THE Template_Base SHALL 在 miniprogram 目录包含 app.js、app.json、app.wxss 入口文件
4. THE Template_Base SHALL 创建 package.json 文件用于依赖管理
5. THE Template_Base SHALL 创建 README.md 文件说明模板的使用方法和目录结构

### 需求 2: Skyline 渲染引擎配置

**用户故事:** 作为开发者，我希望使用 Skyline 渲染引擎，以便获得更好的渲染性能和现代化的开发体验。

#### 验收标准

1. WHEN 配置 project.config.json 时，THE Template_Base SHALL 设置 libVersion 为 "trial"
2. WHEN 配置 app.json 时，THE Template_Base SHALL 设置 renderer 为 "skyline"
3. WHEN 配置 app.json 时，THE Template_Base SHALL 设置 componentFramework 为 "glass-easel"
4. WHEN 配置 app.json 时，THE Template_Base SHALL 包含 rendererOptions.skyline 配置，设置 defaultDisplayBlock 为 true、defaultContentBox 为 true
5. WHEN 配置 app.json 时，THE Template_Base SHALL 设置 navigationStyle 为 "custom" 以支持自定义导航栏
6. THE Template_Base SHALL 设置 lazyCodeLoading 为 "requiredComponents" 以启用按需注入

### 需求 3: 路由管理系统

**用户故事:** 作为开发者，我希望有统一的路由管理，以便我能够方便地进行页面跳转和路由配置管理。

#### 验收标准

1. THE Template_Base SHALL 在 miniprogram/router/index.js 中创建路由管理模块
2. WHEN 调用路由跳转方法时，THE Router_Manager SHALL 支持 navigateTo、redirectTo、reLaunch、switchTab、navigateBack 五种跳转方式
3. WHEN 进行页面跳转时，THE Router_Manager SHALL 支持传递查询参数
4. THE Router_Manager SHALL 提供路由路径的集中配置，避免硬编码路径
5. WHEN 路由跳转失败时，THE Router_Manager SHALL 返回错误信息并提供错误处理机制

### 需求 4: API 配置管理

**用户故事:** 作为开发者，我希望能够集中管理 API 配置，以便在不同环境（开发/生产）之间轻松切换。

#### 验收标准

1. THE Template_Base SHALL 在 miniprogram/config/api-config.js 中创建 API 配置模块
2. THE API_Config SHALL 支持开发环境和生产环境的配置切换
3. THE API_Config SHALL 提供 baseURL 配置用于设置 API 基础地址
4. THE API_Config SHALL 提供超时时间配置
5. WHEN 需要云开发能力时，THE API_Config SHALL 包含云开发环境 ID 配置
6. THE API_Config SHALL 提供环境判断方法，返回当前运行环境

### 需求 5: 网络请求封装

**用户故事:** 作为开发者，我希望有统一的网络请求封装，以便我能够方便地发起 HTTP 请求并处理响应。

#### 验收标准

1. THE Template_Base SHALL 在 miniprogram/interface/request.js 中创建网络请求模块
2. WHEN 发起网络请求时，THE Request_Module SHALL 自动添加 baseURL 前缀
3. WHEN 发起网络请求时，THE Request_Module SHALL 支持请求拦截器，用于添加通用请求头和参数
4. WHEN 接收网络响应时，THE Request_Module SHALL 支持响应拦截器，用于统一处理响应数据和错误
5. WHEN 网络请求失败时，THE Request_Module SHALL 提供统一的错误处理机制
6. THE Request_Module SHALL 支持 GET、POST、PUT、DELETE 等常用 HTTP 方法
7. WHEN 请求超时时，THE Request_Module SHALL 返回超时错误信息
8. THE Request_Module SHALL 支持显示和隐藏加载提示

### 需求 6: 工具函数库

**用户故事:** 作为开发者，我希望有常用的工具函数库，以便我能够快速实现常见的功能需求。

#### 验收标准

1. THE Template_Base SHALL 在 miniprogram/utils 目录提供通用工具函数
2. THE Template_Base SHALL 在 miniprogram/toolbox 目录提供业务相关的工具函数
3. THE Utils SHALL 提供日期格式化函数
4. THE Utils SHALL 提供数据类型判断函数（isObject、isArray、isString 等）
5. THE Utils SHALL 提供深拷贝函数
6. THE Toolbox SHALL 提供本地存储封装函数（支持同步和异步操作）
7. THE Toolbox SHALL 提供防抖和节流函数
8. THE Toolbox SHALL 提供 URL 参数解析函数

### 需求 7: 组件目录结构

**用户故事:** 作为开发者，我希望有清晰的组件目录结构，以便我能够组织和管理自定义组件。

#### 验收标准

1. THE Template_Base SHALL 在 miniprogram/components 目录创建组件存放位置
2. THE Template_Base SHALL 创建自定义导航栏组件（navigation-bar）作为示例
3. WHEN 使用 Skyline 渲染引擎时，THE navigation-bar 组件 SHALL 适配 Skyline 的自定义导航栏需求
4. THE Template_Base SHALL 在 components 目录下为未来的 TDesign 组件集成预留空间

### 需求 8: 基础页面示例

**用户故事:** 作为开发者，我希望有基础的页面示例，以便我能够快速了解如何使用模板的各项功能。

#### 验收标准

1. THE Template_Base SHALL 创建首页（pages/index）作为主要示例页面
2. THE Template_Base SHALL 创建日志页面（pages/logs）作为辅助示例页面
3. WHEN 展示首页时，THE index 页面 SHALL 演示路由跳转的使用方法
4. WHEN 展示首页时，THE index 页面 SHALL 演示网络请求的使用方法
5. WHEN 展示首页时，THE index 页面 SHALL 演示工具函数的使用方法
6. THE 示例页面 SHALL 使用 Skyline 渲染引擎的语法和特性

### 需求 9: 环境配置管理

**用户故事:** 作为开发者，我希望能够方便地管理不同环境的配置，以便在开发和生产环境之间切换。

#### 验收标准

1. THE Template_Base SHALL 在 miniprogram/config 目录创建环境配置文件
2. THE Environment_Config SHALL 提供开发环境配置对象
3. THE Environment_Config SHALL 提供生产环境配置对象
4. THE Environment_Config SHALL 提供当前环境标识（development/production）
5. WHEN 切换环境时，THE Environment_Config SHALL 通过修改单一变量实现环境切换
6. THE Environment_Config SHALL 导出当前激活的环境配置

### 需求 10: 云开发能力支持

**用户故事:** 作为开发者，我希望模板支持云开发能力，以便在需要时可以快速启用云开发功能。

#### 验收标准

1. THE Template_Base SHALL 在配置文件中包含云开发环境 ID 配置项
2. WHEN 启用云开发时，THE Template_Base SHALL 在 app.js 中初始化云开发环境
3. THE Template_Base SHALL 提供云开发能力的开关配置，允许开发者选择是否启用
4. WHEN 云开发被禁用时，THE Template_Base SHALL 正常运行而不依赖云开发功能

### 需求 11: TDesign 组件库集成准备

**用户故事:** 作为开发者，我希望模板为 TDesign 组件库的集成做好准备，以便将来可以方便地引入 TDesign 组件。

#### 验收标准

1. THE Template_Base SHALL 在 package.json 中预留 TDesign 组件库的依赖配置位置
2. THE Template_Base SHALL 在 app.json 中预留 TDesign 组件的全局引用配置位置
3. THE Template_Base SHALL 在 app.wxss 中预留 TDesign 样式的引入位置
4. THE Template_Base SHALL 在 README.md 中说明如何集成 TDesign 组件库

### 需求 12: 代码质量和规范

**用户故事:** 作为开发者，我希望模板遵循代码规范，以便保持代码质量和一致性。

#### 验收标准

1. THE Template_Base SHALL 提供 .eslintrc.js 配置文件用于代码检查
2. THE Template_Base SHALL 使用 ES6+ 语法编写代码
3. THE Template_Base SHALL 为所有公共函数提供 JSDoc 注释
4. THE Template_Base SHALL 使用统一的代码缩进（2 空格）
5. THE Template_Base SHALL 清理所有不必要的官方示例代码，保持代码简洁

### 需求 13: 文档和说明

**用户故事:** 作为开发者，我希望有完整的文档说明，以便我能够快速上手使用模板。

#### 验收标准

1. THE Template_Base SHALL 在 README.md 中说明模板的功能特性
2. THE Template_Base SHALL 在 README.md 中说明目录结构和文件组织方式
3. THE Template_Base SHALL 在 README.md 中提供快速开始指南
4. THE Template_Base SHALL 在 README.md 中说明如何配置环境和 API
5. THE Template_Base SHALL 在 README.md 中说明如何使用路由管理和网络请求
6. THE Template_Base SHALL 在关键代码文件中提供详细的注释说明
