const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const prisma = new PrismaClient()

async function run() {
  const out = {}

  async function safe(name, fn) {
    try {
      out[name] = await fn()
    } catch (e) {
      out[name] = { error: e.message }
    }
  }

  await safe("user_count", () => prisma.user.count())
  await safe("resume_count", () => prisma.resume.count())
  await safe("resumeAnalysis_count", () => prisma.resumeAnalysis.count())
  await safe("analysisHistory_count", () => prisma.analysisHistory.count())
  await safe("skillCatalog_count", () => prisma.skillCatalog.count())
  await safe("userSkillInsight_count", () => prisma.userSkillInsight.count())
  await safe("refreshToken_count", () => prisma.refreshToken.count())
  await safe("jobMatch_count", () => prisma.jobMatch.count())
  await safe("report_count", () => prisma.report.count())
  await safe("appSetting_count", () => prisma.appSetting.count())
  await safe("dashboardStatCache_count", () => prisma.dashboardStatCache.count())

  await safe("users", () => prisma.user.findMany({ take: 50 }))
  await safe("skills", () => prisma.skillCatalog.findMany({ take: 50 }))
  await safe("resumes", () => prisma.resume.findMany({ take: 50 }))
  await safe("reports", () => prisma.report.findMany({ take: 50 }))
  await safe("appSettings", () => prisma.appSetting.findMany({ take: 50 }))
  await safe("dashboardStatCache", () => prisma.dashboardStatCache.findMany({ take: 50 }))

  fs.writeFileSync("db-inspect.json", JSON.stringify(out, null, 2), "utf8")
  console.log("Written to db-inspect.json")
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
