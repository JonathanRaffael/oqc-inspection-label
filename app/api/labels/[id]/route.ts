import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const label = await db.label.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!label) {
      return NextResponse.json({ message: "Label not found" }, { status: 404 })
    }

    return NextResponse.json(label)
  } catch (error) {
    console.error("Label fetch error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const label = await db.label.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    })

    return NextResponse.json(label)
  } catch (error) {
    console.error("Label update error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await db.label.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Label deleted" })
  } catch (error) {
    console.error("Label deletion error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
