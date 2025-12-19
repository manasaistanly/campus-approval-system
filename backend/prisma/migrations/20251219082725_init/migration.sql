-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TUTOR', 'HOD', 'PRINCIPAL', 'OFFICE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fullName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registerNumber" TEXT,
    "department" TEXT,
    "year" TEXT,
    "fatherName" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonafideReason" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BonafideReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonafideRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "purposeId" TEXT NOT NULL,
    "formalLetterText" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "currentApproverRole" "Role" NOT NULL DEFAULT 'TUTOR',
    "rejectionReason" TEXT,
    "qrCodeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonafideRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScholarshipRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scholarshipName" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "currentApproverRole" "Role" NOT NULL DEFAULT 'OFFICE',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScholarshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "scholarshipRequestId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "tuitionFee" DECIMAL(65,30) NOT NULL,
    "examFee" DECIMAL(65,30) NOT NULL,
    "otherFee" DECIMAL(65,30) NOT NULL,
    "totalFee" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLog" (
    "id" TEXT NOT NULL,
    "bonafideRequestId" TEXT,
    "scholarshipRequestId" TEXT,
    "approverId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "remarks" TEXT,
    "roleAtTime" "Role" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_registerNumber_key" ON "User"("registerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BonafideReason_reason_key" ON "BonafideReason"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_scholarshipRequestId_key" ON "FeeStructure"("scholarshipRequestId");

-- AddForeignKey
ALTER TABLE "BonafideRequest" ADD CONSTRAINT "BonafideRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonafideRequest" ADD CONSTRAINT "BonafideRequest_purposeId_fkey" FOREIGN KEY ("purposeId") REFERENCES "BonafideReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScholarshipRequest" ADD CONSTRAINT "ScholarshipRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_scholarshipRequestId_fkey" FOREIGN KEY ("scholarshipRequestId") REFERENCES "ScholarshipRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_bonafideRequestId_fkey" FOREIGN KEY ("bonafideRequestId") REFERENCES "BonafideRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_scholarshipRequestId_fkey" FOREIGN KEY ("scholarshipRequestId") REFERENCES "ScholarshipRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
