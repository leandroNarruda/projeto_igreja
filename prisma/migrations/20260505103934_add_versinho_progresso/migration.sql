-- CreateTable
CREATE TABLE "VersinhoProgresso" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VersinhoProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VersinhoProgresso_userId_key" ON "VersinhoProgresso"("userId");

-- AddForeignKey
ALTER TABLE "VersinhoProgresso" ADD CONSTRAINT "VersinhoProgresso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
