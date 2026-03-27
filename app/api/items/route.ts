import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/* =========================
   GET ITEMS
========================= */

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)

  const partNo = searchParams.get("partNo")?.trim()
  const computerName = searchParams.get("computerName")?.trim()
  const search = searchParams.get("search")?.trim()

  try {

    /* =========================
       1. GET ALL ITEMS
    ========================== */

    if (!partNo && !computerName && !search) {

      const items = await prisma.item.findMany({
        orderBy: {
          createdAt: "asc"
        }
      })

      return NextResponse.json(items)
    }

    /* =========================
       2. SEARCH ITEMS
    ========================== */

    if (search) {

      const items = await prisma.item.findMany({
        where: {
          OR: [
            {
              partNo: {
                contains: search
              }
            },
            {
              description: {
                contains: search
              }
            },
            {
              computerName: {
                contains: search
              }
            },
            {
              materialName: {
                contains: search
              }
            }
          ]
        },
        orderBy: {
          createdAt: "asc"
        }
      })

      return NextResponse.json(items)
    }

    /* =========================
       3. LOOKUP ITEM
    ========================== */

    let item = null

    if (computerName) {
      item = await prisma.item.findFirst({
        where: {
          computerName: computerName
        }
      })
    }

    if (!item && partNo) {
      item = await prisma.item.findFirst({
        where: {
          partNo: partNo
        }
      })
    }

    if (!item) {

      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )

    }

    return NextResponse.json(item)

  } catch (err) {

    console.error("[GET /api/items]", err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )

  }
}


/* =========================
   CREATE ITEM
========================= */

export async function POST(req: Request) {

  try {

    const body = await req.json()

    console.log("BODY:", body)

    /* =========================
       VALIDATION
    ========================== */

    if (!body.partNo || !body.description || !body.computerName) {

      return NextResponse.json(
        { error: "partNo, description, computerName wajib diisi" },
        { status: 400 }
      )

    }

    /* =========================
       CREATE
    ========================== */

    const item = await prisma.item.create({

      data: {

        partNo: body.partNo,
        description: body.description,
        computerName: body.computerName,

        lotNo: body.lotNo || null,

        hardness: body.hardness || "",
        color: body.color || "",
        materialName: body.materialName || "",

        quantity: Number(body.quantity) || 0,

        binQuantity: body.binQuantity
          ? Number(body.binQuantity)
          : null,

        unit: body.unit || null,

        netWeight: Number(body.netWeight) || 0,
        netWeightUnit: body.netWeightUnit || null,

        grossWeight: Number(body.grossWeight) || 0,
        grossWeightUnit: body.grossWeightUnit || null,

        binNetWeight: body.binNetWeight
          ? Number(body.binNetWeight)
          : null,

        binNetWeightUnit: body.binNetWeightUnit || null,

        binGrossWeight: body.binGrossWeight
          ? Number(body.binGrossWeight)
          : null,

        binGrossWeightUnit: body.binGrossWeightUnit || null,

        inspector: body.inspector || null

      }

    })

    return NextResponse.json(item)

  } catch (err) {

    console.error("[POST /api/items]", err)

    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    )

  }

}