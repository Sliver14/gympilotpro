-- AlterTable
ALTER TABLE "MemberProfile" ADD COLUMN     "birthday" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Attendance_createdAt_idx" ON "Attendance"("createdAt");

-- CreateIndex
CREATE INDEX "MemberProfile_createdAt_idx" ON "MemberProfile"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_deletedAt_createdAt_idx" ON "User"("role", "deletedAt", "createdAt");
