import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const tokens = await prisma.verificationToken.findMany()
    console.log('Verification Tokens:', JSON.stringify(tokens, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
