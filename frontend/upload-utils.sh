#!/bin/bash

# 上传 utils/api-service.js 文件到服务器
# 使用方法: ./upload-utils.sh

echo "=========================================="
echo "📤 上传 utils/api-service.js 到服务器"
echo "=========================================="

# 服务器信息
SERVER_HOST="192.140.160.119"
SERVER_SSH_PORT="13621"
SERVER_USER="root"
SERVER_PASS="ifcqTXOR1880"

# 检查文件是否存在
if [ ! -f "utils/api-service.js" ]; then
    echo "❌ 错误: utils/api-service.js 文件不存在"
    exit 1
fi

echo "✅ 找到文件: utils/api-service.js"

# 检查是否安装了 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass 未安装，请手动执行以下命令："
    echo ""
    echo "1. 上传文件:"
    echo "   scp -P ${SERVER_SSH_PORT} utils/api-service.js ${SERVER_USER}@${SERVER_HOST}:/tmp/api-service.js"
    echo ""
    echo "2. 连接到服务器:"
    echo "   ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST}"
    echo ""
    echo "3. 在服务器上执行（根据实际部署路径选择）:"
    echo "   # 如果服务器上有前端源文件:"
    echo "   cp /tmp/api-service.js /opt/live-admin/utils/api-service.js"
    echo "   # 或者"
    echo "   cp /tmp/api-service.js /path/to/frontend/utils/api-service.js"
    echo ""
    echo "或者安装 sshpass:"
    echo "   # macOS: brew install hudochenkov/sshpass/sshpass"
    echo "   # Ubuntu/Debian: sudo apt-get install sshpass"
    exit 1
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
cp utils/api-service.js "$TEMP_DIR/"

echo ""
echo "📤 上传文件到服务器..."

# 上传文件
export SSHPASS="${SERVER_PASS}"
sshpass -e scp -o StrictHostKeyChecking=no -P ${SERVER_SSH_PORT} "$TEMP_DIR/api-service.js" ${SERVER_USER}@${SERVER_HOST}:/tmp/api-service.js

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ 文件上传成功"

# 尝试多个可能的部署路径
echo ""
echo "🔍 查找服务器上的部署路径..."

# 可能的部署路径列表
POSSIBLE_PATHS=(
    "/opt/live-admin/utils"
    "/opt/live/utils"
    "/var/www/live/utils"
    "/home/www/live/utils"
    "/root/live/utils"
)

# 在服务器上查找并更新文件
sshpass -e ssh -o StrictHostKeyChecking=no -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    echo "📋 查找 utils 目录..."
    
    FOUND_PATH=""
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -d "\$path" ]; then
            echo "✅ 找到路径: \$path"
            FOUND_PATH="\$path"
            break
        fi
    done
    
    if [ -z "\$FOUND_PATH" ]; then
        echo "⚠️  未找到标准部署路径，尝试手动查找..."
        # 尝试查找包含 api-service.js 的目录
        SEARCH_RESULT=\$(find /opt /var/www /home/www /root -name "api-service.js" -type f 2>/dev/null | head -1)
        if [ -n "\$SEARCH_RESULT" ]; then
            FOUND_PATH=\$(dirname "\$SEARCH_RESULT")
            echo "✅ 找到文件位置: \$FOUND_PATH"
        fi
    fi
    
    if [ -n "\$FOUND_PATH" ]; then
        echo ""
        echo "📦 备份原文件..."
        if [ -f "\$FOUND_PATH/api-service.js" ]; then
            cp "\$FOUND_PATH/api-service.js" "\$FOUND_PATH/api-service.js.backup.\$(date +%Y%m%d_%H%M%S)"
            echo "✅ 原文件已备份"
        fi
        
        echo ""
        echo "📥 更新文件..."
        cp /tmp/api-service.js "\$FOUND_PATH/api-service.js"
        chmod 644 "\$FOUND_PATH/api-service.js"
        
        echo ""
        echo "✅ 文件更新成功！"
        echo "📋 文件路径: \$FOUND_PATH/api-service.js"
        echo "📊 文件信息:"
        ls -lh "\$FOUND_PATH/api-service.js"
    else
        echo ""
        echo "⚠️  未找到部署路径，文件已上传到 /tmp/api-service.js"
        echo "请手动执行以下命令："
        echo "  cp /tmp/api-service.js <部署路径>/utils/api-service.js"
    fi
    
    # 清理临时文件
    rm -f /tmp/api-service.js
EOF

# 清理本地临时文件
rm -rf "$TEMP_DIR"

echo ""
echo "=========================================="
echo "✅ 上传完成！"
echo "=========================================="
echo ""
echo "📋 后续步骤:"
echo "1. 如果前端代码需要重新编译，请在服务器上重新编译"
echo "2. 如果是小程序，需要在本地重新编译小程序代码"
echo "3. 如果是 H5，可能需要重启 Web 服务器或清除缓存"
echo "4. 检查文件是否正确更新:"
echo "   ssh -p ${SERVER_SSH_PORT} ${SERVER_USER}@${SERVER_HOST} 'cat <部署路径>/utils/api-service.js | head -20'"

