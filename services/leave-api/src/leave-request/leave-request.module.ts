import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestService } from './leave-request.service';
import { PolicyClientModule } from '../policy/policy.client.module';

@Module({
  imports: [PrismaModule, AuthModule, PolicyClientModule],
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService]
})
export class LeaveRequestModule {}