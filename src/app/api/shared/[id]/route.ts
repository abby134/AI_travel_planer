import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const travelPlan = await prisma.travelPlan.findFirst({
      where: {
        id: id,
        status: 'SHARED'
      },
      include: {
        attractions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!travelPlan) {
      return NextResponse.json(
        { error: "Shared travel plan not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(travelPlan)
  } catch (error) {
    console.error("Error fetching shared travel plan:", error)
    return NextResponse.json(
      { error: "Failed to fetch shared travel plan" },
      { status: 500 }
    )
  }
}