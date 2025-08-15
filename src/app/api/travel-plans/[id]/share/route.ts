import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/getServerSession"
import { prisma } from "@/lib/prisma"

export async function POST(
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
      }
    })

    if (!travelPlan) {
      return NextResponse.json(
        { error: "Travel plan not found" },
        { status: 404 }
      )
    }

    await prisma.travelPlan.update({
      where: { id: id },
      data: { status: 'SHARED' }
    })

    const shareUrl = `${process.env.NEXTAUTH_URL}/shared/${id}`

    return NextResponse.json({ shareUrl })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    )
  }
}