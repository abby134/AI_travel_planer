import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    // 专门处理数据库连接错误
    if (error instanceof Error) {
      if (error.message.includes("Can't reach database server") || 
          error.message.includes("PrismaClientInitializationError")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to database server. Please check configuration."
          },
          { status: 503 }
        )
      }
      
      if (error.message.includes("DATABASE_URL")) {
        return NextResponse.json(
          { 
            error: "Database configuration error",
            details: "Database URL not configured properly."
          },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : 
          "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}