import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const labelType = searchParams.get("labelType")
    const period = searchParams.get("period") || "all"

    console.log("Export params:", { startDate, endDate, labelType, period }) // Debug log

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (labelType && labelType !== "all") {
      where.labelType = labelType
    }

    // Handle date filtering dengan timezone yang benar
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      console.log("Date range:", { start, end }) // Debug log

      where.printedAt = {
        gte: start,
        lt: end,
      }
    } else if (period !== "all") {
      // Handle period-based filtering
      const now = new Date()

      switch (period) {
        case "today":
          // Hari ini dari jam 00:00:00 sampai 23:59:59
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
          where.printedAt = {
            gte: todayStart,
            lte: todayEnd,
          }
          console.log("Today filter:", { gte: todayStart, lte: todayEnd }) // Debug log
          break
        case "week":
          // Minggu ini dari hari Minggu sampai sekarang
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)
          where.printedAt = {
            gte: weekStart,
          }
          console.log("Week filter:", { gte: weekStart }) // Debug log
          break
        case "month":
          // Bulan ini dari tanggal 1 sampai sekarang
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
          where.printedAt = {
            gte: monthStart,
          }
          console.log("Month filter:", { gte: monthStart }) // Debug log
          break
        case "year":
          // Tahun ini dari 1 Januari sampai sekarang
          const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
          where.printedAt = {
            gte: yearStart,
          }
          console.log("Year filter:", { gte: yearStart }) // Debug log
          break
      }
    }

    console.log("Export where clause:", JSON.stringify(where, null, 2)) // Debug log

    const printHistory = await db.printHistory.findMany({
      where,
      orderBy: {
        printedAt: "desc",
      },
    })

    console.log(`Exporting ${printHistory.length} records`) // Debug log

    // Create CSV content with BOM for proper Excel encoding
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

    const csvRows = [
      headers.join(","),
      ...printHistory.map((item) => {
        // Format label date
        const labelDate = item.date ? new Date(item.date).toLocaleDateString("id-ID") : ""

        // Format print date and time
        const printDate = new Date(item.printedAt).toLocaleDateString("id-ID")
        const printTime = new Date(item.printedAt).toLocaleTimeString("id-ID", { hour12: false })

        return [
          labelDate,
          printDate,
          printTime,
          item.labelType.toUpperCase(),
          item.labelCount,
          item.partNo || "",
          item.partDescription || "",
          item.productName || "",
          item.computerNo || "",
          item.lotNo || "",
          item.hardness || "",
          item.color || "",
          item.materialName || "",
          item.quantity || "",
          item.netWeight || "",
          item.grossWeight || "",
          item.inspector || "",
          item.doNo || "",
          item.poNo || "",
          item.package || "",
          item.showVulcanization ? "Ya" : "Tidak",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      }),
    ]

    const csvContent = BOM + csvRows.join("\n")

    // Generate filename based on period
    let periodName = "semua"
    if (period === "today") {
      periodName = "harian"
    } else if (period === "week") {
      periodName = "mingguan"
    } else if (period === "month") {
      periodName = "bulanan"
    } else if (period === "year") {
      periodName = "tahunan"
    } else if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 1) {
        periodName = "harian"
      } else if (diffDays <= 7) {
        periodName = "mingguan"
      } else if (diffDays <= 31) {
        periodName = "bulanan"
      } else if (diffDays <= 366) {
        periodName = "tahunan"
      }
    }

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
