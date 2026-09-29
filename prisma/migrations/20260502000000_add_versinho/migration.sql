-- CreateTable
CREATE TABLE "Versinho" (
    "id" SERIAL NOT NULL,
    "verso" TEXT NOT NULL,
    "alternativaA" TEXT NOT NULL,
    "alternativaB" TEXT NOT NULL,
    "alternativaC" TEXT NOT NULL,
    "alternativaD" TEXT NOT NULL,
    "alternativaE" TEXT NOT NULL,
    "respostaCorreta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Versinho_pkey" PRIMARY KEY ("id")
);
