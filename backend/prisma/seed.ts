import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // ... کدهای قبلی seed
  await ensureDefaultAppSettings(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

//
// AUTO-ADDED: APPSETTING_DEFAULTS_START
//
async function ensureDefaultAppSettings(prisma: any) {
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.log('No admin found for AppSetting seed.');
    return;
  }

  const defaults = [
    { key: 'max_upload_size', value: '5242880' },
    { key: 'allowed_file_types', value: 'pdf,doc,docx' },
    { key: 'analysis_daily_limit', value: '10' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'default_ai_model', value: 'gpt-4o-mini' }
  ];

  for (const item of defaults) {
    const existing = await prisma.appSetting.findFirst({
      where: { userId: adminUser.id, key: item.key }
    });

    if (!existing) {
      await prisma.appSetting.create({
        data: {
          userId: adminUser.id,
          key: item.key,
          value: item.value
        }
      });
    }
  }
}
//
// AUTO-ADDED: APPSETTING_DEFAULTS_END
//

//
// AUTO-ADDED: APPSETTING_DEFAULTS_INVOKE_START
//
//
// AUTO-ADDED: APPSETTING_DEFAULTS_INVOKE_END
//
