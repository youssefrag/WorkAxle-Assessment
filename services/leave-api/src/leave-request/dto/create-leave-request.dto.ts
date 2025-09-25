import { IsDateString, IsNotEmpty, IsInt } from "class-validator";

export class CreateLeaveRequestDto {

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}