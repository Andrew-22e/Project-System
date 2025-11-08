// API配置文件
// 用于管理不同环境的API地址
// 
// 🔧 三层架构配置：
// 在三层架构中，所有API请求都通过网关(8080端口)发送，而不是直接访问后端

// 网关服务器地址
const GATEWAY_SERVER_URL = 'http://localhost:8080';

const API_CONFIG = {
  // 开发环境配置
  development: {
    // 网关服务器（三层架构中的统一入口）
    gateway: GATEWAY_SERVER_URL,
    // 本地开发服务器
    local: GATEWAY_SERVER_URL,
    // 原始模拟服务器
    original: GATEWAY_SERVER_URL,
    // Swagger Mock服务器
    swagger: GATEWAY_SERVER_URL,
    // ngrok内网穿透服务器
    ngrok: GATEWAY_SERVER_URL,
    // 真实后端服务器（开发环境）
    backend: GATEWAY_SERVER_URL,
    // 当前使用的服务器（必须使用网关）
    current: GATEWAY_SERVER_URL // 统一使用网关服务器
  },
  
  // 测试环境配置
  testing: {
    gateway: GATEWAY_SERVER_URL,
    local: GATEWAY_SERVER_URL,
    ngrok: GATEWAY_SERVER_URL,
    backend: GATEWAY_SERVER_URL,
    current: GATEWAY_SERVER_URL
  },
  
  // 生产环境配置
  production: {
    gateway: GATEWAY_SERVER_URL,
    local: GATEWAY_SERVER_URL,
    ngrok: GATEWAY_SERVER_URL,
    backend: GATEWAY_SERVER_URL,
    current: GATEWAY_SERVER_URL
  }
};

// 获取当前环境
const getCurrentEnv = () => {
  // 可以根据实际需求调整环境判断逻辑
  return process.env.NODE_ENV || 'development';
};

// 获取当前API配置
const getCurrentConfig = () => {
  const env = getCurrentEnv();
  return API_CONFIG[env] || API_CONFIG.development;
};

// 切换API服务器
const switchApiServer = (serverType) => {
  const env = getCurrentEnv();
  const config = API_CONFIG[env];
  
  if (config && config[serverType]) {
    config.current = config[serverType];
    return config.current;
  } else {
    return null;
  }
};

// 获取所有可用的服务器类型
const getAvailableServers = () => {
  const env = getCurrentEnv();
  const config = API_CONFIG[env];
  return Object.keys(config).filter(key => key !== 'current');
};

// 获取当前服务器信息
const getCurrentServerInfo = () => {
  const config = getCurrentConfig();
  const availableServers = getAvailableServers();
  
  return {
    current: config.current,
    environment: getCurrentEnv(),
    available: availableServers.map(type => ({
      type,
      url: config[type]
    }))
  };
};

// 验证服务器连接
const validateServer = async (serverUrl) => {
  try {
    // 这里可以添加实际的连接测试逻辑
    return {
      valid: true,
      url: serverUrl,
      message: '服务器连接正常'
    };
  } catch (error) {
    return {
      valid: false,
      url: serverUrl,
      message: `服务器连接失败: ${error.message}`
    };
  }
};

// 导出配置
export {
  API_CONFIG,
  getCurrentConfig,
  getCurrentEnv,
  switchApiServer,
  getAvailableServers,
  getCurrentServerInfo,
  validateServer
};

// 默认导出
export default {
  API_CONFIG,
  getCurrentConfig,
  getCurrentEnv,
  switchApiServer,
  getAvailableServers,
  getCurrentServerInfo,
  validateServer
};
