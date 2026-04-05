import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { YachtBrokerFilterDto } from './yachtbroker.dto';
import { YachtBrokerService } from './yachtbroker.service';

@ApiTags('Shared -- YachtBroker Listings')
@Controller('yachtbroker')
export class YachtBrokerController {
  constructor(private readonly yachtBrokerService: YachtBrokerService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of YachtBroker listings' })
  async getAll(@Query() query: YachtBrokerFilterDto) {
    return this.yachtBrokerService.getAll(query);
  }

  @Get('ai')
  @ApiOperation({
    summary:
      'Get YachtBroker listings in Inventory API format for AI consumption',
  })
  async getAiFormat(@Query() query: PaginationDto) {
    return this.yachtBrokerService.getAiFormat(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single YachtBroker listing by external ID' })
  async getOne(@Param('id') id: string) {
    return this.yachtBrokerService.getOne(id);
  }
}
