import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchBoatsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by make / brand',
    example: 'Sea Hunt',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ description: 'Filter by model', example: 'Ultra 225' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Filter by build year', example: 2020 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

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

  @ApiPropertyOptional({ description: 'Maximum price in USD', example: 200000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Boat type / category (e.g. Motorboat, Sailboat, Yacht)',
    example: 'Motorboat',
  })
  @IsOptional()
  @IsString()
  boatType?: string;

  @ApiPropertyOptional({
    description: 'Location — matches city or state from both sources',
    example: 'Miami',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
