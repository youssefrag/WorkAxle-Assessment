import { Body, Controller, Post, UseGuards, ValidationPipe, Request as Req, BadRequestException } from "@nestjs/common";
import type { Request } from 'express';
import { LeaveRequestService } from "./leave-request.service";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtUser } from "../auth/types/jwt-user";

type AuthenticatedRequest = Request & {user: JwtUser}

@Controller('leave-request')
export class LeaveRequestController{
  constructor(private readonly leaveRequestService: LeaveRequestService) { }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body(ValidationPipe) createLeaveRequestDto: CreateLeaveRequestDto, @Req() req: AuthenticatedRequest) {

    const employeeId = Number(req.user.sub)
    const teamId = Number(req.user.teamId)

    if (!teamId) {
      throw new BadRequestException('Employee not assigned to team');
    }

    console.log({ employeeId, teamId })

    return this.leaveRequestService.create(createLeaveRequestDto, employeeId, teamId)
  }
}