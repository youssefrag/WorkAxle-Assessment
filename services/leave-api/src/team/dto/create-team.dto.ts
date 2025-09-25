import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsInt()
  managerId: number
}