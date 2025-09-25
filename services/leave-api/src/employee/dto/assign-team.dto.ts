import { IsInt } from "class-validator";

export class AssignTeamDto {
  @IsInt()
  teamId: number
}