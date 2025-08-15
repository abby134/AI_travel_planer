import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/getServerSession"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { destination, startDate, endDate, mode, preferences = [] } = await request.json()
    
    console.log('User preferences received:', preferences)

    if (!destination || !startDate || !endDate || !mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    
    const modeInstructions = {
      COMMANDO: "Create a high-intensity itinerary with 6-8 attractions per day, minimal rest time, and efficient routing.",
      NORMAL: "Create a balanced itinerary with 4-5 attractions per day, including breaks and meal times.",
      LEISURE: "Create a relaxed itinerary with 2-3 main attractions per day, plenty of free time, and focus on experiences."
    }

    // 处理偏好翻译
    const preferenceLabels = {
      nature: '自然风光和户外景点',
      history: '历史古迹和文化遗产',
      modern: '现代建筑和城市景观',
      museum: '博物馆和艺术展览',
      food: '特色美食和餐厅',
      shopping: '购物中心和商业街',
      nightlife: '夜生活和娱乐场所',
      temple: '寺庙和宗教建筑',
      park: '公园和游乐设施',
      local: '本地特色和民俗体验'
    }

    let preferenceText = ''
    if (preferences.length > 0) {
      const selectedPreferences = preferences.map((p: string) => preferenceLabels[p as keyof typeof preferenceLabels] || p)
      preferenceText = `

🎯 🎯 🎯 重要：用户偏好要求（必须严格遵守）🎯 🎯 🎯
用户明确表示对以下类型感兴趣：${selectedPreferences.join('、')}

❗ 绝对要求：
- 至少80%的推荐景点必须匹配用户选择的偏好类型
- 如果用户选择了"历史文化"，必须推荐古迹、博物馆、历史建筑
- 如果用户选择了"自然风光"，必须推荐公园、山水、自然景观
- 如果用户选择了"美食体验"，必须包含著名餐厅、美食街、特色小吃
- 如果用户选择了"博物馆"，必须优先推荐各类博物馆和艺术馆
- 不要推荐与用户偏好无关的景点！`
    }

    console.log('Generated preference text:', preferenceText)

    const prompt = `请为 ${destination} 制定一个详细的 ${days} 天旅行行程，时间从 ${startDate} 到 ${endDate}。

旅行风格: ${mode} - ${modeInstructions[mode as keyof typeof modeInstructions]}${preferenceText}

🚨 重要要求：
1. 必须严格按照用户偏好推荐景点！
2. 所有内容必须用中文回复
3. 景点名称用中文
4. 描述用中文
5. 时间安排用中文

只返回有效的 JSON 格式，不要其他任何文字：

{
  "attractions": [
    {
      "name": "景点中文名称",
      "description": "详细的中文描述",
      "latitude": 39.9163,
      "longitude": 116.3972,
      "visitTime": "第1天，上午9:00",
      "duration": "2小时"
    }
  ]
}

必须满足的要求：
- 包含 ${destination} 真实的地理坐标
- 按天数和位置逻辑排序
- 包含现实的游览时间和持续时间
- 提供详细且有用的中文描述
- 考虑景点间的交通时间
- 每天最少3个景点，最多8个景点
- 景点名称必须是中文
- 所有描述必须是中文
- 时间安排必须是中文格式（第X天，上午/下午X:XX）`

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system", 
          content: "你是一个专业的中国旅游规划师。你必须严格按照用户偏好推荐景点，所有回复必须用中文，景点名称必须用中文。请确保推荐的景点真实存在且符合用户需求。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3, // 降低温度让输出更稳定和准确
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    let parsedAttractions
    try {
      const parsed = JSON.parse(aiResponse)
      
      // Handle flat attractions array format
      if (parsed.attractions && Array.isArray(parsed.attractions)) {
        parsedAttractions = parsed.attractions
      }
      // Handle day-based format (day1, day2, etc.)
      else if (typeof parsed === 'object' && parsed !== null) {
        parsedAttractions = []
        const dayKeys = Object.keys(parsed).filter(key => key.startsWith('day'))
        
        dayKeys.forEach(dayKey => {
          if (parsed[dayKey] && parsed[dayKey].attractions && Array.isArray(parsed[dayKey].attractions)) {
            parsedAttractions.push(...parsed[dayKey].attractions)
          }
        })
      }
      // Fallback
      else if (Array.isArray(parsed)) {
        parsedAttractions = parsed
      }
      else {
        parsedAttractions = []
      }
      
      if (!Array.isArray(parsedAttractions) || parsedAttractions.length === 0) {
        console.error("No valid attractions found in AI response:", parsed)
        throw new Error("AI response does not contain valid attractions")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      console.error("Parse error:", parseError)
      throw new Error("Invalid AI response format")
    }

    const attractions = parsedAttractions.map((attraction: any, index: number) => {
      return {
        name: attraction.name,
        description: attraction.description,
        latitude: attraction.latitude,
        longitude: attraction.longitude,
        order: index + 1,
        visitTime: attraction.visitTime,
        duration: attraction.duration,
      }
    })

    const travelPlan = await prisma.travelPlan.create({
      data: {
        userId: (session.user as any).id,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        mode: mode as any,
        status: 'COMPLETED',
        attractions: {
          create: attractions
        }
      },
      include: {
        attractions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(travelPlan)
  } catch (error) {
    console.error("Travel plan generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate travel plan" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const travelPlans = await prisma.travelPlan.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        attractions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(travelPlans)
  } catch (error) {
    console.error("Error fetching travel plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch travel plans" },
      { status: 500 }
    )
  }
}