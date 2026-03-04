-- Lowercase all emails in User table
UPDATE "User" SET "email" = LOWER(TRIM("email"));

-- Lowercase all emails in PasswordResetToken table
UPDATE "PasswordResetToken" SET "email" = LOWER(TRIM("email"));
