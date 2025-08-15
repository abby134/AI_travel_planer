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

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}