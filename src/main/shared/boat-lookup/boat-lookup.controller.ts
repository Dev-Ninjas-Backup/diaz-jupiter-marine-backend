import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BoatLookupService } from './boat-lookup.service';

@ApiTags('Shared -- Boat Lookup (AI)')
@Controller('boat-lookup')
export class BoatLookupController {
  constructor(private readonly boatLookupService: BoatLookupService) {}

  @Get(':id')
  @ApiParam({
    name: 'id',
    description:
      'Boat ID returned by the AI server. Will be matched against Boats.com documentId first, then YachtBroker externalId.',
    example: '10132456',
  })
  @ApiOperation({
    summary: 'Resolve an AI-returned boat ID to a full boat detail',
    description:
      'Accepts a boat ID from the AI search server and returns the full listing detail. ' +
      'Searches Boats.com first (by documentId), then YachtBroker (by externalId). ' +
      'The response includes a `source` field ("boats-com" | "yachtbroker") and a ' +
      '`sourceUrl` field indicating the canonical detail endpoint for that source.',
  })
  @ApiResponse({
    status: 200,
    description: 'Boat found',
    schema: {
      example: {
        success: true,
        message: 'Boat found in Boats.com',
        data: {
          source: 'boats-com',
          sourceUrl: '/boats-com/10132456',
          documentId: '10132456',
          makeString: 'Sea Hunt',
          model: 'Ultra 225',
          modelYear: 2016,
          price: 42000,
          city: 'Bradenton',
          state: 'FL',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Boat not found in any source',
  })
  async lookupById(@Param('id') id: string) {
    return this.boatLookupService.lookupById(id);
  }
}
