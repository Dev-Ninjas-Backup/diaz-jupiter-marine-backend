import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiQueryDto, BoatsComFilterDto } from './boats-com.dto';
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
    description:
      'Returns paginated boat listings transformed into the Inventory API format (PascalCase fields: DocumentID, MakeString, BoatLocation, Engines, Images, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of boats in Inventory API format',
    schema: {
      example: {
        success: true,
        message: 'Boats found successfully from Inventory API',
        data: [
          {
            Source: 'inventory',
            DocumentID: '10132456',
            LastModificationDate: '2026-04-01',
            ItemReceivedDate: '2026-03-30',
            OriginalPrice: '42000 USD',
            Price: '42000.00 USD',
            BoatLocation: {
              BoatCityName: 'Bradenton',
              BoatCountryID: 'US',
              BoatStateCode: 'FL',
            },
            MakeString: 'Sea Hunt',
            ModelYear: 2016,
            Model: 'Ultra 225',
            BeamMeasure: '8.5 ft',
            FuelTankCapacityMeasure: '84|gallon',
            TotalEnginePowerQuantity: '200 hp',
            NominalLength: '22.42 ft',
            LengthOverall: '23 ft',
            Engines: [
              {
                Make: 'Yamaha',
                Model: 'F200',
                Fuel: 'unleaded',
                EnginePower: '200|horsepower',
                Type: 'Outboard',
                Year: 2016,
                Hours: 285,
              },
            ],
            GeneralBoatDescription: ['<p>Description HTML...</p>'],
            AdditionalDetailDescription: ['<strong>Features</strong>...'],
            Images: {
              Priority: '0',
              Caption: 'Boat image caption',
              Uri: 'https://images.boatsgroup.com/...',
            },
          },
        ],
        metadata: {
          page: 1,
          limit: 10,
          total: 22,
          totalPage: 3,
        },
      },
    },
  })
  async getAiFormat(@Query() query: AiQueryDto) {
    return this.boatsComService.getAiFormat(query);
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get a single boats.com listing by documentId' })
  async getOne(@Param('documentId') documentId: string) {
    return this.boatsComService.getOne(documentId);
  }
}
