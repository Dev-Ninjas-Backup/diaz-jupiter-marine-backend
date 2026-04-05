import { PermissionEnum } from '@/common/enum/permission.enum';
import { RequirePermission } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import multer from 'multer';
import { CreateAISearchBannerDto } from './dto/create-aisearchbanner.dto';
import { UpdateAISearchBannerDto } from './dto/update-aisearchbanner.dto';
import { AISearchBannerService } from './services/aisearchbanner.service';

@ApiTags('Admin -- AI Search Banner (JUPITER Site Only)')
@Controller('ai-search-banner')
export class AISearchBannerController {
  constructor(private readonly aiSearchBannerService: AISearchBannerService) {}

  @Get()
  @ApiOperation({ summary: 'Get AI search banner for JUPITER site' })
  findAll() {
    return this.aiSearchBannerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI search banner by ID' })
  findOne(@Param('id') id: string) {
    return this.aiSearchBannerService.findOne(id);
  }

  @Post()
  @RequirePermission(PermissionEnum.AI_SEARCH_BANNER_MANAGE)
  @ApiOperation({ summary: 'Create AI search banner for JUPITER site' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAISearchBannerDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aisearchBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @UploadedFiles() files: { aisearchBanner?: Express.Multer.File[] },
    @Body() dto: CreateAISearchBannerDto,
  ) {
    return this.aiSearchBannerService.create(dto, files.aisearchBanner?.[0]);
  }

  @Patch(':id')
  @RequirePermission(PermissionEnum.AI_SEARCH_BANNER_MANAGE)
  @ApiOperation({ summary: 'Update AI search banner for JUPITER site' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateAISearchBannerDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aisearchBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { aisearchBanner?: Express.Multer.File[] },
    @Body() dto: UpdateAISearchBannerDto,
  ) {
    return this.aiSearchBannerService.update(
      id,
      dto,
      files.aisearchBanner?.[0],
    );
  }

  @Delete(':id')
  @RequirePermission(PermissionEnum.AI_SEARCH_BANNER_MANAGE)
  @ApiOperation({ summary: 'Delete AI search banner for JUPITER site' })
  remove(@Param('id') id: string) {
    return this.aiSearchBannerService.remove(id);
  }
}
