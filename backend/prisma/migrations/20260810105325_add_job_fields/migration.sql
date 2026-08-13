-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "location" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "salary" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'full-time';
