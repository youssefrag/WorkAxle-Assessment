import {
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
  Request as Req,
  BadRequestException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types/jwt-user';

type AuthenticatedRequest = Request & { user: JwtUser };

@Controller('leave-request')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(ValidationPipe) createLeaveRequestDto: CreateLeaveRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const employeeId = Number(req.user.sub);
    const teamId = Number(req.user.teamId);

    if (!teamId) {
      throw new BadRequestException('Employee not assigned to team');
    }

    return this.leaveRequestService.create(
      createLeaveRequestDto,
      employeeId,
      teamId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const approverId = Number(req.user.sub);
    const requestId = id;

    return this.leaveRequestService.approve(approverId, requestId);
  }
}
