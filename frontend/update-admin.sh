#!/bin/bash

# 更新后台管理系统脚本
# 使用方法: ./update-admin.sh

echo "=========================================="
echo "🔄 更新后台管理系统文件"
echo "=========================================="

# 服务器信息
SERVER_HOST="192.140.160.119"
SERVER_SSH_PORT="13621"
SERVER_USER="root"
SERVER_PASS="ifcqTXOR1880"
DEPLOY_PATH="/opt/live-admin"

# 本地项目路径
LOCAL_PATH=$(pwd)

echo "📦 准备更新文件..."

# 创建临时目录存放要更新的文件
TEMP_DIR=$(mktemp -d)
echo "临时目录: $TEMP_DIR"

# 复制需要更新的文件
echo "📋 复制文件..."
cp admin/admin.js "$TEMP_DIR/"
cp admin/index.html "$TEMP_DIR/"

# 创建更新包
cd "$TEMP_DIR"
tar -czf update-admin.tar.gz admin.js index.html
cd "$LOCAL_PATH"

echo "✅ 更新包已创建"

echo ""
echo "📤 上传文件到服务器..."

# 使用 sshpass 自动输入密码（如果已安装）
if command -v sshpass &> /dev/null; then
    echo "使用 sshpass 自动上传..."
    sshpass -p "$SERVER_PASS" scp -P "$SERVER_SSH_PORT" -o StrictHostKeyChecking=no "$TEMP_DIR/update-admin.tar.gz" "$SERVER_USER@$SERVER_HOST:/tmp/"
    
    echo "📥 在服务器上解压并更新文件..."
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_SSH_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" << EOF
        cd $DEPLOY_PATH
        if [ -d "admin" ]; then
            echo "备份旧文件..."
            mkdir -p admin/backup
            cp admin/admin.js admin/backup/admin.js.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
            cp admin/index.html admin/backup/index.html.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
            
            echo "解压新文件..."
            tar -xzf /tmp/update-admin.tar.gz -C admin/
            
            echo "设置文件权限..."
            chmod 644 admin/admin.js admin/index.html
            
            echo "✅ 文件更新完成！"
            echo "📋 更新文件列表:"
            ls -lh admin/admin.js admin/index.html
        else
            echo "❌ 错误: admin 目录不存在"
            echo "请先运行完整部署脚本"
        fi
EOF
else
    echo "⚠️  sshpass 未安装，请手动执行以下命令："
    echo ""
    echo "1. 上传文件:"
    echo "   scp -P $SERVER_SSH_PORT $TEMP_DIR/update-admin.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/"
    echo ""
    echo "2. 连接到服务器:"
    echo "   ssh -p $SERVER_SSH_PORT $SERVER_USER@$SERVER_HOST"
    echo ""
    echo "3. 在服务器上执行:"
    echo "   cd $DEPLOY_PATH"
    echo "   tar -xzf /tmp/update-admin.tar.gz -C admin/"
    echo "   chmod 644 admin/admin.js admin/index.html"
    echo ""
    echo "或者安装 sshpass:"
    echo "   # macOS: brew install sshpass"
    echo "   # Ubuntu/Debian: sudo apt-get install sshpass"
fi

# 清理临时文件
echo ""
echo "🧹 清理临时文件..."
rm -rf "$TEMP_DIR"

echo ""
echo "=========================================="
echo "✅ 更新完成！"
echo "=========================================="
echo ""
echo "📋 后续步骤:"
echo "1. 刷新后台管理页面（Ctrl+Shift+R 强制刷新）"
echo "2. 检查浏览器控制台，确认 WebSocket 连接到新地址"
echo "3. 如果使用 PM2，可能需要重启服务:"
echo "   ssh -p $SERVER_SSH_PORT $SERVER_USER@$SERVER_HOST 'cd $DEPLOY_PATH && pm2 restart live-admin-server'"

