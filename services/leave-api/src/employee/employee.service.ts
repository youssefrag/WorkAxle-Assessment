import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { AssignTeamDto } from './dto/assign-team.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prismaService: PrismaService) { }
  
  async create(createEmployeeDto: CreateEmployeeDto) {
    return this.prismaService.employee.create({data: createEmployeeDto})
  }

  async assignTeam(id: number, assignTeamDto: AssignTeamDto) {
    const employee = await this.prismaService.employee.findUnique({ where: { id } })
    if (!employee) throw new NotFoundException('Employee not found');
    const team = await this.prismaService.team.findUnique({ where: { id: assignTeamDto.teamId } })
    if (!team) throw new NotFoundException('Team not found');

    return this.prismaService.employee.update({
      where: { id },
      data: { teamId: assignTeamDto.teamId}
    })
  }
}