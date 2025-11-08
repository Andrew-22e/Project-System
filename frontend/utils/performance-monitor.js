// 性能监控工具
// 用于监控和优化小程序性能

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      renderTimes: [],
      memoryUsage: [],
      userInteractions: []
    };
    
    this.isEnabled = true;
    this.samplingRate = 1.0;
  }
  
  // 记录API调用性能
  recordAPICall(url, method, startTime, endTime, success = true) {
    if (!this.isEnabled) return;
    
    const duration = endTime - startTime;
    const metric = {
      url,
      method,
      duration,
      success,
      timestamp: Date.now()
    };
    
    this.metrics.apiCalls.push(metric);
    
    // 保持最近100条记录
    if (this.metrics.apiCalls.length > 100) {
      this.metrics.apiCalls.shift();
    }
    
    // 在开发环境输出性能信息
    if (process.env.NODE_ENV === 'development') {
      // API性能监控
    }
  }
  
  // 记录渲染性能
  recordRenderTime(component, startTime, endTime) {
    if (!this.isEnabled) return;
    
    const duration = endTime - startTime;
    const metric = {
      component,
      duration,
      timestamp: Date.now()
    };
    
    this.metrics.renderTimes.push(metric);
    
    // 保持最近50条记录
    if (this.metrics.renderTimes.length > 50) {
      this.metrics.renderTimes.shift();
    }
  }
  
  // 记录用户交互
  recordUserInteraction(type, target, timestamp = Date.now()) {
    if (!this.isEnabled) return;
    
    const metric = {
      type,
      target,
      timestamp
    };
    
    this.metrics.userInteractions.push(metric);
    
    // 保持最近200条记录
    if (this.metrics.userInteractions.length > 200) {
      this.metrics.userInteractions.shift();
    }
  }
  
  // 获取性能统计
  getStats() {
    const apiStats = this.calculateAPIStats();
    const renderStats = this.calculateRenderStats();
    const interactionStats = this.calculateInteractionStats();
    
    return {
      api: apiStats,
      render: renderStats,
      interactions: interactionStats,
      timestamp: Date.now()
    };
  }
  
  // 计算API性能统计
  calculateAPIStats() {
    const calls = this.metrics.apiCalls;
    if (calls.length === 0) {
      return { count: 0, avgDuration: 0, successRate: 0 };
    }
    
    const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
    const successCount = calls.filter(call => call.success).length;
    
    return {
      count: calls.length,
      avgDuration: Math.round(totalDuration / calls.length),
      successRate: Math.round((successCount / calls.length) * 100),
      slowestCall: Math.max(...calls.map(call => call.duration)),
      fastestCall: Math.min(...calls.map(call => call.duration))
    };
  }
  
  // 计算渲染性能统计
  calculateRenderStats() {
    const renders = this.metrics.renderTimes;
    if (renders.length === 0) {
      return { count: 0, avgDuration: 0 };
    }
    
    const totalDuration = renders.reduce((sum, render) => sum + render.duration, 0);
    
    return {
      count: renders.length,
      avgDuration: Math.round(totalDuration / renders.length),
      slowestRender: Math.max(...renders.map(render => render.duration)),
      fastestRender: Math.min(...renders.map(render => render.duration))
    };
  }
  
  // 计算交互统计
  calculateInteractionStats() {
    const interactions = this.metrics.userInteractions;
    if (interactions.length === 0) {
      return { count: 0, types: {} };
    }
    
    const types = {};
    interactions.forEach(interaction => {
      types[interaction.type] = (types[interaction.type] || 0) + 1;
    });
    
    return {
      count: interactions.length,
      types
    };
  }
  
  // 获取性能报告
  getPerformanceReport() {
    const stats = this.getStats();
    const report = {
      summary: {
        totalAPICalls: stats.api.count,
        avgAPIResponseTime: stats.api.avgDuration,
        apiSuccessRate: stats.api.successRate,
        totalRenders: stats.render.count,
        avgRenderTime: stats.render.avgDuration,
        totalInteractions: stats.interactions.count
      },
      details: stats,
      recommendations: this.generateRecommendations(stats)
    };
    
    return report;
  }
  
  // 生成性能优化建议
  generateRecommendations(stats) {
    const recommendations = [];
    
    // API性能建议
    if (stats.api.avgDuration > 1000) {
      recommendations.push('API响应时间较慢，建议优化后端接口或增加缓存');
    }
    
    if (stats.api.successRate < 95) {
      recommendations.push('API成功率较低，建议检查网络连接和错误处理');
    }
    
    // 渲染性能建议
    if (stats.render.avgDuration > 16) {
      recommendations.push('渲染时间超过16ms，建议优化DOM操作和CSS动画');
    }
    
    // 交互性能建议
    if (stats.interactions.count > 100) {
      recommendations.push('用户交互频繁，建议添加防抖和节流机制');
    }
    
    return recommendations;
  }
  
  // 清除所有数据
  clear() {
    this.metrics = {
      apiCalls: [],
      renderTimes: [],
      memoryUsage: [],
      userInteractions: []
    };
  }
  
  // 启用/禁用监控
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
  
  // 设置采样率
  setSamplingRate(rate) {
    this.samplingRate = Math.max(0, Math.min(1, rate));
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

// 导出工具函数
export const recordAPICall = (url, method, startTime, endTime, success) => {
  performanceMonitor.recordAPICall(url, method, startTime, endTime, success);
};

export const recordRenderTime = (component, startTime, endTime) => {
  performanceMonitor.recordRenderTime(component, startTime, endTime);
};

export const recordUserInteraction = (type, target, timestamp) => {
  performanceMonitor.recordUserInteraction(type, target, timestamp);
};

export const getPerformanceStats = () => {
  return performanceMonitor.getStats();
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};

export const clearPerformanceData = () => {
  performanceMonitor.clear();
};

export default performanceMonitor;
