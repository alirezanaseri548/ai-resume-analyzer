import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReportController],
})
export class ReportModule {}
