-- Create print history table to track all printed labels
CREATE TABLE IF NOT EXISTS "PrintHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labelType" TEXT,
    "partNo" TEXT,
    "partDescription" TEXT,
    "lotNo" TEXT,
    "quantity" TEXT,
    "productName" TEXT,
    "labelCount" INTEGER NOT NULL DEFAULT 1,
    "printedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintHistory_pkey" PRIMARY KEY ("id")
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "PrintHistory_userId_idx" ON "PrintHistory"("userId");
CREATE INDEX IF NOT EXISTS "PrintHistory_printedAt_idx" ON "PrintHistory"("printedAt");
CREATE INDEX IF NOT EXISTS "PrintHistory_labelType_idx" ON "PrintHistory"("labelType");

-- Add foreign key constraint
ALTER TABLE "PrintHistory" ADD CONSTRAINT "PrintHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
