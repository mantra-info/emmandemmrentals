import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { identifier, otp } = await req.json();

        if (!identifier || !otp) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Find OTP
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier,
                    token: otp
                }
            }
        });

        if (!verificationToken) {
            return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
        }

        if (new Date() > verificationToken.expires) {
            await prisma.verificationToken.delete({
                where: { identifier_token: { identifier, token: otp } }
            });
            return NextResponse.json({ success: false, message: 'OTP Expired' }, { status: 400 });
        }

        // OTP is valid. DO NOT DELETE YET (keep for finalize step) or delete if we trust this step.
        // Actually, for security, usually we exchange OTP for a temporary token or session.
        // For simplicity here, we will check user existence.
        // If we don't delete OTP here, it can be reused.
        // Proper flow: Delete OTP here, issue a signed "pre-auth" token to client?
        // OR: Just check existence here (read-only) and let the actual Login/Signup delete the OTP.

        // Let's go with: Check existence here. Do NOT delete OTP yet. 
        // The OTP will be deleted by the final `signIn` or `complete-profile` call.

        // Check if User exists
        // Identifier can be email or phone
        const isEmail = identifier.includes('@');
        let user;

        if (isEmail) {
            user = await prisma.user.findUnique({ where: { email: identifier } });
        } else {
            user = await prisma.user.findUnique({ where: { phoneNumber: identifier } });
        }

        return NextResponse.json({
            success: true,
            exists: !!user
        });

    } catch (error: any) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
