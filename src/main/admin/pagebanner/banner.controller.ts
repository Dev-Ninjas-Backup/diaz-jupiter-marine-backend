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
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';
import { CreateBannerDto } from './dto/create-banner.dto';
import { GetBannerQueryDto } from './dto/get-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerService } from './services/banner.service';

@ApiTags('Admin -- Page Banners')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  async getAll() {
    return this.bannerService.findAll();
  }

  @Get('single')
  @ApiOperation({ summary: 'Get banner by page + site' })
  async findOne(@Query() dto: GetBannerQueryDto) {
    return this.bannerService.findOneByPageAndSite(dto.page, dto.site);
  }

  @Post()
  @RequirePermission(PermissionEnum.BANNER_MANAGE)
  @ApiOperation({ summary: 'Create a banner with file uploads' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'background', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  async create(
    @UploadedFiles() files: { background?: Express.Multer.File[] },
    @Body() dto: CreateBannerDto,
  ) {
    return this.bannerService.createBannerWithFiles(dto, files);
  }

  @Patch(':id')
  @RequirePermission(PermissionEnum.BANNER_MANAGE)
  @ApiOperation({ summary: 'Update banner (with optional file uploads)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'background', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; background?: Express.Multer.File[] },
    @Body() dto: UpdateBannerDto,
  ) {
    return this.bannerService.updateBanner(id, dto, files);
  }

  @Delete(':id')
  @RequirePermission(PermissionEnum.BANNER_MANAGE)
  @ApiOperation({ summary: 'Delete banner' })
  async delete(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
