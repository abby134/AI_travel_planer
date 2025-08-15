import { NextResponse } from "next/server"

export async function GET() {
  const diagnostics = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    databaseUrl: {
      exists: !!process.env.DATABASE_URL,
      preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET',
    },
    networkTests: [] as any[]
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ...diagnostics,
      status: "error",
      message: "DATABASE_URL not configured"
    })
  }

  try {
    const url = new URL(process.env.DATABASE_URL)
    diagnostics.databaseUrl = {
      ...diagnostics.databaseUrl,
      host: url.hostname,
      port: url.port,
      database: url.pathname.substring(1),
      username: url.username,
      protocol: url.protocol
    }

    // 测试网络连接
    const hostTests = [
      { host: url.hostname, port: 5432, description: "Direct connection" },
      { host: url.hostname, port: 6543, description: "Connection pooling" }
    ]

    for (const test of hostTests) {
      try {
        console.log(`Testing network connectivity to ${test.host}:${test.port}`)
        
        // 使用fetch测试网络可达性（虽然不是PostgreSQL协议，但可以测试网络层）
        const testUrl = `https://${test.host}:${test.port}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        try {
          await fetch(testUrl, { 
            signal: controller.signal,
            method: 'HEAD'
          })
          clearTimeout(timeoutId)
          diagnostics.networkTests.push({
            ...test,
            status: "reachable",
            note: "Host responds to HTTP requests"
          })
        } catch (fetchError) {
          clearTimeout(timeoutId)
          // 即使HTTP失败，如果不是网络超时，通常意味着主机是可达的
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
          if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
            diagnostics.networkTests.push({
              ...test,
              status: "unreachable",
              error: errorMessage
            })
          } else {
            diagnostics.networkTests.push({
              ...test,
              status: "host_reachable_port_filtered",
              note: "Host reachable but port may be filtered"
            })
          }
        }
      } catch (error) {
        diagnostics.networkTests.push({
          ...test,
          status: "test_failed",
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return NextResponse.json({
      ...diagnostics,
      status: "analysis_complete",
      recommendations: [
        "1. Check if Supabase project is paused (free tier auto-pauses)",
        "2. Verify database credentials in Supabase dashboard",
        "3. Check Supabase Network Restrictions settings",
        "4. Try using Connection Pooling URL from Supabase",
        "5. Consider switching to a different database provider"
      ]
    })

  } catch (error) {
    return NextResponse.json({
      ...diagnostics,
      status: "error",
      message: "Failed to parse DATABASE_URL",
      error: error instanceof Error ? error.message : String(error)
    })
  }
}