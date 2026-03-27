import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, data } = await req.json()

    const template = await db.template.create({
      data: {
        name,
        data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Template creation error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const templates = await db.template.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Templates fetch error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
