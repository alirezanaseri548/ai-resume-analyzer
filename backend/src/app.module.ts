import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SkillsModule } from './skills/skills.module';
import { ReportModule } from './report/report.module';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    DashboardModule,
    SkillsModule,
    ReportModule,
    ResumeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
