import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const template = await db.template.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Template fetch error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await db.template.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Template deleted" })
  } catch (error) {
    console.error("Template deletion error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
