import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL ? 
      `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET',
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL_EXISTS: !!process.env.NEXTAUTH_URL,
    OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
  }

  console.log('Environment check:', envVars)

  return NextResponse.json({
    status: "success",
    environment: envVars,
    timestamp: new Date().toISOString()
  })
}