const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportItemData() {
  try {
    const items = await prisma.item.findMany();

    const fields = [
      'id',
      'partNo',
      'description',
      'computerName',
      'lotNo',
      'hardness',
      'color',
      'materialName',
      'quantity',
      'netWeight',
      'grossWeight',
      'createdAt',
      'updatedAt'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(items);

    fs.writeFileSync('item.csv', csv);
    console.log('✅ Data item berhasil diekspor ke file item.csv');
  } catch (error) {
    console.error('❌ Gagal mengekspor data item:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportItemData();
