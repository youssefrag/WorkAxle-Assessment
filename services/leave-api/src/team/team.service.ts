import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prismaService: PrismaService) { }
  
  async create(createTeamDto: CreateTeamDto) {
    const manager = await this.prismaService.employee.findUnique({ where: { id: createTeamDto.managerId } })
    if (!manager) throw new NotFoundException('Manager not found');
    return this.prismaService.team.create({ data : createTeamDto})
  }
}