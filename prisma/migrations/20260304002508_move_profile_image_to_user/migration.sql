-- AlterTable: Add profileImage to User
ALTER TABLE "User" ADD COLUMN "profileImage" TEXT;

-- Data Migration: Copy profileImage from MemberProfile to User
UPDATE "User"
SET "profileImage" = mp."profileImage"
FROM "MemberProfile" mp
WHERE "User"."id" = mp."userId";

-- AlterTable: Drop profileImage from MemberProfile
ALTER TABLE "MemberProfile" DROP COLUMN "profileImage";
