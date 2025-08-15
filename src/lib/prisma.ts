import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 数据库连接配置
const createPrismaClient = () => {
  console.log('Creating Prisma client...')
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!')
    throw new Error('DATABASE_URL environment variable is required')
  }

  // 修改DATABASE_URL以支持生产环境连接
  let databaseUrl = process.env.DATABASE_URL
  
  // 如果是生产环境且是Supabase，添加连接池和SSL配置
  if (process.env.NODE_ENV === 'production' && databaseUrl?.includes('supabase.co')) {
    // 确保使用连接池端口 (6543) 而不是直连端口 (5432)
    if (databaseUrl.includes(':5432')) {
      databaseUrl = databaseUrl.replace(':5432', ':6543')
      console.log('Modified DATABASE_URL to use connection pooling port 6543')
    }
    
    // 添加SSL和连接池参数
    const url = new URL(databaseUrl)
    url.searchParams.set('pgbouncer', 'true')
    url.searchParams.set('connection_limit', '1')
    url.searchParams.set('pool_timeout', '15')
    url.searchParams.set('sslmode', 'require')
    databaseUrl = url.toString()
    
    console.log('Using pooled connection for production:', databaseUrl.substring(0, 50) + '...')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}