import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { BonafideRequest, User, BonafideReason, DeliveryMode } from '@prisma/client';

@Injectable()
export class PdfService {
    async generateBonafideCertificate(
        request: BonafideRequest & { student: User; purpose: BonafideReason }
    ): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('COLLEGE NAME', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text('College Address, City, State - Zip', { align: 'center' });
            doc.moveDown();
            doc.lineWidth(2).moveTo(50, 100).lineTo(545, 100).stroke();
            doc.moveDown(2);

            // Title
            doc.fontSize(18).font('Helvetica-Bold').text('BONAFIDE CERTIFICATE', { align: 'center', underline: true });
            doc.moveDown(2);

            // Body
            const studentName = request.student.fullName.toUpperCase();
            const registerNo = request.student.registerNumber || 'N/A';
            const department = request.student.department || 'N/A';
            const year = request.student.year || 'N/A';
            const purpose = request.purpose.reason;

            doc.fontSize(14).font('Helvetica').text(
                `This is to certify that Mr./Ms. ${studentName} (Reg. No: ${registerNo}) is a bonafide student of our college studying in ${year} year, Department of ${department} during the academic year 2024-2025.`,
                { align: 'justify', lineGap: 6 }
            );

            doc.moveDown();
            doc.text(
                `This certificate is issued for the purpose of ${purpose}.`,
                { align: 'justify' }
            );

            // Footer
            doc.moveDown(4);
            doc.fontSize(12).text('Date: ' + new Date().toLocaleDateString(), 50);

            doc.text('Principal', { align: 'right' });

            if (request.deliveryMode === DeliveryMode.DIGITAL) {
                doc.fontSize(10).text('(Digitally Signed)', { align: 'right' });
            }

            doc.end();
        });
    }
}
