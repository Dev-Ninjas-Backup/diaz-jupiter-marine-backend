import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { BoatsComFilterDto } from './boats-com.dto';
import { BoatsComService } from './boats-com.service';

@ApiTags('Shared -- Boats.com Listings')
@Controller('boats-com')
export class BoatsComController {
  constructor(private readonly boatsComService: BoatsComService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of boats.com listings' })
  async getAll(@Query() query: BoatsComFilterDto) {
    return this.boatsComService.getAll(query);
  }

  @Get('ai')
  @ApiOperation({
    summary:
      'Get boats.com listings in Inventory API format for AI consumption',
  })
  async getAiFormat(@Query() query: PaginationDto) {
    return this.boatsComService.getAiFormat(query);
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get a single boats.com listing by documentId' })
  async getOne(@Param('documentId') documentId: string) {
    return this.boatsComService.getOne(documentId);
  }
}
