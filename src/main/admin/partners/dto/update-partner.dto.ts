import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/enums';

export class UpdatePartnerDto {
  @ApiPropertyOptional({ example: 'Florida Yacht' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Premium boat trading, brokerage & listings',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://floridayachttrader.com' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Partner logo file',
  })
  logo?: any;

  @ApiPropertyOptional({ enum: SiteType })
  @IsEnum(SiteType)
  @IsOptional()
  site?: SiteType;
}
