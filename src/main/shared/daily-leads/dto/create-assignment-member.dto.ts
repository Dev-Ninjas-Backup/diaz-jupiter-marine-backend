import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAssignmentMemberDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Team member email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Team member full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 0,
    description:
      'Notification order — 0 = first to receive lead email, 1 = second, etc.',
  })
  @IsInt()
  @Min(0)
  order: number;
}
