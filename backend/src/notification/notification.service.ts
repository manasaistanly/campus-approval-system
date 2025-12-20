import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private frontendUrl: string;
    private emailRelaySecret: string;

    constructor() {
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.emailRelaySecret = process.env.EMAIL_RELAY_SECRET || '';

        if (this.emailRelaySecret) {
            this.logger.log(`NotificationService initialized with email relay to: ${this.frontendUrl}`);
        } else {
            this.logger.warn('EMAIL_RELAY_SECRET not set. Emails will be mocked.');
        }
    }

    async sendEmail(to: string, subject: string, text: string) {
        if (this.emailRelaySecret) {
            try {
                const response = await fetch(`${this.frontendUrl}/api/email-relay`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-secret': this.emailRelaySecret,
                    },
                    body: JSON.stringify({ to, subject, text }),
                });

                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const error = await response.json();
                        throw new Error(error.error || 'Email relay failed');
                    } else {
                        const text = await response.text();
                        // Truncate long HTML error pages
                        const shortText = text.substring(0, 200);
                        throw new Error(`Email relay failed (${response.status}): ${shortText}`);
                    }
                }

                this.logger.log(`Email sent to ${to} via relay`);
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
