import { Body, Controller, Param, Patch, Post, ParseIntPipe, ValidationPipe } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { AssignTeamDto } from "./dto/assign-team.dto";

@Controller('employee')
export class EmployeeController{
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  create(@Body(ValidationPipe) createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto)
  }

  @Patch(':id/team')
  assignTeam(@Param('id', ParseIntPipe,) id: number, @Body(ValidationPipe) assignTeamDto: AssignTeamDto) {
    return this.employeeService.assignTeam(id, assignTeamDto)
  }
}