import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/* =========================
   UPDATE ITEM
========================= */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {

  try {

    const body = await req.json()

    /* ================= VALIDATE EXIST ================= */
    const existing = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    /* ================= UPDATE ================= */
    const item = await prisma.item.update({
      where: { id: params.id },
      data: {

        partNo: body.partNo,
        description: body.description,
        computerName: body.computerName,
        lotNo: body.lotNo ?? null,

        hardness: body.hardness,
        color: body.color,
        materialName: body.materialName,

        quantity: Number(body.quantity),

        binQuantity: body.binQuantity ?? null,
        unit: body.unit ?? null,

        netWeight: Number(body.netWeight),
        netWeightUnit: body.netWeightUnit ?? null,

        grossWeight: Number(body.grossWeight),
        grossWeightUnit: body.grossWeightUnit ?? null,

        binNetWeight: body.binNetWeight ?? null,
        binNetWeightUnit: body.binNetWeightUnit ?? null,

        binGrossWeight: body.binGrossWeight ?? null,
        binGrossWeightUnit: body.binGrossWeightUnit ?? null,

        inspector: body.inspector ?? null

      }
    })

    return NextResponse.json(item)

  } catch (err) {

    console.error("[PUT /api/items/:id]", err)

    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
}


/* =========================
   DELETE ITEM
========================= */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {

  try {

    /* ================= VALIDATE EXIST ================= */
    const existing = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    /* ================= DELETE ================= */
    await prisma.item.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully"
    })

  } catch (err) {

    console.error("[DELETE /api/items/:id]", err)

    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    )
  }
}