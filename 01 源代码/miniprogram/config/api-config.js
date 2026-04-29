/**
 * API 环境配置管理器
 * 用于管理不同环境（开发/生产）的 API 配置
 */

// 当前环境标识：'development' | 'production'
let currentEnv = 'development'

// 开发环境配置
const developmentConfig = {
  baseURL: 'https://dev-api.example.com',
  timeout: 10000, // 10秒超时
  cloudEnvId: 'dev-env-xxxxx'
}

// 生产环境配置
const productionConfig = {
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5秒超时
  cloudEnvId: 'prod-env-xxxxx'
}

// 环境配置映射
const envConfigs = {
  development: developmentConfig,
  production: productionConfig
}

/**
 * 获取当前环境的 API 基础地址
 * @returns {string} API 基础地址
 */
function getBaseURL() {
  return envConfigs[currentEnv].baseURL
}

/**
 * 获取当前环境标识
 * @returns {string} 环境标识 ('development' | 'production')
 */
function getCurrentEnv() {
  return currentEnv
}

/**
 * 设置当前环境
 * @param {string} env - 环境标识 ('development' | 'production')
 * @throws {Error} 如果环境标识无效
 */
function setEnv(env) {
  if (!envConfigs[env]) {
    throw new Error(`Invalid environment: ${env}. Must be 'development' or 'production'.`)
  }
  currentEnv = env
}

/**
 * 获取请求超时时间
 * @returns {number} 超时时间（毫秒）
 */
function getTimeout() {
  return envConfigs[currentEnv].timeout
}

/**
 * 获取云开发环境 ID
 * @returns {string} 云开发环境 ID
 */
function getCloudEnvId() {
  return envConfigs[currentEnv].cloudEnvId
}

/**
 * 判断是否为开发环境
 * @returns {boolean}
 */
function isDevelopment() {
  return currentEnv === 'development'
}

/**
 * 判断是否为生产环境
 * @returns {boolean}
 */
function isProduction() {
  return currentEnv === 'production'
}

/**
 * 获取当前环境的完整配置
 * @returns {Object} 当前环境配置对象
 */
function getConfig() {
  return { ...envConfigs[currentEnv] }
}

// 导出 API 配置管理器
module.exports = {
  getBaseURL,
  getCurrentEnv,
  setEnv,
  getTimeout,
  getCloudEnvId,
  isDevelopment,
  isProduction,
  getConfig
}
