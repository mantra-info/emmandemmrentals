import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtp } from '@/lib/otp';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { identifier, type } = await req.json();

        if (!identifier || !type) {
            return NextResponse.json(
                { error: 'Missing identifier or type' },
                { status: 400 }
            );
        }

        // Generate specific numeric OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Set expiry (e.g., 5 minutes)
        const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

        // Store in database
        // Delete any existing tokens for this identifier to prevent reuse/clutter
        await prisma.verificationToken.deleteMany({
            where: { identifier },
        });

        await prisma.verificationToken.create({
            data: {
                identifier,
                token: otp,
                expires,
            },
        });

        // Send the OTP
        await sendOtp(identifier, type, otp);

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error: any) {
        console.error('OTP Send Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send OTP' },
            { status: 500 }
        );
    }
}
