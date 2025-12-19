import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateBonafideDto } from './dto/create-bonafide.dto';
import { Role, RequestStatus, DeliveryMode } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BonafideService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService,
        private notificationService: NotificationService
    ) { }

    async create(userId: string, dto: CreateBonafideDto, documents: string[] = []) {
        return this.prisma.bonafideRequest.create({
            data: {
                studentId: userId,
                purposeId: dto.purposeId,
                formalLetterText: dto.formalLetterText,
                deliveryMode: dto.deliveryMode,
                documents: documents,
                status: RequestStatus.PENDING,
                currentApproverRole: Role.TUTOR,
                logs: {
                    create: {
                        approverId: userId,
                        action: 'SUBMITTED',
                        roleAtTime: Role.STUDENT,
                        timestamp: new Date(),
                    },
                },
            },
        });
    }

    async findAll(role: Role, userId: string) {
        const whereClause: any = {};

        if (role === Role.STUDENT) {
            whereClause.studentId = userId;
        }
        // For Tutors/HOD/Principal, they might want to see history of their section/department?
        // For now, let's keep it open for them or filter similarly to findPending.
        // Let's filter by Dept/Section for Tutors in History too to be consistent.
        if (role === Role.TUTOR) {
            const tutor = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { department: true, section: true },
            });
            if (tutor?.department && tutor?.section) {
                whereClause.student = {
                    department: tutor.department,
                    section: tutor.section,
                };
            }
        }

        return this.prisma.bonafideRequest.findMany({
            where: whereClause,
            include: {
                student: true,
                purpose: true,
            },
        });
    }



    async findPending(role: Role, userId?: string) {
        const whereClause: any = {
            currentApproverRole: role,
            status: { in: [RequestStatus.PENDING, RequestStatus.PENDING_FEES_VERIFICATION] },
        };

        // If Tutor, filter by department and section
        if (role === Role.TUTOR && userId) {
            const tutor = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { department: true, section: true },
            });

            if (tutor?.department && tutor?.section) {
                whereClause.student = {
                    department: tutor.department,
                    section: tutor.section,
                };
            }
        }

        return this.prisma.bonafideRequest.findMany({
            where: whereClause,
            include: {
                student: true,
                purpose: true,
            },
        });
    }

    async getReasons() {
        return this.prisma.bonafideReason.findMany({
            where: { isActive: true },
        });
    }

    async approve(id: string, approverId: string, role: Role) {
        const request = await this.prisma.bonafideRequest.findUnique({
            where: { id },
            include: { student: true }
        });
        if (!request) throw new Error('Request not found');

        // Handle different statuses based on workflow stage
        if (role === Role.PRINCIPAL && request.status === RequestStatus.PENDING_FEES_VERIFICATION) {
            // Principal's second approval (after Office fills fees)
            const updatedRequest = await this.prisma.bonafideRequest.update({
                where: { id },
                data: {
                    status: RequestStatus.READY,
                    logs: {
                        create: {
                            approverId,
                            action: 'APPROVED',
                            remarks: 'Final approval by Principal after fee verification',
                            roleAtTime: role,
                            timestamp: new Date(),
                        },
                    },
                },
            });

            if (request.student.email) {
                await this.notificationService.notifyReadyForCollection(request.student.email, request.student.fullName);
            }

            return updatedRequest;
        }

        // Normal approval flow
        if (request.status !== RequestStatus.PENDING) throw new Error('Request not pending');
        if (request.currentApproverRole !== role) throw new Error('Not authorized to approve at this stage');

        const NEXT_ROLE: Partial<Record<Role, Role | null>> = {
            [Role.TUTOR]: Role.HOD,
            [Role.HOD]: Role.PRINCIPAL,
            [Role.PRINCIPAL]: Role.OFFICE,  // After Principal, goes to Office for fees
        };

        const nextRole = NEXT_ROLE[role];
        const newStatus = nextRole ? RequestStatus.PENDING : RequestStatus.APPROVED;

        const updatedRequest = await this.prisma.bonafideRequest.update({
            where: { id },
            data: {
                currentApproverRole: nextRole ?? request.currentApproverRole,
                status: newStatus,
                logs: {
                    create: {
                        approverId,
                        action: 'APPROVED',
                        remarks: 'Approved by ' + role,
                        roleAtTime: role,
                        timestamp: new Date(),
                    },
                },
            },
        });

        if (request.student.email) {
            await this.notificationService.notifyRequestStatus(
                request.student.email,
                newStatus,
                `Your request has been approved by ${role}.`
            );
        }

        return updatedRequest;
    }

    async submitFees(
        id: string,
        approverId: string,
        fees: {
            tuitionFees: number;
            examFees: number;
            hostelFees?: number;
            booksStationery?: number;
            laptopPurchase?: number;
            projectExpenses?: number;
            certificateDate: Date;
        }
    ) {
        const request = await this.prisma.bonafideRequest.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!request) throw new Error('Request not found');
        if (request.currentApproverRole !== Role.OFFICE) throw new Error('Not at Office stage');
        if (request.status !== RequestStatus.PENDING) throw new Error('Request not pending');

        const updatedRequest = await this.prisma.bonafideRequest.update({
            where: { id },
            data: {
                ...fees,
                status: RequestStatus.PENDING_FEES_VERIFICATION,
                currentApproverRole: Role.PRINCIPAL,  // Send back to Principal for verification
                logs: {
                    create: {
                        approverId,
                        action: 'FEES_SUBMITTED',
                        remarks: 'Fee structure submitted by Office',
                        roleAtTime: Role.OFFICE,
                        timestamp: new Date(),
                    },
                },
            },
        });

        if (request.student.email) {
            await this.notificationService.notifyRequestStatus(
                request.student.email,
                RequestStatus.PENDING_FEES_VERIFICATION,
                'Fee structure has been prepared and is pending final verification.'
            );
        }

        return updatedRequest;
    }

    async reject(id: string, approverId: string, role: Role, reason: string) {
        const updatedRequest = await this.prisma.bonafideRequest.update({
            where: { id },
            include: { student: true },
            data: {
                status: RequestStatus.REJECTED,
                rejectionReason: reason,
                logs: {
                    create: {
                        approverId,
                        action: 'REJECTED',
                        remarks: reason,
                        roleAtTime: role,
                        timestamp: new Date(),
                    },
                },
            },
        });

        // Notify Student
        if (updatedRequest.student.email) {
            await this.notificationService.notifyRequestStatus(
                updatedRequest.student.email,
                RequestStatus.REJECTED,
                reason
            );
        }

        return updatedRequest;
    }

    async download(id: string, userId: string, role: Role) {
        const request = await this.prisma.bonafideRequest.findUnique({
            where: { id },
            include: { student: true, purpose: true }
        });

        if (!request) throw new Error('Request not found');
        if (request.status !== RequestStatus.APPROVED &&
            request.status !== RequestStatus.READY &&
            request.status !== RequestStatus.PENDING_FEES_VERIFICATION) {
            throw new Error('Request not approved yet');
        }

        // Allow student (owner) and Office/Principal to download
        if (role === Role.STUDENT && request.studentId !== userId) {
            throw new Error('Unauthorized');
        }

        if (request.deliveryMode === DeliveryMode.PHYSICAL) {
            throw new Error('Physical certificates cannot be downloaded. Please collect from office.');
        }

        return this.pdfService.generateBonafideCertificate(request);
    }
}
