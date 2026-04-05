import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateAssignmentMemberDto } from './create-assignment-member.dto';

export class UpdateAssignmentMemberDto extends PartialType(
  CreateAssignmentMemberDto,
) {
  @ApiPropertyOptional({
    example: true,
    description: 'Whether this member is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
