-- CreateTable
CREATE TABLE "Biblia" (
    "id" SERIAL NOT NULL,
    "verso" TEXT NOT NULL,
    "alternativaA" TEXT NOT NULL,
    "alternativaB" TEXT NOT NULL,
    "alternativaC" TEXT NOT NULL,
    "alternativaD" TEXT NOT NULL,
    "alternativaE" TEXT NOT NULL,
    "respostaCorreta" TEXT NOT NULL,
    "ranking" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Biblia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BibliaProgresso" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibliaProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BibliaProgresso_userId_key" ON "BibliaProgresso"("userId");

-- AddForeignKey
ALTER TABLE "BibliaProgresso" ADD CONSTRAINT "BibliaProgresso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
