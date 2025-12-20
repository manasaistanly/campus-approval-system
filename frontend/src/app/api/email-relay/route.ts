import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import nodemailer from 'nodemailer';

// This API route acts as an email relay
// Railway backend calls this, and Vercel sends the email via Gmail SMTP

export async function POST(request: NextRequest) {
    try {
        // Verify the request is from our backend (simple secret check)
        const authHeader = request.headers.get('x-api-secret');
        if (authHeader !== process.env.EMAIL_RELAY_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { to, subject, text } = await request.json();

        if (!to || !subject || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create Gmail SMTP transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } as any);

        // Send the email
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
        });

        return NextResponse.json({ success: true, message: 'Email sent' });
    } catch (error: any) {
        console.error('Email relay error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
