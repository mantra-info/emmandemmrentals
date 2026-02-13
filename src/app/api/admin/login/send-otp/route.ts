import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendOtp } from "@/lib/otp";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        // 1. Find the admin user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.role !== 'ADMIN' || !user.hashedPassword) {
            return new NextResponse("Invalid credentials or unauthorized", { status: 401 });
        }

        // 2. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

        if (!isPasswordValid) {
            return new NextResponse("Invalid credentials", { status: 401 });
        }

        // 3. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // 4. Save OTP to VerificationToken
        await prisma.verificationToken.upsert({
            where: {
                identifier_token: {
                    identifier: email,
                    token: otp
                }
            },
            update: {
                token: otp,
                expires
            },
            create: {
                identifier: email,
                token: otp,
                expires
            }
        });

        // 5. Send OTP
        await sendOtp(email, 'EMAIL', otp);

        return NextResponse.json({ success: true, message: "OTP sent successfully" });

    } catch (error: any) {
        console.error("ADMIN_SEND_OTP_ERROR:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
