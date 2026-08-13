-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "resume" TEXT,
ADD COLUMN     "salary" INTEGER,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'new';
