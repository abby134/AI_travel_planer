import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST() {
  try {
    console.log("Starting database schema push...")

    // 只在特定环境或有权限时允许
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DB_PUSH !== 'true') {
      return NextResponse.json(
        { error: "Database push not allowed in production without authorization" },
        { status: 403 }
      )
    }

    // 运行 prisma db push
    console.log("Running: npx prisma db push --accept-data-loss")
    const { stdout, stderr } = await execAsync("npx prisma db push --accept-data-loss", {
      timeout: 60000 // 60秒超时
    })

    console.log("Prisma db push output:", stdout)
    if (stderr) {
      console.error("Prisma db push stderr:", stderr)
    }

    return NextResponse.json({
      status: "success",
      message: "Database schema pushed successfully",
      output: stdout,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Database push failed:", error)
    return NextResponse.json(
      { 
        error: "Database push failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}