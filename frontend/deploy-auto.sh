#!/bin/bash

# 自动部署脚本 - 将后台管理系统部署到服务器
# 使用方法: ./deploy-auto.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 开始自动部署后台管理系统"
echo "=========================================="

# 服务器信息
SERVER_HOST="192.140.160.119"
SERVER_SSH_PORT="13621"
SERVER_HTTP_PORT="8083"
SERVER_USER="root"
SERVER_PASS="ifcqTXOR1880"
DEPLOY_PATH="/opt/live-admin"

# 检查必要工具
echo "🔍 检查必要工具..."
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass 未安装，正在安装..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then
            echo "❌ 请先安装 Homebrew: https://brew.sh"
            exit 1
        fi
        brew install hudochenkov/sshpass/sshpass
    else
        echo "请手动安装 sshpass: sudo apt-get install sshpass 或 sudo yum install sshpass"
        exit 1
    fi
fi

echo "✅ 工具检查完成"

# 创建部署包
echo ""
echo "📦 准备部署文件..."
rm -f deploy.tar.gz

tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='unpackage' \
    --exclude='data.backup.disabled' \
    --exclude='logs' \
    --exclude='*.log' \
    --exclude='deploy.tar.gz' \
    --exclude='.DS_Store' \
    -czf deploy.tar.gz \
    server.js \
    package.json \
    package-lock.json \
    config/ \
    admin/ \
    static/ \
    ecosystem.config.js \
    deploy.sh \
    deploy-auto.sh \
    README.md 2>/dev/null || true

if [ ! -f deploy.tar.gz ]; then
    echo "❌ 创建部署包失败"
    exit 1
fi

echo "✅ 部署包已创建: deploy.tar.gz ($(du -h deploy.tar.gz | cut -f1))"

# 上传文件
echo ""
echo "📤 上传文件到服务器..."
export SSHPASS="${SERVER_PASS}"
sshpass -e scp -o StrictHostKeyChecking=no -P ${SERVER_SSH_PORT} deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败"
    exit 1
fi

echo "✅ 文件上传成功"

# 在服务器上执行部署
echo ""
echo "🔧 在服务器上执行部署..."
sshpass -e ssh -o StrictHostKeyChecking=no -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    
    echo "📁 创建部署目录..."
    mkdir -p ${DEPLOY_PATH}
    mkdir -p ${DEPLOY_PATH}/logs
    
    echo "📦 解压部署包..."
    cd ${DEPLOY_PATH}
    tar -xzf /tmp/deploy.tar.gz
    rm -f /tmp/deploy.tar.gz
    
    echo "📥 安装依赖..."
    if command -v npm &> /dev/null; then
        npm install --production
    else
        echo "⚠️  npm 未安装，请先安装 Node.js"
        exit 1
    fi
    
    echo "🔄 停止旧进程（如果存在）..."
    pm2 stop live-admin-server 2>/dev/null || true
    pm2 delete live-admin-server 2>/dev/null || true
    
    echo "🚀 启动 PM2 服务..."
    pm2 start ecosystem.config.js
    
    echo "💾 保存 PM2 配置..."
    pm2 save
    
    echo "✅ 部署完成！"
    echo ""
    echo "📋 服务信息:"
    echo "   - 访问地址: http://${SERVER_HOST}:${SERVER_HTTP_PORT}/admin"
    echo "   - 本地访问: http://localhost:${SERVER_HTTP_PORT}/admin"
    echo ""
    echo "📊 PM2 状态:"
    pm2 list | grep live-admin-server || echo "   未找到进程"
    echo ""
    echo "📝 查看日志: pm2 logs live-admin-server"
    echo "🔄 重启服务: pm2 restart live-admin-server"
    echo "⏹️  停止服务: pm2 stop live-admin-server"
EOF

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 部署成功完成！"
echo "=========================================="
echo "访问地址: http://${SERVER_HOST}:${SERVER_HTTP_PORT}/admin"
echo ""
echo "📋 后续操作:"
echo "1. 检查服务状态: ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} 'pm2 list'"
echo "2. 查看日志: ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} 'pm2 logs live-admin-server'"
echo "3. 检查端口: ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} 'netstat -tlnp | grep ${SERVER_HTTP_PORT}'"
echo "4. 防火墙配置: 确保端口 ${SERVER_HTTP_PORT} 已开放"
echo "=========================================="

