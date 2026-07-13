-- CreateEnum
CREATE TYPE "ErrandStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ActivityLogType" AS ENUM ('SYSTEM', 'CREATE_EXPENSE', 'EDIT_EXPENSE', 'DELETE_EXPENSE', 'ADD_NOTE', 'DELETE_NOTE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Errand" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN DEFAULT false,
ADD COLUMN     "status" "ErrandStatus" DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "ErrandNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "errandId" TEXT NOT NULL,

    CONSTRAINT "ErrandNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityLogType" NOT NULL,
    "title" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errandId" TEXT NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errandId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrandNote_errandId_idx" ON "ErrandNote"("errandId");

-- CreateIndex
CREATE INDEX "ActivityLog_errandId_idx" ON "ActivityLog"("errandId");

-- CreateIndex
CREATE INDEX "Attachment_errandId_idx" ON "Attachment"("errandId");

-- CreateIndex
CREATE INDEX "Errand_userId_isArchived_status_idx" ON "Errand"("userId", "isArchived", "status");

-- AddForeignKey
ALTER TABLE "ErrandNote" ADD CONSTRAINT "ErrandNote_errandId_fkey" FOREIGN KEY ("errandId") REFERENCES "Errand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_errandId_fkey" FOREIGN KEY ("errandId") REFERENCES "Errand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_errandId_fkey" FOREIGN KEY ("errandId") REFERENCES "Errand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
