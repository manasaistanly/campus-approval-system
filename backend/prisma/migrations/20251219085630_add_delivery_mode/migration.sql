-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('PHYSICAL', 'DIGITAL');

-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'READY';

-- AlterTable
ALTER TABLE "BonafideRequest" ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'PHYSICAL';
