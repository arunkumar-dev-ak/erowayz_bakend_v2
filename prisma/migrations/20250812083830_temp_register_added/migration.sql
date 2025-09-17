-- CreateTable
CREATE TABLE "TempRegister" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "fcmToken" TEXT,
    "status" "OTPStatus" NOT NULL DEFAULT 'PENDING',
    "licenseRelPath" TEXT,
    "licenseAbsPath" TEXT,
    "profileRelPath" TEXT,
    "profileAbsPath" TEXT,
    "shopRelPath" TEXT,
    "shopAbsPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempRegister_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempRegister_cacheKey_key" ON "TempRegister"("cacheKey");
