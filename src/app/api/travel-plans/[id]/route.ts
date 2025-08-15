import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/getServerSession"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const travelPlan = await prisma.travelPlan.findFirst({
      where: {
        id: id,
        userId: (session.user as any).id
      },
      include: {
        attractions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!travelPlan) {
      return NextResponse.json(
        { error: "Travel plan not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(travelPlan)
  } catch (error) {
    console.error("Error fetching travel plan:", error)
    return NextResponse.json(
      { error: "Failed to fetch travel plan" },
      { status: 500 }
    )
  }
}