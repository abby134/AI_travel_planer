import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const results = []
  
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 })
  }

  // 测试不同的连接模式
  const baseUrl = process.env.DATABASE_URL
  
  // 1. 原始URL (端口5432)
  try {
    console.log("Testing direct connection (port 5432)...")
    const directClient = new PrismaClient({
      datasources: { db: { url: baseUrl } }
    })
    await directClient.$queryRaw`SELECT 1`
    await directClient.$disconnect()
    results.push({ mode: "direct-5432", status: "success" })
  } catch (error) {
    results.push({ 
      mode: "direct-5432", 
      status: "failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    })
  }

  // 2. 连接池模式 (端口6543)
  try {
    console.log("Testing pooled connection (port 6543)...")
    const pooledUrl = baseUrl.replace(':5432', ':6543')
    const url = new URL(pooledUrl)
    url.searchParams.set('pgbouncer', 'true')
    url.searchParams.set('connection_limit', '1')
    
    const pooledClient = new PrismaClient({
      datasources: { db: { url: url.toString() } }
    })
    await pooledClient.$queryRaw`SELECT 1`
    await pooledClient.$disconnect()
    results.push({ mode: "pooled-6543", status: "success" })
  } catch (error) {
    results.push({ 
      mode: "pooled-6543", 
      status: "failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    })
  }

  // 3. 事务模式 (端口5432，事务模式)
  try {
    console.log("Testing transaction mode...")
    const url = new URL(baseUrl)
    url.searchParams.set('pgbouncer', 'true')
    url.searchParams.set('pool_mode', 'transaction')
    
    const transactionClient = new PrismaClient({
      datasources: { db: { url: url.toString() } }
    })
    await transactionClient.$queryRaw`SELECT 1`
    await transactionClient.$disconnect()
    results.push({ mode: "transaction", status: "success" })
  } catch (error) {
    results.push({ 
      mode: "transaction", 
      status: "failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    })
  }

  return NextResponse.json({
    results,
    recommendation: results.find(r => r.status === "success")?.mode || "none working",
    timestamp: new Date().toISOString()
  })
}