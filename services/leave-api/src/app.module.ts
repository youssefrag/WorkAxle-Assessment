import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { TeamModule } from './team/team.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';

@Module({
  imports: [PrismaModule, AuthModule, EmployeeModule, TeamModule, LeaveRequestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
