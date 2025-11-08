// 性能优化配置文件
// 用于管理小程序的性能相关设置

const PERFORMANCE_CONFIG = {
  // API请求配置
  api: {
    // 请求超时时间（毫秒）
    timeout: 10000,
    // 重试次数
    retryCount: 3,
    // 重试延迟（毫秒）
    retryDelay: 1000,
    // 防抖时间（毫秒）
    debounceTime: 500,
    // 批量处理延迟（毫秒）
    batchDelay: 100
  },
  
  // 定时器配置
  timers: {
    // 顶部票数更新间隔（毫秒）
    topBarUpdateInterval: 5000,
    // AI内容更新间隔（毫秒）
    aiContentUpdateInterval: 4000,
    // 缓存有效期（毫秒）
    cacheDuration: 2000
  },
  
  // UI优化配置
  ui: {
    // 最大同时存在的特效数量
    maxEffects: 8,
    // 特效持续时间（毫秒）
    effectDuration: 2500,
    // 是否启用GPU加速
    enableGPUAcceleration: true,
    // 是否启用will-change优化
    enableWillChange: true
  },
  
  // 性能监控配置
  monitoring: {
    // 是否启用性能监控
    enabled: true,
    // 是否在开发环境显示性能信息
    showInDevelopment: true,
    // 性能数据采样率（0-1）
    samplingRate: 1.0
  },
  
  // 网络优化配置
  network: {
    // 是否启用请求队列
    enableRequestQueue: true,
    // 队列最大长度
    maxQueueLength: 50,
    // 是否启用请求合并
    enableRequestMerging: true
  }
};

// 获取当前环境的配置
const getConfig = (key) => {
  return PERFORMANCE_CONFIG[key] || {};
};

// 检查是否启用性能监控
const isMonitoringEnabled = () => {
  return PERFORMANCE_CONFIG.monitoring.enabled;
};

// 检查是否在开发环境
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// 导出配置
module.exports = {
  PERFORMANCE_CONFIG,
  getConfig,
  isMonitoringEnabled,
  isDevelopment
};
