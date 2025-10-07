-- CreateTable
CREATE TABLE "public"."CoinsSettlement" (
    "id" TEXT NOT NULL,
    "walletTransactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinsSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoinsSettlementFile" (
    "id" TEXT NOT NULL,
    "proofImage" TEXT NOT NULL,
    "coinsSettlementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinsSettlementFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoinsSettlement_walletTransactionId_key" ON "public"."CoinsSettlement"("walletTransactionId");

-- AddForeignKey
ALTER TABLE "public"."CoinsSettlement" ADD CONSTRAINT "CoinsSettlement_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "public"."WalletTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoinsSettlementFile" ADD CONSTRAINT "CoinsSettlementFile_coinsSettlementId_fkey" FOREIGN KEY ("coinsSettlementId") REFERENCES "public"."CoinsSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
