import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { BonafideRequest, User, BonafideReason, DeliveryMode } from '@prisma/client';
import * as path from 'path';

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

            const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'college_logo.jpg');
            const certificateDate = request.certificateDate ? new Date(request.certificateDate) : new Date();
            const formattedDate = certificateDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

            // Reference Number (Top Right)
            const refNumber = `SI.No.ACE/${certificateDate.getFullYear()}/${request.id.substring(0, 8)}`;
            // Use width to ensure right alignment stays within margin (595 - 50 = 545 is right margin)
            // Start at 300, width 245 -> ends at 545
            doc.fontSize(10).font('Helvetica').text(refNumber, 300, 50, { width: 245, align: 'right' });
            doc.text(`Ref: ${request.purpose.reason}`, 300, 65, { width: 245, align: 'right' });
            doc.text(`Date: ${formattedDate}`, 300, 80, { width: 245, align: 'right' });

            // Logo and College Header
            try {
                doc.image(logoPath, 40, 40, { width: 70 });
            } catch (e) {
                // If logo not found, skip
                console.error("Logo not found", e);
            }

            doc.fontSize(16).font('Helvetica-Bold').text('ADHIYAMAAN COLLEGE OF ENGINEERING', 120, 50, { align: 'left' });
            doc.fontSize(10).font('Helvetica').text('(Autonomous)', 120, 70);
            doc.fontSize(8).text('Affiliated to Anna University- Chennai & Approved by AICTE, New Delhi & NAAC - UGC - New Delhi', 120, 85);
            doc.text('Accredited by NBA, New Delhi & NAAC - UGC - New Delhi: Dr. M.G.R. Nagar,', 120, 95);
            doc.text('HOSUR - 635 130, Krishnagiri (Dist.), Tamil Nadu, India.', 120, 105);
            doc.fontSize(7).text('Website: www.adhiyamaan.ac.in/ E-mail: principal@adhiyamaan.ac.in', 120, 115);
            doc.text('Phone No: off.: 04344 – 260570,261001,261020,261034.', 120, 125);

            // Removed original Date line from here as it's moved to top right with Ref No.
            // doc.fontSize(10).text(..., 450, 140, { align: 'right' });

            doc.moveDown(4);

            // Title
            const titleY = 170;
            doc.fontSize(14).font('Helvetica-Bold').text('BONAFIDE AND TENTATIVE EXPENDITURE CERTIFICATE', 50, titleY, { align: 'center', underline: true });

            doc.moveDown(2);

            // Body
            const studentName = request.student.fullName.toUpperCase();
            const registerNo = request.student.registerNumber || 'N/A';
            const department = request.student.department || 'N/A';
            const year = request.student.year || 'N/A';
            const section = request.student.section || '';
            const fatherName = request.student.fatherName ? request.student.fatherName.toUpperCase() : '__________';
            const quota = request.student.quota === 'GOVERNMENT' ? 'Government Quota' : 'Management Quota';

            const bodyY = 210;
            doc.fontSize(11).font('Helvetica').text(
                `This is to certify that Mr./Ms. ${studentName} (Reg.No.${registerNo}), S/O.Mr./D/O.Mr. ${fatherName}, is studying ${year} Year ${department}${section ? ' (' + section + ')' : ''} degree course under the ${quota} in this Institution during the academic year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}. He/She will complete the course at the end of the academic year ${new Date().getFullYear() + 2}-${new Date().getFullYear() + 3}. He/She has to incur the following expenditure for ${year} year during his/her study. This Institution has been approved by the AICTE, New Delhi Vide Letter F.No. Southern/1-4464336021/${new Date().getFullYear()}/EOA Date:${formattedDate}.`,
                50, bodyY, { align: 'justify', lineGap: 5 }
            );

            // Expenditure Table
            const tableY = 330;
            doc.fontSize(11).font('Helvetica-Bold').text('I. TUITION FEES:*', 50, tableY);

            const tableStartY = tableY + 25;
            const colWidths = [80, 80, 100, 100, 100, 80];
            const headers = ['YEAR', 'TUITION\nFEES', 'BOOKS &\nSTATIONERY', 'PURCHASE OF\nLAPTOP', 'MINIPROJECT\n/PROJECT\nEXPENSES', 'TOTAL\nAMOUNT'];

            // Table Header
            let xPos = 50;
            doc.fontSize(9).font('Helvetica-Bold');
            headers.forEach((header, i) => {
                doc.text(header, xPos, tableStartY, { width: colWidths[i], align: 'center' });
                xPos += colWidths[i];
            });

            // Table Line
            doc.moveTo(50, tableStartY + 30).lineTo(550, tableStartY + 30).stroke();

            // Table Data Row - Use dynamic fees from database
            const dataY = tableStartY + 35;
            const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
            const tuitionFee = request.tuitionFees ? `₹${request.tuitionFees.toLocaleString()}` : '--------';
            const booksStationery = request.booksStationery ? `₹${request.booksStationery.toLocaleString()}` : '--------';
            const laptopPurchase = request.laptopPurchase ? `₹${request.laptopPurchase.toLocaleString()}` : '--------';
            const projectExpenses = request.projectExpenses ? `₹${request.projectExpenses.toLocaleString()}` : '--------';

            // Calculate total
            const totalFees = (request.tuitionFees || 0) + (request.booksStationery || 0) +
                (request.laptopPurchase || 0) + (request.projectExpenses || 0);
            const totalAmount = `₹${totalFees.toLocaleString()}`;

            doc.fontSize(9).font('Helvetica');
            doc.text(academicYear, 50, dataY, { width: 80, align: 'center' });
            doc.text(tuitionFee, 130, dataY, { width: 80, align: 'center' });
            doc.text(booksStationery, 210, dataY, { width: 100, align: 'center' });
            doc.text(laptopPurchase, 310, dataY, { width: 100, align: 'center' });
            doc.text(projectExpenses, 410, dataY, { width: 100, align: 'center' });
            doc.text(totalAmount, 510, dataY, { width: 80, align: 'center' });

            doc.moveTo(50, dataY + 20).lineTo(550, dataY + 20).stroke();
            doc.text(totalAmount, 510, dataY + 25, { width: 80, align: 'center' });

            // Additional Fees
            const additionalY = dataY + 50;
            const examFees = request.examFees ? `${request.examFees.toLocaleString()}` : '--------';
            const hostelFees = request.hostelFees ? `${request.hostelFees.toLocaleString()}` : '--------';

            doc.fontSize(10).font('Helvetica');
            doc.text(`II. EXAM FEES ** For ${year} year only (1800 x 1)`, 50, additionalY);
            doc.text(examFees, 510, additionalY, { width: 80, align: 'center' });

            doc.text('III. HOSTEL FEES & MESS ADVANCE *** --------', 50, additionalY + 20);
            doc.text(hostelFees, 510, additionalY + 20, { width: 80, align: 'center' });

            // Payment Instructions
            const paymentY = additionalY + 50;
            doc.fontSize(9).text(
                'The above fees should be paid by way of SEPARATE DEMAND DRAFT/S Payable at Hosur as per the details given below.',
                50, paymentY, { align: 'justify' }
            );

            doc.text('**     TUITION FEES IN FAVOUR OF                : ADHIYAMAAN COLLEGE OF ENGG.', 50, paymentY + 20);
            doc.text('**     EXAM FEES IN FAVOUR OF                    : A.C.E.AUTONOMOUS', 50, paymentY + 35);

            // Purpose Statement
            const purposeY = paymentY + 60;
            doc.fontSize(11).font('Helvetica-Bold').text(
                `This Certificate is issued for the purpose of availing ${request.purpose.reason.toUpperCase()} only.`,
                50, purposeY, { align: 'justify' }
            );

            // Signatures
            // Signatures
            const signatureY = 680;

            // Left - Clerk/Office (Blank as requested)
            // doc.fontSize(10).font('Helvetica').text('Clerk/Office', 80, signatureY);
            // doc.text(new Date().toLocaleDateString('en-GB'), 80, signatureY + 15);

            // Center - College Seal
            doc.fontSize(9).text('(College Seal)', 270, signatureY + 30, { align: 'center' });

            // Right - Principal
            doc.fontSize(11).font('Helvetica-Bold').text('PRINCIPAL', 300, signatureY, { width: 245, align: 'right' });
            doc.fontSize(9).font('Helvetica').text('Adhiyamaan College of Engineering (Autonomous)', 300, signatureY + 15, { width: 245, align: 'right' });
            doc.text('Dr.M.G.R. Nagar, HOSUR-635130', 300, signatureY + 28, { width: 245, align: 'right' });

            if (request.deliveryMode === DeliveryMode.DIGITAL) {
                doc.fontSize(8).text('(Digitally Signed)', 300, signatureY + 45, { width: 245, align: 'right' });
            }

            doc.end();
        });
    }
}
