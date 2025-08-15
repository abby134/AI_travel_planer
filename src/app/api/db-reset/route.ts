import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    console.log("Starting database reset...")

    // 只在开发环境或明确授权时允许重置
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DB_RESET !== 'true') {
      return NextResponse.json(
        { error: "Database reset not allowed in production" },
        { status: 403 }
      )
    }

    // 删除所有数据（按依赖顺序）
    await prisma.attraction.deleteMany()
    await prisma.travelPlan.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log("All data cleared")

    // 可选：创建测试数据
    const testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: "$2a$12$dummy.hash.for.testing",
        name: "测试用户"
      }
    })

    console.log("Test user created:", testUser.id)

    return NextResponse.json({
      status: "success",
      message: "Database reset completed",
      testUserId: testUser.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Database reset failed:", error)
    return NextResponse.json(
      { 
        error: "Database reset failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}