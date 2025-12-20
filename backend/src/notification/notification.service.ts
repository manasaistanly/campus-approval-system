import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(NotificationService.name);

    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                logger: true,
                debug: true,
            });
            this.logger.log('NotificationService initialized with SMTP transport');
        } else {
            this.logger.warn('SMTP credentials not found. Emails will be mocked (logged to console).');
        }
    }

    async sendEmail(to: string, subject: string, text: string) {
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Bonafide System" <noreply@bonafide-system.com>',
                    to,
                    subject,
                    text,
                });
                this.logger.log(`Email sent to ${to}`);
            } catch (error) {
                this.logger.error(`Failed to send email to ${to}`, error.stack);
                // Fallback or rethrow? Let's verify if we want to block flow.
                // For OTP, we should probably throw so user knows it failed.
                throw error;
            }
        } else {
            this.logger.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
        }
    }

    async sendOtp(email: string, otp: string) {
        await this.sendEmail(email, 'Your Verification Code', `Your verification code is: ${otp}. It expires in 10 minutes.`);
    }

    async notifyRequestStatus(email: string, status: string, remarks?: string) {
        await this.sendEmail(email, `Bonafide Request Update: ${status}`, `Your bonafide certificate request status has been updated to: ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`);
    }

    async notifyReadyForCollection(email: string, studentName: string) {
        await this.sendEmail(email, 'Certificate Ready for Collection', `Dear ${studentName},\n\nYour Bonafide Certificate is ready for collection. Please visit the college office to collect it.\n\nRegards,\nCollege Administration`);
    }
}
