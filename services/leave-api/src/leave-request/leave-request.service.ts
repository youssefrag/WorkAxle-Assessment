import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { toYMD, calculateDays } from './helpers';
import { lastValueFrom } from 'rxjs';
import {
  PolicyServiceClient,
  ValidateLeaveRequest,
  RecordApprovalRequest,
} from 'src/policy/types';
import type { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class LeaveRequestService {
  private policy!: PolicyServiceClient;

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('POLICY_PACKAGE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.policy = this.client.getService<PolicyServiceClient>('PolicyService');
  }

  async create(
    createLeaveRequestDto: CreateLeaveRequestDto,
    employeeId: number,
    teamId: number,
  ) {
    const createdRequest = await this.prismaService.leaveRequest.create({
      data: {
        employeeId,
        teamId,
        startDate: new Date(createLeaveRequestDto.startDate),
        endDate: new Date(createLeaveRequestDto.endDate),
      },
    });

    // Build gRPC request
    const req: ValidateLeaveRequest = {
      employee_id: createdRequest.employeeId,
      team_id: createdRequest.teamId,
      start_date: toYMD(createdRequest.startDate),
      end_date: toYMD(createdRequest.endDate),
      year: createdRequest.startDate.getUTCFullYear(),
    };

    // Call policy service
    let ok = false;

    try {
      const res = await lastValueFrom(this.policy.ValidateLeave(req));
      ok = res.ok;
    } catch (e) {
      throw new ServiceUnavailableException('Policy service unavailable');
    }

    const newStatus = ok ? 'PENDING_MANAGER' : 'REJECTED_POLICY';
    return this.prismaService.leaveRequest.update({
      where: { id: createdRequest.id },
      data: { status: newStatus },
    });
  }

  async approve(approverId: number, requestId: number) {
    const leaveRequest = await this.prismaService.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!leaveRequest) throw new NotFoundException('Leave request not found');

    const { teamId, status } = leaveRequest;

    if (status !== 'PENDING_MANAGER')
      throw new ConflictException('This request is not pending approval');

    const team = await this.prismaService.team.findUnique({
      where: { id: teamId },
    });

    if (!team) throw new NotFoundException('Team not found');

    const { managerId } = team;

    if (approverId !== managerId)
      throw new ForbiddenException(
        'You are not allowed to approve this leave request',
      );

    // BuildgRPC request

    const req: RecordApprovalRequest = {
      employee_id: leaveRequest.employeeId,
      team_id: leaveRequest.teamId,
      start_date: toYMD(leaveRequest.startDate),
      end_date: toYMD(leaveRequest.endDate),
      year: leaveRequest.startDate.getUTCFullYear(),
      days: calculateDays(leaveRequest.startDate, leaveRequest.endDate),
    };

    // Call policy service

    try {
      await lastValueFrom(this.policy.RecordApproval(req));
    } catch (error) {
      throw new ServiceUnavailableException('Policy service unavailable');
    }

    // After policy-svc adds approved request

    return this.prismaService.leaveRequest.update({
      where: { id: leaveRequest.id },
      data: { status: 'APPROVED' },
    });
  }
}
