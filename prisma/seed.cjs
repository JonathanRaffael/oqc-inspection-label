const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$executeRawUnsafe(`
    UPDATE Label SET quantity = 0 WHERE quantity = ''
  `)

  console.log(`✅ Fixed ${result} row(s).`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
