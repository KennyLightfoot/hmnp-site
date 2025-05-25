/*
  Warnings:

  - A unique constraint covering the columns `[externalCalendarId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "externalCalendarId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Service_externalCalendarId_key" ON "Service"("externalCalendarId");
