import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { printHistory } = await req.json()

    if (!Array.isArray(printHistory)) {
      return NextResponse.json({ message: "Invalid print history data" }, { status: 400 })
    }

    // Create multiple print history records
    const createdRecords = await db.printHistory.createMany({
      data: printHistory.map((item: any) => ({
        ...item,
        userId: session.user.id,
        quantity: String(item.quantity),
        netWeight: Number.parseFloat(item.netWeight),
        grossWeight: Number.parseFloat(item.grossWeight),
      })),
    })

    return NextResponse.json(
      {
        message: "Print history saved successfully",
        count: createdRecords.count,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Print history creation error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "8")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || "all"
    const sort = searchParams.get("sort") || "newest"
    console.log("API Params:", { page, limit, search, type, sort }) // Debug log

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    // Add search filter - perbaiki untuk kompatibilitas Prisma
    if (search && search.trim() !== "") {
      const searchTerm = search.trim()
      where.OR = [
        { partNo: { contains: searchTerm } },
        { partDescription: { contains: searchTerm } },
        { productName: { contains: searchTerm } },
        { lotNo: { contains: searchTerm } },
        { inspector: { contains: searchTerm } },
        { computerNo: { contains: searchTerm } },
        { materialName: { contains: searchTerm } },
        { doNo: { contains: searchTerm } },
        { poNo: { contains: searchTerm } },
      ]
    }

    // Add type filter
    if (type && type !== "all") {
      where.labelType = type
    }

    console.log("Where clause:", JSON.stringify(where, null, 2)) // Debug log

    // Build orderBy clause
    let orderBy: any
    switch (sort) {
      case "oldest":
        orderBy = { printedAt: "asc" }
        break
      case "type":
        orderBy = [{ labelType: "asc" }, { printedAt: "desc" }]
        break
      case "quantity":
        orderBy = [{ labelCount: "desc" }, { printedAt: "desc" }]
        break
      case "newest":
      default:
        orderBy = { printedAt: "desc" }
        break
    }

    console.log("OrderBy:", JSON.stringify(orderBy, null, 2)) // Debug log

    // Get total count for pagination
    const total = await db.printHistory.count({ where })

    // Get paginated results
    const printHistory = await db.printHistory.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    })

    console.log(`Found ${printHistory.length} records out of ${total} total`) // Debug log

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      printHistory,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
  } catch (error) {
    console.error("Print history fetch error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
