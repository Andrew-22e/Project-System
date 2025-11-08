#!/bin/bash

# 上传 server.js 文件到服务器
# 使用方法: ./upload-server.sh

echo "=========================================="
echo "📤 上传 server.js 到服务器"
echo "=========================================="

# 服务器信息
SERVER_HOST="192.140.160.119"
SERVER_SSH_PORT="13621"
SERVER_USER="root"
SERVER_PASS="ifcqTXOR1880"

# 检查文件是否存在
if [ ! -f "server.js" ]; then
    echo "❌ 错误: server.js 文件不存在"
    exit 1
fi

echo "✅ 找到文件: server.js"
echo "📊 文件大小: $(du -h server.js | cut -f1)"

# 检查是否安装了 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass 未安装，请手动执行以下命令："
    echo ""
    echo "1. 上传文件:"
    echo "   scp -P ${SERVER_SSH_PORT} server.js ${SERVER_USER}@${SERVER_HOST}:/tmp/server.js"
    echo ""
    echo "2. 连接到服务器:"
    echo "   ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST}"
    echo ""
    echo "3. 在服务器上执行（根据实际部署路径选择）:"
    echo "   # 如果服务器路径是 /opt/live-admin:"
    echo "   cp /tmp/server.js /opt/live-admin/server.js"
    echo "   # 或者如果路径是 /opt/live-debate-h5:"
    echo "   cp /tmp/server.js /opt/live-debate-h5/server.js"
    echo "   # 然后重启服务:"
    echo "   pm2 restart live-admin-server"
    echo ""
    echo "或者安装 sshpass:"
    echo "   # macOS: brew install hudochenkov/sshpass/sshpass"
    echo "   # Ubuntu/Debian: sudo apt-get install sshpass"
    exit 1
fi

echo ""
echo "📤 上传文件到服务器..."

# 上传文件
export SSHPASS="${SERVER_PASS}"
sshpass -e scp -o StrictHostKeyChecking=no -P ${SERVER_SSH_PORT} server.js ${SERVER_USER}@${SERVER_HOST}:/tmp/server.js

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败"
    exit 1
fi

echo "✅ 文件上传成功"

# 尝试多个可能的部署路径
echo ""
echo "🔍 查找服务器上的部署路径..."

# 可能的部署路径列表
POSSIBLE_PATHS=(
    "/opt/live-admin"
    "/opt/live-debate-h5"
    "/opt/live"
    "/var/www/live"
    "/home/www/live"
    "/root/live"
)

# 在服务器上查找并更新文件
sshpass -e ssh -o StrictHostKeyChecking=no -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    echo "📋 查找 server.js 文件位置..."
    
    FOUND_PATH=""
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -f "\$path/server.js" ]; then
            echo "✅ 找到文件: \$path/server.js"
            FOUND_PATH="\$path"
            break
        fi
    done
    
    if [ -z "\$FOUND_PATH" ]; then
        echo "⚠️  未找到标准部署路径，尝试手动查找..."
        # 尝试查找 server.js 文件
        SEARCH_RESULT=\$(find /opt /var/www /home/www /root -name "server.js" -type f 2>/dev/null | grep -v node_modules | head -1)
        if [ -n "\$SEARCH_RESULT" ]; then
            FOUND_PATH=\$(dirname "\$SEARCH_RESULT")
            echo "✅ 找到文件位置: \$FOUND_PATH"
        fi
    fi
    
    if [ -n "\$FOUND_PATH" ]; then
        echo ""
        echo "📦 备份原文件..."
        if [ -f "\$FOUND_PATH/server.js" ]; then
            cp "\$FOUND_PATH/server.js" "\$FOUND_PATH/server.js.backup.\$(date +%Y%m%d_%H%M%S)"
            echo "✅ 原文件已备份到: \$FOUND_PATH/server.js.backup.*"
        fi
        
        echo ""
        echo "📥 更新文件..."
        cp /tmp/server.js "\$FOUND_PATH/server.js"
        chmod 644 "\$FOUND_PATH/server.js"
        
        echo ""
        echo "✅ 文件更新成功！"
        echo "📋 文件路径: \$FOUND_PATH/server.js"
        echo "📊 文件信息:"
        ls -lh "\$FOUND_PATH/server.js"
        
        echo ""
        echo "🔄 检查 PM2 服务..."
        # 尝试重启 PM2 服务
        if command -v pm2 &> /dev/null; then
            # 查找可能的 PM2 应用名称
            PM2_APPS=\$(pm2 list | grep -E "live|admin|server" | awk '{print \$2}' | head -1)
            if [ -n "\$PM2_APPS" ]; then
                echo "📋 找到 PM2 应用: \$PM2_APPS"
                echo "🔄 重启 PM2 服务..."
                pm2 restart \$PM2_APPS
                echo "✅ PM2 服务已重启"
                echo ""
                echo "📊 PM2 状态:"
                pm2 list | grep \$PM2_APPS
            else
                echo "⚠️  未找到相关的 PM2 应用，请手动重启服务"
            fi
        else
            echo "⚠️  PM2 未安装，请手动重启服务"
        fi
    else
        echo ""
        echo "⚠️  未找到部署路径，文件已上传到 /tmp/server.js"
        echo "请手动执行以下命令："
        echo "  cp /tmp/server.js <部署路径>/server.js"
        echo "  pm2 restart <应用名称>"
    fi
    
    # 清理临时文件
    rm -f /tmp/server.js
EOF

echo ""
echo "=========================================="
echo "✅ 上传完成！"
echo "=========================================="
echo ""
echo "📋 后续步骤:"
echo "1. 检查服务是否正常运行:"
echo "   ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} 'pm2 list'"
echo "2. 查看服务日志:"
echo "   ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} 'pm2 logs --lines 50'"
echo "3. 测试 API 接口:"
echo "   curl http://${SERVER_HOST}:8000/api/v1/admin/ai-content/list?page=1&pageSize=20&stream_id=stream-1762502470503-ea8a5d81c"

