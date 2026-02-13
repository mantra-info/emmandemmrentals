import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { identifier, otp, name, email } = await req.json(); // Email optional if login was via phone, but required if provided in form

        if (!identifier || !otp) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Verify OTP Again (Final Security Check)
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: { identifier, token: otp }
            }
        });

        if (!verificationToken || new Date() > verificationToken.expires) {
            return NextResponse.json({ error: 'Invalid or Expired OTP' }, { status: 400 });
        }

        // 2. Delete OTP (MOVED TO NEXTAUTH AUTHORIZE)
        // We handle deletion in NextAuth's authorize callback to ensure it persists for sign-in.
        /*
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier, token: otp } }
        });
        */

        // 3. Create User
        const isEmailLogin = identifier.includes('@');

        let userData: any = {
            name: name || 'User',
            role: 'USER'
        };

        if (isEmailLogin) {
            userData.email = identifier;
        } else {
            userData.phoneNumber = identifier;
            if (email) userData.email = email; // If user provided email during profile completion
        }

        const newUser = await prisma.user.create({
            data: userData
        });

        return NextResponse.json({ success: true, user: newUser });

    } catch (error: any) {
        console.error('Complete Profile Error:', error);
        // Handle unique constraint violations (e.g. email already taken)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email or Phone already in use' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
