import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AiQueryDto extends PaginationDto {}

export class BoatsComFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by make/brand',
    example: 'Sea Hunt',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ description: 'Filter by model', example: 'Ultra 225' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Filter by model year', example: '2020' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ description: 'Filter by condition / sale class code' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: 'Filter by city', example: 'Miami' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by state', example: 'FL' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Keyword search on title, make, model' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum length in feet', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lengthMin?: number;

  @ApiPropertyOptional({ description: 'Maximum length in feet', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lengthMax?: number;

  @ApiPropertyOptional({ description: 'Maximum price in USD', example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Boat type / category code (e.g. Sailboat, Motorboat, Yacht)',
    example: 'Motorboat',
  })
  @IsOptional()
  @IsString()
  boatType?: string;
}
