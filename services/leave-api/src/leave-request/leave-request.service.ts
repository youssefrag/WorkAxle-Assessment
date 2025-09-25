import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prismaService: PrismaService) {
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

    console.log('Leave Request Created ✅')
  }
}