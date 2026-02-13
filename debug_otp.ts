import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const tokens = await prisma.verificationToken.findMany({
        where: { identifier: 'nasvan@mantraitsolutions.in' },
        orderBy: { expires: 'desc' },
        take: 1
    })

    if (tokens.length > 0) {
        console.log('LATEST_OTP:', tokens[0].token)
    } else {
        console.log('No OTP found')
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
