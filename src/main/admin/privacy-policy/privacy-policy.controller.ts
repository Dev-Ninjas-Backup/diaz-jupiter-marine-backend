import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SiteType } from 'generated/enums';
import {
  CreatePrivacyPolicyDto,
  UpdatePrivacyPolicyDto,
} from './dto/privacy-policy.dto';
import { PrivacyPolicyService } from './privacy-policy.service';

@ApiTags('Admin Privacy Policy')
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get privacy policy for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.JUPITER,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Privacy policy retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'Privacy policy not found for this site',
  })
  async getPrivacyPolicy(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.privacyPolicyService.getPrivacyPolicy(site);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create privacy policy for a site (only if not exists)',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.JUPITER,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreatePrivacyPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Privacy policy created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Privacy policy already exists for this site. Use PATCH to update.',
  })
  async createPrivacyPolicy(
    @Query('site') site: SiteType,
    @Body() createPrivacyPolicyDto: CreatePrivacyPolicyDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.privacyPolicyService.createPrivacyPolicy(
      site,
      createPrivacyPolicyDto,
    );
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update privacy policy for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.JUPITER,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdatePrivacyPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Privacy policy updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Privacy policy not found for this site. Use POST to create.',
  })
  async updatePrivacyPolicy(
    @Query('site') site: SiteType,
    @Body() updatePrivacyPolicyDto: UpdatePrivacyPolicyDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.privacyPolicyService.updatePrivacyPolicy(
      site,
      updatePrivacyPolicyDto,
    );
  }
}
