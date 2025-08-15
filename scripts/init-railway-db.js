// Railway数据库初始化脚本
const { execSync } = require('child_process')

console.log('🚀 初始化Railway PostgreSQL数据库...')

try {
  console.log('📋 检查Prisma配置...')
  execSync('npx prisma --version', { stdio: 'inherit' })

  console.log('🗃️ 生成Prisma客户端...')
  execSync('npx prisma generate', { stdio: 'inherit' })

  console.log('📊 推送数据库模式...')
  execSync('npx prisma db push', { stdio: 'inherit' })

  console.log('✅ Railway数据库初始化完成!')
  console.log('🔗 现在可以测试连接：/api/health')

} catch (error) {
  console.error('❌ 数据库初始化失败:', error.message)
  process.exit(1)
}