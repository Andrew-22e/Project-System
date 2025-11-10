// config/server-mode.node.js (Node.js后端专用)
const USE_MOCK_SERVER = false; // 改为 false 使用真实服务器
const LOCAL_SERVER_URL = 'http://localhost:8080';
// 部署服务器配置：使用环境变量或默认端口
// 改为8081避免与网关(8080)冲突
const DEPLOY_PORT = process.env.PORT || 8081; // 部署端口，改为8081以避免与网关冲突
const REAL_SERVER_URL = `http://localhost:${DEPLOY_PORT}`; // 本地服务器地址
const REAL_SERVER_PORT = DEPLOY_PORT; // 部署服务器端口
// 后端服务器配置（在三层架构中，指向网关地址）
const BACKEND_SERVER_URL = process.env.GATEWAY_URL || 'http://localhost:8080'; // 网关服务器地址，所有API请求通过网关转发
// 是否优先使用后端服务器
// 在三层架构中，我们将API请求直接代理到网关，所以设为true
const PRIORITIZE_BACKEND_SERVER = true; // 设为 true，API请求直接代理到网关服务器

// 添加调试日志
console.log('📋 frontend/config/server-mode.node.js 配置已加载:');
console.log(`   - USE_MOCK_SERVER: ${USE_MOCK_SERVER}`);
console.log(`   - LOCAL_SERVER_URL: ${LOCAL_SERVER_URL}`);
console.log(`   - DEPLOY_PORT: ${DEPLOY_PORT}`);
console.log(`   - REAL_SERVER_URL: ${REAL_SERVER_URL}`);
console.log(`   - BACKEND_SERVER_URL: ${BACKEND_SERVER_URL} (网关地址)`);
console.log(`   - PRIORITIZE_BACKEND_SERVER: ${PRIORITIZE_BACKEND_SERVER}`);

// 添加调试日志
console.log('📋 frontend/config/server-mode.node.js 配置已加载:');
console.log(`   - USE_MOCK_SERVER: ${USE_MOCK_SERVER}`);
console.log(`   - LOCAL_SERVER_URL: ${LOCAL_SERVER_URL}`);
console.log(`   - DEPLOY_PORT: ${DEPLOY_PORT}`);
console.log(`   - REAL_SERVER_URL: ${REAL_SERVER_URL}`);
console.log(`   - BACKEND_SERVER_URL: ${BACKEND_SERVER_URL} (网关地址)`);
console.log(`   - PRIORITIZE_BACKEND_SERVER: ${PRIORITIZE_BACKEND_SERVER}`);
const REAL_WECHAT_CONFIG = {
    appid: 'wx94289b0d2ca7a802',
    secret: '10409c1193a326a7b328f675b1776195'
};
const getLocalIP = () => '192.168.31.189';
const MOCK_SERVER_CONFIG = {
    host: getLocalIP(),
    port: 8080,
    url: `http://${getLocalIP()}:8080`
};
const getCurrentServerConfig = () => {
    if (USE_MOCK_SERVER) {
        return {
            mode: 'mock',
            url: MOCK_SERVER_CONFIG.url,
            host: MOCK_SERVER_CONFIG.host,
            port: MOCK_SERVER_CONFIG.port,
            wechat: {
                useMock: true,
                appid: 'wx94289b0d2ca7a802',
                secret: '10409c1193a326a7b328f675b1776195'
            }
        };
    } else {
        // 使用真实服务器，部署模式
        return {
            mode: 'real',
            url: REAL_SERVER_URL,
            port: DEPLOY_PORT,  // 使用部署端口（8082）
            wechat: {
                useMock: false,
                appid: REAL_WECHAT_CONFIG.appid,
                secret: REAL_WECHAT_CONFIG.secret
            }
        };
    }
};
const printConfig = () => {
    const config = getCurrentServerConfig();
    console.log('═══════════════════════════════════════');
    console.log('📋 服务器配置信息');
    console.log('═══════════════════════════════════════');
    console.log(`模式: ${config.mode === 'mock' ? '🧪 模拟服务器' : '🌐 真实服务器'}`);
    console.log(`地址: ${config.url}`);
    if (config.mode === 'mock') {
        console.log(`本地访问: http://localhost:${config.port}`);
        console.log(`局域网访问: ${config.url}`);
    }
    console.log(`微信登录: ${config.wechat.useMock ? '模拟模式' : '真实模式'}`);
    if (!config.wechat.useMock) {
        console.log(`微信 AppID: ${config.wechat.appid}`);
        console.log(`微信 Secret: ${config.wechat.secret ? config.wechat.secret.substring(0, 8) + '...' : '未设置'}`);
    }
    console.log('═══════════════════════════════════════');
};
module.exports = {
	USE_MOCK_SERVER,
	MOCK_SERVER_CONFIG,
	REAL_SERVER_URL,
	REAL_SERVER_PORT,
	REAL_WECHAT_CONFIG,
	BACKEND_SERVER_URL,
	PRIORITIZE_BACKEND_SERVER,
	getCurrentServerConfig,
	printConfig,
	LOCAL_SERVER_URL,
};
