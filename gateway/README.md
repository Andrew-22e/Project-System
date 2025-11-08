# 直播辩论系统 - 中间层网关服务

本项目是直播辩论系统的中间层网关服务，使用 Node.js + Express 实现，替代了之前的 Nginx 反向代理方案。

## 📋 项目概述

### 架构说明

```
客户端 (小程序/后台管理系统)
    ↓
中间层网关 (gateway.js, 监听 8080 端口)
    ├── /api/* → API 路由处理
    ├── /admin → 后台管理页面和静态资源
    └── /ws → WebSocket 实时通信
```

### 端口配置

- **网关监听端口**: `8080` (直接访问，不使用 Nginx)
- **监听地址**: `0.0.0.0` (所有网络接口)

## 🚀 快速开始

> **注意**: 此网关服务需要与主项目配合使用。请确保主项目中的 `admin/` 目录和 `data/` 目录与此网关在同一目录下。

### 1. 安装依赖

```bash
npm install
```

### 2. 配置服务器

编辑 `config/server-mode.node.js`，修改以下配置：

```javascript
const REAL_SERVER_URL = 'http://192.168.31.249:8080'; // 修改为你的服务器 IP
const REAL_SERVER_PORT = 8080; // 网关监听端口
```

### 3. 目录结构要求

确保以下目录结构存在（与主项目共享）：

```
live-gateway/
├── gateway.js          # 网关服务
├── config/             # 配置文件
└── (需要与主项目共享)
    ├── admin/          # 后台管理模块
    │   ├── db.js       # 数据库操作
    │   └── ...
    └── data/           # 数据文件
        ├── streams.json
        ├── users.json
        └── ...
```

### 4. 启动网关服务

**开发模式（自动重启）：**
```bash
npm run dev
```

**生产模式：**
```bash
npm start
```

### 4. 验证服务

访问以下地址验证服务是否正常：

- **API 测试**: `http://localhost:8080/api/admin/dashboard`
- **后台管理**: `http://localhost:8080/admin`
- **健康检查**: `http://localhost:8080/health` (如果已配置)

## 🔧 配置说明

### 主要功能模块

1. **API 路由处理** (`/api/*`)
   - 所有 API 请求由中间层直接处理
   - 支持 CORS 跨域请求
   - 统一错误处理和日志记录

2. **后台管理系统** (`/admin`)
   - 提供后台管理页面
   - 静态资源服务

3. **WebSocket 实时通信** (`/ws`)
   - 支持实时数据推送
   - 直播状态更新
   - 投票数据同步
   - AI 内容推送

### 配置文件

- `gateway.js` - 主网关服务文件
- `config/server-mode.node.js` - 服务器配置（端口、地址等）

## 📊 功能特性

### ✅ 已实现功能

- ✅ API 路由处理
- ✅ WebSocket 实时通信
- ✅ CORS 跨域支持
- ✅ 后台管理系统服务
- ✅ 直播流管理
- ✅ 投票系统
- ✅ AI 内容管理
- ✅ 用户管理
- ✅ 统计数据查询

### 🔌 WebSocket 消息类型

- `liveStatus` - 直播状态更新
- `votes-updated` - 投票数据更新
- `aiStatus` - AI 识别状态
- `newAIContent` - 新 AI 内容
- `debate-updated` - 辩题更新
- `connected` - 连接成功

## 🐛 常见问题

### 1. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::8080`

**解决**:
```bash
# 查看端口占用
lsof -i :8080

# 停止占用端口的进程
kill -9 <PID>

# 或修改配置文件中的端口号
```

### 2. WebSocket 连接失败

**原因**: 防火墙阻止或网络问题

**解决**:
- 检查防火墙设置
- 确认服务器 IP 地址正确
- 检查 WebSocket 路径 `/ws` 是否正确

### 3. 依赖安装失败

**解决**:
```bash
# 清除缓存后重新安装
rm -rf node_modules package-lock.json
npm install
```

### 4. 服务无法访问

**检查清单**:
- ✅ 服务是否已启动 (`npm start`)
- ✅ 端口是否正确（默认 8080）
- ✅ 防火墙是否开放端口
- ✅ 网络连接是否正常

## 🔒 安全建议

1. **生产环境配置**:
   - 使用环境变量管理敏感配置
   - 配置 HTTPS（如需）
   - 添加请求频率限制

2. **日志管理**:
   - 配置日志轮转
   - 定期清理日志文件

3. **监控**:
   - 添加服务健康检查
   - 监控服务运行状态

## 📚 相关文档

- [Express 官方文档](https://expressjs.com/)
- [WebSocket (ws) 文档](https://github.com/websockets/ws)
- [CORS 配置](https://expressjs.com/en/resources/middleware/cors.html)

## 📝 版本历史

- **v2.0.0** (2025-11-04)
  - 从 Nginx 反向代理迁移到 Node.js 中间层
  - 移除 Nginx 依赖
  - 统一网关配置
  - 优化 WebSocket 支持

- **v1.0.0** (2025-11-04)
  - 初始版本（Nginx 配置）
  - 支持 WebSocket 代理
  - 支持 API 和后台管理系统代理

## 📄 许可证

MIT License

## 👤 作者

直播辩论系统开发团队
