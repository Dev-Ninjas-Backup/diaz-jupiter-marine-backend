import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SiteType } from 'generated/enums';

export class GetPartnerQueryDto {
  @ApiPropertyOptional({ enum: SiteType, example: 'JUPITER' })
  @IsEnum(SiteType)
  @IsOptional()
  site?: SiteType;
}
