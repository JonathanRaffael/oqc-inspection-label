// prisma/seed.ts
import { PrismaClient, UnitType } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

function toUnitType(value?: string | null): UnitType | undefined {
  if (!value) return undefined;
  const v = String(value).trim().toLowerCase();
  switch (v) {
    case "pcs": return UnitType.Pcs;
    case "m": return UnitType.M;
    case "kg": return UnitType.Kg;
    case "ltr": return UnitType.Ltr;
    case "set": return UnitType.Set;
    case "unit": return UnitType.Unit;
    default:
      // biarin undefined kalau gak cocok enum
      return undefined;
  }
}

function toNumberOrNull(v: any): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).replaceAll(",", ".").trim();
  if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "nan") return null;
  const num = Number(s);
  return Number.isFinite(num) ? num : null;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

async function main() {
  const csvPath = path.resolve("prisma", "data", "item_clean.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV tidak ditemukan: ${csvPath}`);
  }

  // Baca CSV
  const raw = fs.readFileSync(csvPath);
  const rows: any[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  });

  console.log(`🚀 Mulai seed: ${rows.length} baris dari item_clean.csv`);

  // Validasi minimal kolom penting
  const requiredCols = [
    "PARTNO", "DESCRIPTION", "COMPUTERNAME",
    "HARDNESS", "COLOR", "MATERIALNAME",
    "QUANTITY", "NETWEIGHT", "GROSSWEIGHT"
  ];
  for (const c of requiredCols) {
    if (!(c in rows[0])) {
      throw new Error(`Kolom wajib "${c}" tidak ditemukan di CSV.`);
    }
  }

  // Map ke payload createMany
  const payload = rows.map((r, idx) => {
    const partNo = (r["PARTNO"] ?? "").toString().trim();
    const description  = (r["DESCRIPTION"]  ?? "").toString().trim();
    const computerName = (r["COMPUTERNAME"] ?? "").toString().trim();
    const hardness     = (r["HARDNESS"]     ?? "").toString().trim();
    const color        = (r["COLOR"]        ?? "").toString().trim();
    const materialName = (r["MATERIALNAME"] ?? "").toString().trim();

    const quantity = toNumberOrNull(r["QUANTITY"]);
    const netWeight = toNumberOrNull(r["NETWEIGHT"]);
    const grossWeight = toNumberOrNull(r["GROSSWEIGHT"]);

    if (!partNo || quantity === null || netWeight === null || grossWeight === null) {
      console.warn(`⚠️  Skip row ${idx + 1}: data wajib tidak lengkap`);
      return null;
    }

    const binQuantity = toNumberOrNull(r["BINQUANTITY"]);

    const unit = toUnitType(r["UNIT"]);
    const netWeightUnit = toUnitType(r["NETWEIGHTUNIT"]);
    const grossWeightUnit = toUnitType(r["GROSSWEIGHTUNIT"]);

    const binNetWeight = toNumberOrNull(r["BINNETWEIGHT"]);
    const binNetWeightUnit = toUnitType(r["BINNETWEIGHTUNIT"]);
    const binGrossWeight = toNumberOrNull(r["BINGROSSWEIGHT"]);
    const binGrossWeightUnit = toUnitType(r["BINGROSSWEIGHTUNIT"]);

    const inspector = (r["INSPECTOR"] ?? "").toString().trim() || null;

    // CSV tidak punya LOTNO — set null (atau "" jika schema default "")
    const lotNo: string | null = null;

    return {
      partNo,
      description,
      computerName,
      lotNo, // atau "" jika pakai default string
      hardness,
      color,
      materialName,
      quantity,
      binQuantity: binQuantity ?? undefined,
      unit: unit ?? undefined,

      netWeight,
      netWeightUnit: netWeightUnit ?? undefined,
      grossWeight,
      grossWeightUnit: grossWeightUnit ?? undefined,

      binNetWeight: binNetWeight ?? undefined,
      binNetWeightUnit: binNetWeightUnit ?? undefined,
      binGrossWeight: binGrossWeight ?? undefined,
      binGrossWeightUnit: binGrossWeightUnit ?? undefined,

      inspector,
      // createdAt/updatedAt biarkan default Prisma
    };
  }).filter(Boolean) as any[];

  // Optional: hapus duplikat PARTNO di payload (kalau ada)
  const seen = new Set<string>();
  const deduped = payload.filter((p) => {
    if (seen.has(p.partNo)) return false;
    seen.add(p.partNo);
    return true;
  });

  console.log(`✅ Payload siap: ${deduped.length} records (duplikat diabaikan)`);
  console.log(`⏳ Insert ke DB (createMany + skipDuplicates)...`);

  // Batching biar aman (mis. 500 per batch)
  const batches = chunk(deduped, 500);
  let totalInserted = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const res = await prisma.item.createMany({
      data: batch,
      skipDuplicates: true, // hormati unique(partNo)
    });
    totalInserted += res.count;
    console.log(`  • Batch ${i + 1}/${batches.length}: +${res.count}`);
  }

  console.log(`🎉 Selesai seeding. Total inserted: ${totalInserted}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
