import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Starting database schema check...")

    // 检查关键表是否存在
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ` as any[]

    const tableNames = tables.map(table => table.table_name)
    console.log("Available tables:", tableNames)

    const requiredTables = ['User', 'TravelPlan', 'Attraction', 'Account', 'Session']
    const missingTables = requiredTables.filter(table => !tableNames.includes(table))

    if (missingTables.length > 0) {
      console.error("Missing tables:", missingTables)
      return NextResponse.json({
        status: "error",
        message: "Database schema incomplete",
        missingTables,
        availableTables: tableNames
      }, { status: 500 })
    }

    // 测试用户表结构
    try {
      const userCount = await prisma.user.count()
      console.log("User table accessible, count:", userCount)
    } catch (userError) {
      console.error("User table error:", userError)
      return NextResponse.json({
        status: "error",
        message: "User table not accessible",
        error: userError instanceof Error ? userError.message : "Unknown error"
      }, { status: 500 })
    }

    return NextResponse.json({
      status: "success",
      message: "Database schema is complete",
      tables: tableNames
    })

  } catch (error) {
    console.error("Database check failed:", error)
    return NextResponse.json({
      status: "error",
      message: "Database check failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}