import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const label = await db.label.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(label, { status: 201 })
  } catch (error) {
    console.error("Label creation error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const labels = await db.label.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(labels)
  } catch (error) {
    console.error("Labels fetch error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
