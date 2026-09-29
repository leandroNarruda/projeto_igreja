-- AlterTable: set database-level default for updatedAt so raw inserts don't require it
ALTER TABLE "Versinho" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
