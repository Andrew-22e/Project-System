#!/bin/bash

# 部署脚本 - 将后台管理系统部署到服务器
# 使用方法: ./deploy.sh

echo "=========================================="
echo "🚀 开始部署后台管理系统"
echo "=========================================="

# 服务器信息
SERVER_HOST="192.140.160.119"
SERVER_SSH_PORT="13621"  # SSH连接端口
SERVER_HTTP_PORT="8083"  # HTTP服务端口（使用空闲端口）
SERVER_USER="root"
SERVER_PASS="ifcqTXOR1880"
DEPLOY_PATH="/opt/live-admin"

# 本地项目路径
LOCAL_PATH=$(pwd)

echo "📦 准备部署文件..."

# 创建部署包（排除不需要的文件）
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='unpackage' \
    --exclude='data.backup.disabled' \
    --exclude='logs' \
    --exclude='*.log' \
    -czf deploy.tar.gz \
    server.js \
    package.json \
    package-lock.json \
    config/ \
    admin/ \
    static/ \
    ecosystem.config.js \
    deploy.sh \
    README.md 2>/dev/null || true

echo "✅ 部署包已创建: deploy.tar.gz"

echo ""
echo "📤 上传文件到服务器..."
echo "请手动执行以下命令："
echo ""
echo "1. 上传文件:"
echo "   scp -P ${SERVER_SSH_PORT} deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/"
echo ""
echo "2. 连接到服务器:"
echo "   ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST}"
echo ""
echo "3. 在服务器上执行以下命令:"
echo "   cd /opt"
echo "   mkdir -p live-admin"
echo "   cd live-admin"
echo "   tar -xzf /tmp/deploy.tar.gz"
echo "   npm install --production"
echo "   mkdir -p logs"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "或者使用自动部署（需要配置SSH免密登录）:"
echo ""

# 检查是否配置了SSH免密登录
if ssh -p ${SERVER_SSH_PORT} -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} exit 2>/dev/null; then
    echo "✅ 检测到SSH免密登录已配置，开始自动部署..."
    
    # 在服务器上创建目录
    ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${DEPLOY_PATH} && mkdir -p ${DEPLOY_PATH}/logs"
    
    # 上传文件
    scp -P ${SERVER_SSH_PORT} deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
    
    # 解压并部署
    ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
        cd ${DEPLOY_PATH}
        tar -xzf /tmp/deploy.tar.gz
        npm install --production
        pm2 stop live-admin-server 2>/dev/null || true
        pm2 delete live-admin-server 2>/dev/null || true
        pm2 start ecosystem.config.js
        pm2 save
        echo "✅ 部署完成！"
        echo "访问地址: http://${SERVER_HOST}:${SERVER_HTTP_PORT}/admin"
EOF
    
    echo ""
    echo "✅ 自动部署完成！"
    echo "访问地址: http://${SERVER_HOST}:${SERVER_HTTP_PORT}/admin"
else
    echo "⚠️  未配置SSH免密登录，请手动执行上述命令"
fi

echo ""
echo "=========================================="
echo "📋 部署后检查清单:"
echo "=========================================="
echo "1. 检查PM2进程: pm2 list"
echo "2. 查看日志: pm2 logs live-admin-server"
echo "3. 检查端口: netstat -tlnp | grep 8083"
echo "4. 测试访问: curl http://localhost:8083/admin"
echo "5. 防火墙配置: 确保端口8083已开放"
echo "=========================================="

