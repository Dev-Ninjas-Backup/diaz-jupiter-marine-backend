import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/enums';

export class CreatePartnerDto {
  @ApiProperty({ example: 'Florida Yacht', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ enum: SiteType, example: 'JUPITER', required: true })
  @IsEnum(SiteType)
  site: SiteType;
}
