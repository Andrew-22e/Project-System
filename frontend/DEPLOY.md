# 后台管理系统部署指南

## 服务器信息
- **服务器地址**: 192.140.160.119
- **SSH端口**: 13621
- **用户名**: root
- **密码**: ifcqTXOR1880
- **部署端口**: 8082
- **部署路径**: /opt/live-admin

## 部署步骤

### 方法一：自动部署（推荐，需要配置SSH免密登录）

1. **配置SSH免密登录**（如果未配置）:
   ```bash
   ssh-copy-id -p 13621 root@192.140.160.119
   ```

2. **执行部署脚本**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 方法二：手动部署

1. **在本地打包项目**:
   ```bash
   tar --exclude='node_modules' \
       --exclude='.git' \
       --exclude='unpackage' \
       --exclude='data.backup.disabled' \
       --exclude='logs' \
       -czf deploy.tar.gz \
       server.js package.json package-lock.json \
       config/ admin/ static/ ecosystem.config.js
   ```

2. **上传到服务器**:
   ```bash
   scp -P 13621 deploy.tar.gz root@192.140.160.119:/tmp/
   ```

3. **连接到服务器**:
   ```bash
   ssh -p 13621 root@192.140.160.119
   ```

4. **在服务器上执行**:
   ```bash
   # 创建部署目录
   mkdir -p /opt/live-admin
   cd /opt/live-admin
   
   # 解压文件
   tar -xzf /tmp/deploy.tar.gz
   
   # 安装依赖
   npm install --production
   
   # 创建日志目录
   mkdir -p logs
   
   # 启动服务（如果已安装PM2）
   pm2 start ecosystem.config.js
   
   # 保存PM2配置
   pm2 save
   
   # 设置PM2开机自启
   pm2 startup
   ```

## 服务器环境准备

### 1. 安装Node.js
```bash
# 使用nvm安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 2. 安装PM2
```bash
npm install -g pm2
```

### 3. 配置防火墙
```bash
# CentOS/RHEL
firewall-cmd --permanent --add-port=8082/tcp
firewall-cmd --reload

# Ubuntu/Debian
ufw allow 8082/tcp
ufw reload
```

## PM2 常用命令

```bash
# 启动服务
pm2 start ecosystem.config.js

# 停止服务
pm2 stop live-admin-server

# 重启服务
pm2 restart live-admin-server

# 查看状态
pm2 list

# 查看日志
pm2 logs live-admin-server

# 查看详细信息
pm2 show live-admin-server

# 监控
pm2 monit

# 删除应用
pm2 delete live-admin-server
```

## 配置说明

### 端口配置
- 默认端口: 8082
- 可通过环境变量修改: `PORT=8082 pm2 start ecosystem.config.js`
- 或在 `ecosystem.config.js` 中修改

### 后端服务器地址
- 当前配置: `http://192.140.160.119:8000`
- 配置文件: `config/server-mode.node.js`

## 访问地址

部署完成后，访问以下地址：
- **后台管理**: http://192.140.160.119:8082/admin
- **API接口**: http://192.140.160.119:8082/api

## 故障排查

### 1. 服务无法启动
```bash
# 查看PM2日志
pm2 logs live-admin-server --lines 100

# 检查端口占用
netstat -tlnp | grep 8082

# 检查Node.js版本
node -v
```

### 2. 无法访问
```bash
# 检查防火墙
firewall-cmd --list-ports  # CentOS
ufw status                  # Ubuntu

# 检查服务状态
pm2 status
```

### 3. 查看详细错误
```bash
# 查看错误日志
tail -f logs/pm2-error.log

# 查看输出日志
tail -f logs/pm2-out.log
```

## 更新部署

```bash
# 1. 在本地重新打包
./deploy.sh

# 2. 在服务器上执行
cd /opt/live-admin
pm2 stop live-admin-server
tar -xzf /tmp/deploy.tar.gz
npm install --production
pm2 restart live-admin-server
```

## 注意事项

1. **确保后端服务器可访问**: 系统会代理请求到 `http://192.140.160.119:8000`
2. **数据目录**: 本地mock数据已禁用，所有数据来自真实服务器
3. **日志文件**: 日志保存在 `logs/` 目录
4. **内存限制**: PM2配置了500M内存限制，超出会自动重启

