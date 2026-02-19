import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaConnectionLogged: boolean | undefined
}

const logPrismaConnectionTarget = () => {
    if (globalForPrisma.prismaConnectionLogged) return
    globalForPrisma.prismaConnectionLogged = true

    const rawUrl = process.env.DATABASE_URL
    if (!rawUrl) {
        console.error('[prisma] DATABASE_URL is missing in runtime environment')
        return
    }

    try {
        const parsed = new URL(rawUrl)
        const isPooler = parsed.hostname.includes('pooler')
        const sslMode = parsed.searchParams.get('sslmode') || 'not_set'
        const pgBouncer = parsed.searchParams.get('pgbouncer') || 'not_set'

        console.log(
            `[prisma] DATABASE_URL target host=${parsed.hostname} port=${parsed.port || 'default'} pooler=${isPooler} sslmode=${sslMode} pgbouncer=${pgBouncer}`
        )
    } catch {
        console.error('[prisma] DATABASE_URL exists but could not be parsed as URL')
    }
}

if (process.env.NODE_ENV === 'production') {
    logPrismaConnectionTarget()
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
