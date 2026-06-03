const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function safeDelete(modelName) {
  try {
    if (prisma[modelName] && prisma[modelName].deleteMany) {
      const result = await prisma[modelName].deleteMany({})
      console.log(`Deleted ${result.count} from ${modelName}`)
    } else {
      console.log(`Skipped ${modelName}: model not found`)
    }
  } catch (e) {
    console.log(`Could not delete ${modelName}: ${e.message}`)
  }
}

async function safeCreateMany(modelName, data, skipDuplicates = true) {
  try {
    if (prisma[modelName] && prisma[modelName].createMany) {
      const result = await prisma[modelName].createMany({
        data,
        skipDuplicates,
      })
      console.log(`Inserted ${result.count} into ${modelName}`)
    } else {
      console.log(`Skipped ${modelName}: model not found`)
    }
  } catch (e) {
    console.log(`Could not createMany ${modelName}: ${e.message}`)
  }
}

async function main() {
  console.log("======================================")
  console.log("FORCE SEED STARTED")
  console.log("======================================")

  const password = "11111111"
  const passwordHash = await bcrypt.hash(password, 10)

  console.log("Cleaning database...")

  // Delete dependent tables first
  await safeDelete("refreshToken")
  await safeDelete("userSkillInsight")
  await safeDelete("jobMatch")
  await safeDelete("resumeAnalysis")
  await safeDelete("analysisHistory")
  await safeDelete("report")
  await safeDelete("dashboardStatCache")
  await safeDelete("resume")

  // Delete base tables
  await safeDelete("skillCatalog")
  await safeDelete("appSetting")
  await safeDelete("user")

  console.log("Creating users...")

  const users = [
    {
      fullName: "Alireza Naseri",
      email: "alirezanaseri369@gmail.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Admin User",
      email: "admin@resume-ai.local",
      passwordHash,
      role: "ADMIN",
    },
    {
      fullName: "Sara Mohammadi",
      email: "sara.mohammadi@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Amir Hosseini",
      email: "amir.hosseini@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Niloofar Karimi",
      email: "niloofar.karimi@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Reza Ahmadi",
      email: "reza.ahmadi@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Mahsa Ebrahimi",
      email: "mahsa.ebrahimi@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Hossein Tavakoli",
      email: "hossein.tavakoli@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Fatemeh Jafari",
      email: "fatemeh.jafari@example.com",
      passwordHash,
      role: "USER",
    },
    {
      fullName: "Pouya Azizi",
      email: "pouya.azizi@example.com",
      passwordHash,
      role: "USER",
    },
  ]

  for (const item of users) {
    const user = await prisma.user.create({
      data: item,
    })

    console.log(`User created: ${user.email}`)
  }

  console.log("Creating skill catalog...")

  await safeCreateMany("skillCatalog", [
    { name: "JavaScript", category: "Programming" },
    { name: "TypeScript", category: "Programming" },
    { name: "Python", category: "Programming" },
    { name: "Java", category: "Programming" },
    { name: "C#", category: "Programming" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Vue.js", category: "Frontend" },
    { name: "HTML", category: "Frontend" },
    { name: "CSS", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "NestJS", category: "Backend" },
    { name: "Express.js", category: "Backend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "Git", category: "Tools" },
    { name: "Machine Learning", category: "AI" },
  ])

  console.log("Creating app settings if model exists...")

  await safeCreateMany("appSetting", [
    { key: "site_name", value: "AI Resume Analyzer" },
    { key: "max_upload_size_mb", value: "10" },
    { key: "default_language", value: "en" },
  ])

  const userCount = await prisma.user.count()
  console.log("======================================")
  console.log(`Seed completed successfully.`)
  console.log(`Users count: ${userCount}`)
  console.log(`Login email: alirezanaseri369@gmail.com`)
  console.log(`Login password: ${password}`)
  console.log(`Admin email: admin@resume-ai.local`)
  console.log(`Admin password: ${password}`)
  console.log("======================================")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
