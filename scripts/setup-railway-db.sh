#!/bin/bash

echo "🚀 设置Railway PostgreSQL数据库..."

# Railway数据库连接信息
# 注意：postgres.railway.internal 只能在Railway内部网络访问
# 本地需要使用公共URL或TCP代理

echo "⚠️  注意：从本地连接Railway数据库需要以下步骤："
echo ""
echo "1. 获取Railway PostgreSQL的公共连接URL"
echo "   - 在Railway PostgreSQL服务页面"
echo "   - 点击 'Connect' 标签"
echo "   - 查找 'Public Network' 或 'External' 连接URL"
echo ""
echo "2. 该URL应该类似于："
echo "   postgresql://postgres:password@<external-host>:<port>/railway"
echo ""
echo "3. 或者使用Railway CLI:"
echo "   railway connect <service-name>"
echo ""

# 检查是否有公共URL
if [ -n "$DATABASE_PUBLIC_URL" ]; then
    echo "✅ 找到PUBLIC URL，使用它进行连接..."
    export DATABASE_URL="$DATABASE_PUBLIC_URL"
else
    echo "❌ 请从Railway控制台获取公共连接URL"
    echo ""
    echo "请运行以下命令（使用你的实际公共URL）："
    echo 'export DATABASE_URL="postgresql://postgres:MlrWlINOEuaofeNVpeuRBNDvmnaCMznl@<public-host>:<port>/railway"'
    echo "npx prisma generate"
    echo "npx prisma db push"
    exit 1
fi

echo "📋 生成Prisma客户端..."
npx prisma generate

echo "🗃️ 推送数据库schema..."
npx prisma db push

echo "✅ Railway数据库设置完成！"
echo ""
echo "🔍 验证连接："
echo "npx prisma db pull"