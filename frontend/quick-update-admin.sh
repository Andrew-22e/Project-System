#!/bin/bash

# 快速更新后台管理系统 - 直接使用密码连接
# 使用方法: ./quick-update-admin.sh

SERVER_HOST="192.140.160.119"
SERVER_SSH_PORT="13621"
SERVER_USER="root"
SERVER_PASS="ifcqTXOR1880"
DEPLOY_PATH="/opt/live-admin"

echo "🔄 开始更新后台管理系统文件..."

# 方法1: 使用 sshpass（如果已安装）
if command -v sshpass &> /dev/null; then
    echo "✅ 使用 sshpass 自动上传..."
    
    # 上传文件
    sshpass -p "$SERVER_PASS" scp -P "$SERVER_SSH_PORT" -o StrictHostKeyChecking=no admin/admin.js admin/index.html "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/admin/" 2>&1
    
    echo "✅ 文件上传完成！"
    echo ""
    echo "📋 在服务器上验证文件..."
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_SSH_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "cd $DEPLOY_PATH/admin && ls -lh admin.js index.html && echo '' && echo '✅ 文件已更新！'"
    
# 方法2: 使用 expect（如果已安装）
elif command -v expect &> /dev/null; then
    echo "✅ 使用 expect 自动上传..."
    
    expect << EOF
spawn scp -P $SERVER_SSH_PORT admin/admin.js admin/index.html $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/admin/
expect "password:"
send "$SERVER_PASS\r"
expect eof
EOF
    
    echo "✅ 文件上传完成！"
    
# 方法3: 手动命令
else
    echo "⚠️  未找到 sshpass 或 expect，请手动执行以下命令："
    echo ""
    echo "1. 上传文件（会提示输入密码: $SERVER_PASS）:"
    echo "   scp -P $SERVER_SSH_PORT admin/admin.js admin/index.html $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/admin/"
    echo ""
    echo "2. 或者安装 sshpass 后重新运行此脚本:"
    echo "   # macOS: brew install sshpass"
    echo "   # Ubuntu/Debian: sudo apt-get install sshpass"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 更新完成！"
echo "=========================================="
echo ""
echo "📋 下一步:"
echo "1. 访问后台管理页面: http://$SERVER_HOST:8083/admin"
echo "2. 强制刷新浏览器 (Ctrl+Shift+R 或 Cmd+Shift+R)"
echo "3. 检查控制台，应该看到: ws://192.140.160.119:8000/ws"

