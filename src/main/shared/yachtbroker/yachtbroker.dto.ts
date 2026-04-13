import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AiQueryDto extends PaginationDto {}

export class YachtBrokerFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by manufacturer',
    example: 'Tiara Yachts',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Filter by model', example: '34 LS' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Filter by year', example: '2023' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ description: 'Filter by condition', example: 'Used' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description: 'Filter by category / boat type',
    example: 'Motor Yacht',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Fort Lauderdale',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by state', example: 'FL' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Keyword search on vesselName, manufacturer, model',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum length in feet', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lengthMin?: number;

  @ApiPropertyOptional({ description: 'Maximum length in feet', example: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lengthMax?: number;

  @ApiPropertyOptional({ description: 'Maximum price in USD', example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Boat type alias — shortcut that filters on category field',
    example: 'Sailboat',
  })
  @IsOptional()
  @IsString()
  boatType?: string;
}
