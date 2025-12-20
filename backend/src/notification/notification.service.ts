import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class NotificationService {
    private resend: Resend | null = null;
    private readonly logger = new Logger(NotificationService.name);

    constructor() {
        if (process.env.RESEND_API_KEY) {
            this.resend = new Resend(process.env.RESEND_API_KEY);
            this.logger.log('NotificationService initialized with Resend API');
        } else {
            this.logger.warn('RESEND_API_KEY not found. Emails will be mocked (logged to console).');
        }
    }

    async sendEmail(to: string, subject: string, text: string) {
        if (this.resend) {
            try {
                await this.resend.emails.send({
                    from: 'Bonafide System <onboarding@resend.dev>',
                    to: [to],
                    subject,
                    text,
                });
                this.logger.log(`Email sent to ${to}`);
            } catch (error: any) {
                this.logger.error(`Failed to send email to ${to}`, error.message);
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
