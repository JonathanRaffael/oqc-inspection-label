import { writeFileSync, mkdirSync, existsSync } from "fs";
import { db } from "../lib/db.ts"; // pastikan path relatif benar

async function exportToCSV() {
  const items = await db.item.findMany({
    select: {
      id: true,
      partNo: true,
      description: true,
      computerName: true,
      lotNo: true,
      hardness: true,
      color: true,
      materialName: true,
      quantity: true,
      binQuantity: true,
      unit: true,
      netWeight: true,
      netWeightUnit: true,
      grossWeight: true,
      grossWeightUnit: true,
      binNetWeight: true,
      binNetWeightUnit: true,
      binGrossWeight: true,
      binGrossWeightUnit: true,
      inspector: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (items.length === 0) {
    console.log("⚠️ Tidak ada data item yang ditemukan.");
    return;
  }

  const exportFolder = "exports";
  if (!existsSync(exportFolder)) {
    mkdirSync(exportFolder);
  }

  const fieldOrder = [
    "id", "partNo", "description", "computerName", "lotNo", "hardness",
    "color", "materialName", "quantity", "binQuantity", "unit",
    "netWeight", "netWeightUnit", "grossWeight", "grossWeightUnit",
    "binNetWeight", "binNetWeightUnit", "binGrossWeight", "binGrossWeightUnit",
    "inspector", "createdAt", "updatedAt"
  ];

  const headers = ["No", ...fieldOrder.map(h => h.toUpperCase())].join(",") + "\n";

  const rows = items.map((item, index) => {
    const row = [
      index + 1,
      ...fieldOrder.map((field) => {
        const value = item[field as keyof typeof item];

        // Format angka desimal
        if (typeof value === "number" && field.toLowerCase().includes("weight")) {
          return `"${value.toFixed(2)}"`;
        }

        // Format tanggal
        if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        }

        // Format umum (null-safe dan escape quote)
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      })
    ];
    return row.join(",");
  });

  const csv = headers + rows.join("\n");

  const outputPath = `${exportFolder}/item.csv`;
  writeFileSync(outputPath, csv);
  console.log(`✅ ${outputPath} berhasil dibuat dengan ${items.length} data!`);
}

exportToCSV()
  .catch((err) => {
    console.error("❌ Gagal export:", err);
  })
  .finally(() => {
    db.$disconnect();
  });
