-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "SplitStatus" AS ENUM ('PENDING', 'PARTIALLY_APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'USER_PAID_FULL');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "minimumBalance" DECIMAL(65,30) NOT NULL DEFAULT 250,
ADD COLUMN     "monthlyBudget" DECIMAL(65,30) NOT NULL DEFAULT 5000;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "excludeFromBudget" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_requests" (
    "id" TEXT NOT NULL,
    "originalAmount" DECIMAL(65,30) NOT NULL,
    "splitAmount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "SplitStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedAmount" DECIMAL(65,30),
    "userPaidFull" BOOLEAN NOT NULL DEFAULT false,
    "requesterId" TEXT NOT NULL,
    "requesterAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_participants" (
    "id" TEXT NOT NULL,
    "splitRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "accountId" TEXT,
    "status" "SplitStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friendships_requesterId_idx" ON "friendships"("requesterId");

-- CreateIndex
CREATE INDEX "friendships_addresseeId_idx" ON "friendships"("addresseeId");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_requesterId_addresseeId_key" ON "friendships"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "split_requests_requesterId_idx" ON "split_requests"("requesterId");

-- CreateIndex
CREATE INDEX "split_requests_requesterAccountId_idx" ON "split_requests"("requesterAccountId");

-- CreateIndex
CREATE INDEX "split_participants_userId_idx" ON "split_participants"("userId");

-- CreateIndex
CREATE INDEX "split_participants_splitRequestId_idx" ON "split_participants"("splitRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "split_participants_splitRequestId_userId_key" ON "split_participants"("splitRequestId", "userId");

-- CreateIndex
CREATE INDEX "transactions_accountId_date_idx" ON "transactions"("accountId", "date");

-- CreateIndex
CREATE INDEX "transactions_accountId_type_idx" ON "transactions"("accountId", "type");

-- CreateIndex
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_requests" ADD CONSTRAINT "split_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_requests" ADD CONSTRAINT "split_requests_requesterAccountId_fkey" FOREIGN KEY ("requesterAccountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_participants" ADD CONSTRAINT "split_participants_splitRequestId_fkey" FOREIGN KEY ("splitRequestId") REFERENCES "split_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_participants" ADD CONSTRAINT "split_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_participants" ADD CONSTRAINT "split_participants_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
