export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const labelType = searchParams.get("labelType")
    const period = searchParams.get("period") || "all"

    const where: any = {
      userId: session.user.id,
    }

    if (labelType && labelType !== "all") {
      where.labelType = labelType
    }

    // 🔥 Date filtering
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      where.printedAt = {
        gte: start,
        lt: end,
      }
    } else if (period !== "all") {
      const now = new Date()

      switch (period) {
        case "today": {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
          where.printedAt = { gte: start, lte: end }
          break
        }
        case "week": {
          const start = new Date(now)
          start.setDate(now.getDate() - now.getDay())
          start.setHours(0, 0, 0, 0)
          where.printedAt = { gte: start }
          break
        }
        case "month": {
          const start = new Date(now.getFullYear(), now.getMonth(), 1)
          where.printedAt = { gte: start }
          break
        }
        case "year": {
          const start = new Date(now.getFullYear(), 0, 1)
          where.printedAt = { gte: start }
          break
        }
      }
    }

    const printHistory = await db.printHistory.findMany({
      where,
      orderBy: {
        printedAt: "desc",
      },
    })

    // 🔥 CSV HEADER
    const BOM = "\uFEFF"
    const headers = [
      "Tanggal Label",
      "Tanggal Print",
      "Waktu Print",
      "Jenis Label",
      "Jumlah Label",
      "Part No",
      "Deskripsi Part",
      "Nama Produk",
      "Computer No",
      "Lot No",
      "Hardness",
      "Warna",
      "Nama Material",
      "Quantity",
      "Net Weight",
      "Gross Weight",
      "Inspector",
      "DO No",
      "PO No",
      "Package",
      "Vulkanisasi",
    ]

    const rows = printHistory.map((item) => {
      const labelDate = item.date
        ? new Date(item.date).toLocaleDateString("id-ID")
        : ""

      const printDate = new Date(item.printedAt).toLocaleDateString("id-ID")
      const printTime = new Date(item.printedAt).toLocaleTimeString("id-ID", {
        hour12: false,
      })

      return [
        labelDate,
        printDate,
        printTime,
        item.labelType?.toUpperCase() || "",
        item.labelCount ?? "",
        item.partNo ?? "",
        item.partDescription ?? "",
        item.productName ?? "",
        item.computerNo ?? "",
        item.lotNo ?? "",
        item.hardness ?? "",
        item.color ?? "",
        item.materialName ?? "",
        item.quantity ?? "",
        item.netWeight ?? "",
        item.grossWeight ?? "",
        item.inspector ?? "",
        item.doNo ?? "",
        item.poNo ?? "",
        item.package ?? "",
        item.showVulcanization ? "Ya" : "Tidak",
      ]
        .map((f) => `"${f}"`)
        .join(",")
    })

    const csvContent = BOM + [headers.join(","), ...rows].join("\n")

    // 🔥 Filename logic
    let periodName = "semua"

    if (period === "today") periodName = "harian"
    else if (period === "week") periodName = "mingguan"
    else if (period === "month") periodName = "bulanan"
    else if (period === "year") periodName = "tahunan"

    const dateStr = new Date().toISOString().split("T")[0]
    const filename = `print-history-${periodName}-${dateStr}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}