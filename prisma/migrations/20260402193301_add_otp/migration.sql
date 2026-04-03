-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OtpCode_email_purpose_key" ON "OtpCode"("email", "purpose");
