#!/bin/bash

# 服务器环境设置脚本
# 在服务器上首次部署时执行此脚本

echo "=========================================="
echo "🔧 服务器环境设置"
echo "=========================================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "📦 安装Node.js..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
    nvm alias default 18
else
    echo "✅ Node.js已安装: $(node -v)"
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    npm install -g pm2
else
    echo "✅ PM2已安装: $(pm2 -v)"
fi

# 检查防火墙
echo "🔥 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL
    firewall-cmd --permanent --add-port=8082/tcp
    firewall-cmd --reload
    echo "✅ 防火墙已配置 (CentOS/RHEL)"
elif command -v ufw &> /dev/null; then
    # Ubuntu/Debian
    ufw allow 8082/tcp
    ufw reload
    echo "✅ 防火墙已配置 (Ubuntu/Debian)"
else
    echo "⚠️  未检测到防火墙工具，请手动开放端口8082"
fi

# 创建日志目录
mkdir -p logs
echo "✅ 日志目录已创建"

echo ""
echo "=========================================="
echo "✅ 环境设置完成！"
echo "=========================================="
echo "下一步："
echo "1. cd /opt/live-admin"
echo "2. npm install --production"
echo "3. pm2 start ecosystem.config.js"
echo "4. pm2 save"
echo "=========================================="

