import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
        console.error('Usage: npx tsx promote_admin.ts <email> <password>')
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    let user
    if (existingUser) {
        // Update existing user
        user = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                hashedPassword
            }
        })
    } else {
        // Create new admin user
        user = await prisma.user.create({
            data: {
                email,
                role: 'ADMIN',
                hashedPassword
            }
        })
    }

    console.log(`Successfully promoted ${email} to ADMIN with password protection`)
    console.log('User Details:', JSON.stringify({ ...user, hashedPassword: '[REDACTED]' }, null, 2))
}

main()
    .catch(e => {
        console.error('Error promoting user:', e.message)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
