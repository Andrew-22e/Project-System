# 快速部署指南

## 一键部署命令（在服务器上执行）

```bash
# 1. 连接到服务器
ssh -p 13621 root@192.140.160.119

# 2. 创建部署目录
mkdir -p /opt/live-admin
cd /opt/live-admin

# 3. 上传文件后解压（或从git克隆）
# 如果使用scp上传，先在本地上传：
# scp -P 13621 -r /path/to/live root@192.140.160.119:/opt/live-admin

# 4. 安装依赖
npm install --production

# 5. 创建日志目录
mkdir -p logs

# 6. 启动服务
pm2 start ecosystem.config.js

# 7. 保存PM2配置
pm2 save

# 8. 设置开机自启
pm2 startup
# 执行上面命令后，会显示一行命令，复制执行即可
```

## 服务器环境检查

```bash
# 检查Node.js版本（需要 >= 14）
node -v

# 检查PM2是否安装
pm2 -v

# 如果未安装PM2
npm install -g pm2

# 检查端口是否被占用
netstat -tlnp | grep 8082

# 检查防火墙
firewall-cmd --list-ports  # CentOS
# 或
ufw status                # Ubuntu
```

## 访问测试

部署完成后访问：
- 后台管理: http://192.140.160.119:8082/admin
- API测试: http://192.140.160.119:8082/api/admin/dashboard

## 常用PM2命令

```bash
# 查看状态
pm2 list

# 查看日志
pm2 logs live-admin-server

# 重启服务
pm2 restart live-admin-server

# 停止服务
pm2 stop live-admin-server

# 删除服务
pm2 delete live-admin-server
```

