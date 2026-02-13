import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize Twilio Client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Initialize Nodemailer Transporter
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export async function sendOtp(identifier: string, type: 'PHONE' | 'EMAIL', otp: string) {
    try {
        if (type === 'PHONE') {
            await sendSmsOtp(identifier, otp);
        } else {
            await sendEmailOtp(identifier, otp);
        }
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
}

async function sendSmsOtp(phoneNumber: string, otp: string) {
    const isDev = process.env.NODE_ENV === 'development';
    const hasTwilio = process.env.TWILIO_PHONE_NUMBER &&
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        !process.env.TWILIO_PHONE_NUMBER.includes('9249089266'); // Ignore the placeholder number

    if (isDev && !hasTwilio) {
        console.log('------------------------------------------');
        console.log(`DEV MODE OTP for ${phoneNumber}: ${otp}`);
        console.log('------------------------------------------');
        return;
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('TWILIO_PHONE_NUMBER is not defined');
    }

    await twilioClient.messages.create({
        body: `Your verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
    });
}

async function sendEmailOtp(email: string, otp: string) {
    await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your Login Verification Code',
        text: `Your verification code is: ${otp}`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #f44786;">Verification Code</h2>
        <p>Your login code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #000;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });
}
