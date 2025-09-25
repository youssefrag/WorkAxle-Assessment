import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { toYMD } from './helpers';
import { lastValueFrom } from 'rxjs';
import { PolicyServiceClient, ValidateLeaveRequest } from 'src/policy/types';
import type { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class LeaveRequestService {
  private policy!: PolicyServiceClient;

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('POLICY_PACKAGE') private readonly client: ClientGrpc,
  ) { }
  
  onModuleInit() {
    this.policy = this.client.getService<PolicyServiceClient>('PolicyService')
  }

  async create(createLeaveRequestDto: CreateLeaveRequestDto, employeeId: number, teamId: number) {
    const createdRequest = await this.prismaService.leaveRequest.create({
      data: {
        employeeId,
        teamId,
        startDate: new Date(createLeaveRequestDto.startDate),
        endDate: new Date(createLeaveRequestDto.endDate),
      }
    })

    // Build gRPC request
    const req: ValidateLeaveRequest = {
      employee_id: createdRequest.employeeId,
      team_id: createdRequest.teamId,
      start_date: toYMD(createdRequest.startDate),
      end_date: toYMD(createdRequest.endDate),
      year: createdRequest.startDate.getUTCFullYear()
    }

    // Call policy service
    let ok = false;

    try {
      const res = await lastValueFrom(this.policy.ValidateLeave(req))
      ok = res.ok
    } catch (e) {
      throw new ServiceUnavailableException('Policy service unavailable');
    }

    const newStatus = ok ? 'PENDING_MANAGER' : 'REJECTED_POLICY'
    return this.prismaService.leaveRequest.update({
      where: { id: createdRequest.id },
      data: { status: newStatus }
    })
  }
}