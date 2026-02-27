/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `MemberProfile` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `MemberProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MemberProfile" DROP CONSTRAINT "MemberProfile_approvedById_fkey";

-- DropIndex
DROP INDEX "MemberProfile_approvedById_idx";

-- DropIndex
DROP INDEX "Payment_reference_idx";

-- AlterTable
ALTER TABLE "MemberProfile" DROP COLUMN "approvedAt",
DROP COLUMN "approvedById";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ALTER COLUMN "paymentMethod" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "MemberProfile_paymentStatus_idx" ON "MemberProfile"("paymentStatus");

-- CreateIndex
CREATE INDEX "Payment_approvedById_idx" ON "Payment"("approvedById");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
