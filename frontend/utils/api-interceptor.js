/**
 * API请求拦截器和错误处理工具
 * 提供统一的请求拦截、响应处理和错误管理
 */

class ApiInterceptor {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorHandlers = [];
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error) => {
        // 网络错误或5xx服务器错误时重试
        return error.message.includes('network') || 
               error.message.includes('timeout') ||
               (error.statusCode && error.statusCode >= 500);
      }
    };
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误处理器
   * @param {Function} handler - 错误处理函数
   */
  addErrorHandler(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * 执行请求拦截器
   * @param {Object} config - 请求配置
   * @returns {Object} 处理后的配置
   */
  async executeRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      try {
        processedConfig = await interceptor(processedConfig);
      } catch (error) {
        // 请求拦截器执行失败
      }
    }
    
    return processedConfig;
  }

  /**
   * 执行响应拦截器
   * @param {Object} response - 响应数据
   * @returns {Object} 处理后的响应
   */
  async executeResponseInterceptors(response) {
    let processedResponse = { ...response };
    
    for (const interceptor of this.responseInterceptors) {
      try {
        processedResponse = await interceptor(processedResponse);
      } catch (error) {
        // 响应拦截器执行失败
      }
    }
    
    return processedResponse;
  }

  /**
   * 执行错误处理器
   * @param {Error} error - 错误对象
   * @param {Object} config - 原始请求配置
   */
  async executeErrorHandlers(error, config) {
    for (const handler of this.errorHandlers) {
      try {
        await handler(error, config);
      } catch (handlerError) {
        // 错误处理器执行失败
      }
    }
  }

  /**
   * 带重试的请求方法
   * @param {Function} requestFn - 请求函数
   * @param {Object} config - 请求配置
   * @param {number} retryCount - 当前重试次数
   * @returns {Promise} 请求结果
   */
  async requestWithRetry(requestFn, config, retryCount = 0) {
    try {
      // 执行请求拦截器
      const processedConfig = await this.executeRequestInterceptors(config);
      
      // 执行请求
      const response = await requestFn(processedConfig);
      
      // 执行响应拦截器
      const processedResponse = await this.executeResponseInterceptors(response);
      
      return processedResponse;
    } catch (error) {
      // 检查是否需要重试
      if (retryCount < this.retryConfig.maxRetries && 
          this.retryConfig.retryCondition(error)) {
        
        // 请求失败，准备重试
        
        // 等待重试延迟
        await new Promise(resolve => setTimeout(resolve, this.retryConfig.retryDelay));
        
        // 递归重试
        return await this.requestWithRetry(requestFn, config, retryCount + 1);
      }
      
      // 执行错误处理器
      await this.executeErrorHandlers(error, config);
      
      // 抛出错误
      throw error;
    }
  }

  /**
   * 设置重试配置
   * @param {Object} config - 重试配置
   */
  setRetryConfig(config) {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * 创建默认拦截器
   */
  createDefaultInterceptors() {
    // 默认请求拦截器 - 添加时间戳和请求ID
    this.addRequestInterceptor((config) => {
      config.timestamp = Date.now();
      config.requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
      
      return config;
    });

    // 默认响应拦截器 - 记录响应时间
    this.addResponseInterceptor((response) => {
      if (response.config) {
        const duration = Date.now() - response.config.timestamp;
        // 响应时间记录（不打印到控制台）
      }
      return response;
    });

    // 默认错误处理器 - 统一错误格式
    this.addErrorHandler((error, config) => {
      const errorInfo = {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: Date.now(),
        requestId: config?.requestId,
        url: config?.url,
        method: config?.method
      };
      
      // 可以在这里添加错误上报逻辑
      // this.reportError(errorInfo);
    });
  }

  /**
   * 错误上报（可扩展）
   * @param {Object} errorInfo - 错误信息
   */
  reportError(errorInfo) {
    // 这里可以集成错误监控服务，如Sentry、Bugsnag等
    // 错误上报
  }
}

// 创建默认拦截器实例
const apiInterceptor = new ApiInterceptor();
apiInterceptor.createDefaultInterceptors();

export default apiInterceptor;
