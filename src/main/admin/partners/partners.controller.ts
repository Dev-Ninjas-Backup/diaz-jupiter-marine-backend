import {
  BadRequestException,
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
import multer from 'multer';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { GetPartnerQueryDto } from './dto/get-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './services/partners.service';

@ApiTags('Admin -- Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create partner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @UploadedFiles() files: { logo?: Express.Multer.File[] },
    @Body() dto: CreatePartnerDto,
  ) {
    if (!dto || !dto.site) {
      throw new BadRequestException('Site is required');
    }
    return this.partnersService.create(dto, files?.logo?.[0]);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners' })
  findAll(@Query() dto: GetPartnerQueryDto) {
    return this.partnersService.findAll(dto.site);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by id' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update partner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { logo?: Express.Multer.File[] },
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, dto, files?.logo?.[0]);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete partner' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
