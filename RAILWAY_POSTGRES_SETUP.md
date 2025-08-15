# Railway PostgreSQL 设置指南

如果Supabase连接持续失败，可以使用Railway自带的PostgreSQL服务：

## 1. 添加PostgreSQL服务

在Railway项目中：
1. 点击 "Add Service" 
2. 选择 "Database" → "Add PostgreSQL"
3. Railway会自动创建一个PostgreSQL实例

## 2. 获取连接信息

PostgreSQL服务创建后：
1. 点击PostgreSQL服务
2. 进入"Connect"标签
3. 复制"Postgres Connection URL"

## 3. 更新环境变量

在Railway项目设置中：
1. 进入Variables标签
2. 更新 `DATABASE_URL` 为新的PostgreSQL URL
3. 格式类似：`postgresql://postgres:password@host:port/database`

## 4. 运行数据库迁移

```bash
# 在本地运行迁移
npx prisma migrate deploy

# 或者在Railway中添加构建命令
npm run build && npx prisma migrate deploy
```

## 5. 验证连接

部署后访问：
- `/api/health` - 检查数据库连接状态
- `/api/env-check` - 验证环境变量配置

## Railway PostgreSQL 优势

- ✅ 与Railway完美集成
- ✅ 无网络连接问题
- ✅ 自动备份
- ✅ 更稳定的连接
- ✅ 更好的性能（同一网络）

## 如果需要迁移数据

1. 从Supabase导出数据（如果可访问）
2. 在新PostgreSQL中重新创建表结构
3. 导入数据

这样可以彻底解决连接问题！