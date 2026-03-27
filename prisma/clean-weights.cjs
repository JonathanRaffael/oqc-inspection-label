const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const fixLabel = await prisma.$executeRawUnsafe(`
    UPDATE Label SET netWeight = '0' WHERE netWeight = '';
  `)

  const fixLabel2 = await prisma.$executeRawUnsafe(`
    UPDATE Label SET grossWeight = '0' WHERE grossWeight = '';
  `)

  const fixHistory = await prisma.$executeRawUnsafe(`
    UPDATE PrintHistory SET netWeight = '0' WHERE netWeight = '';
  `)

  const fixHistory2 = await prisma.$executeRawUnsafe(`
    UPDATE PrintHistory SET grossWeight = '0' WHERE grossWeight = '';
  `)

  console.log(`✅ Label fixed: ${fixLabel + fixLabel2}, PrintHistory fixed: ${fixHistory + fixHistory2}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
