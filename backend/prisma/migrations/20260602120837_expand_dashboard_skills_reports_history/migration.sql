-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('RESUME_ANALYSIS', 'SKILL_SUMMARY', 'JOB_MATCH', 'DASHBOARD_SUMMARY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HistoryEventType" ADD VALUE 'REPORT_CREATED';
ALTER TYPE "HistoryEventType" ADD VALUE 'SETTINGS_UPDATED';

-- CreateTable
CREATE TABLE "SkillCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkillInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardStatCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalResumes" INTEGER NOT NULL DEFAULT 0,
    "analyzedResumes" INTEGER NOT NULL DEFAULT 0,
    "avgAtsScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topSkills" JSONB,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardStatCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillCatalog_name_key" ON "SkillCatalog"("name");

-- CreateIndex
CREATE INDEX "UserSkillInsight_userId_idx" ON "UserSkillInsight"("userId");

-- CreateIndex
CREATE INDEX "UserSkillInsight_skillId_idx" ON "UserSkillInsight"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillInsight_userId_skillId_key" ON "UserSkillInsight"("userId", "skillId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "DashboardStatCache_userId_idx" ON "DashboardStatCache"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardStatCache_userId_key" ON "DashboardStatCache"("userId");

-- CreateIndex
CREATE INDEX "AppSetting_userId_idx" ON "AppSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_userId_key_key" ON "AppSetting"("userId", "key");

-- AddForeignKey
ALTER TABLE "UserSkillInsight" ADD CONSTRAINT "UserSkillInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillInsight" ADD CONSTRAINT "UserSkillInsight_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardStatCache" ADD CONSTRAINT "DashboardStatCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppSetting" ADD CONSTRAINT "AppSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
