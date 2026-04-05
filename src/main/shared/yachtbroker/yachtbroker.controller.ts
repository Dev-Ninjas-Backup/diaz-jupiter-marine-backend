import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiQueryDto, YachtBrokerFilterDto } from './yachtbroker.dto';
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
    description:
      'Returns paginated YachtBroker listings transformed into the Inventory API format (PascalCase fields: DocumentID, MakeString, BoatLocation, Engines, Images, etc.)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Paginated list of YachtBroker vessels in Inventory API format',
    schema: {
      example: {
        success: true,
        message: 'Boats found successfully from Inventory API',
        data: [
          {
            Source: 'inventory',
            DocumentID: '12345',
            LastModificationDate: '2026-04-06',
            ItemReceivedDate: '2026-04-06',
            OriginalPrice: '197000 USD',
            Price: '197000.00 USD',
            BoatLocation: {
              BoatCityName: 'Fort Lauderdale',
              BoatCountryID: 'US',
              BoatStateCode: 'FL',
            },
            MakeString: 'Tiara Yachts',
            ModelYear: 2023,
            Model: '34 LS',
            ListingTitle: 'Vessel Name',
            BeamMeasure: '11 ft',
            TotalEnginePowerQuantity: '800 hp',
            NominalLength: '34.75 ft',
            LengthOverall: '34.75 ft',
            Engines: [
              {
                Make: 'Mercury',
                Model: '400XL Verado',
                Fuel: 'unleaded',
                EnginePower: '400|horsepower',
                Type: 'Outboard',
                Year: 2023,
                Hours: 210,
              },
            ],
            GeneralBoatDescription: ['<p>Description HTML...</p>'],
            AdditionalDetailDescription: ['Summary text', 'Notable upgrades'],
            Images: {
              Priority: '0',
              Caption: null,
              Uri: 'https://cdn.yachtbroker.org/...',
            },
          },
        ],
        metadata: {
          page: 1,
          limit: 10,
          total: 50,
          totalPage: 5,
        },
      },
    },
  })
  async getAiFormat(@Query() query: AiQueryDto) {
    return this.yachtBrokerService.getAiFormat(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single YachtBroker listing by external ID' })
  async getOne(@Param('id') id: string) {
    return this.yachtBrokerService.getOne(id);
  }
}
