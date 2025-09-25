import {Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { TeamService } from "./team.service";
import { CreateTeamDto } from "./dto/create-team.dto";

@Controller('team')
export class TeamController{
  constructor(private readonly teamService: TeamService) { }
  
  @Post()
  create(@Body(ValidationPipe) createTeamDto: CreateTeamDto) {
    return this.teamService.create(createTeamDto)
  }
}