import { PermissionEnum } from '@/common/enum/permission.enum';
import { GetUser, RequirePermission } from '@/common/jwt/jwt.decorator';
import { FileType, MulterService } from '@/lib/multer/multer.service';
import {
  BoatListingDto,
  ExtraDetailItemDto,
} from '@/main/seller/boats/dto/boats.dto';
import { CreateBoatsInfoDto } from '@/main/seller/boats/dto/boats-info.dto';
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
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BoatImageType } from 'generated/enums';
import { ListingFilterDto } from './dto/listing-filter.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { AdminCreateListingService } from './services/admincreate-listing.service';
import { QueueFile } from './services/adminboat-listing-helper.service';
import { ListingManagementService } from './services/listing-management.service';

@ApiTags('Admin -- Listing Management')
@ApiExtraModels(UpdateListingDto, ExtraDetailItemDto)
@Controller('admin/listings')
export class ListingManagementController {
  constructor(
    private readonly service: ListingManagementService,
    private readonly AdminCreateListingService: AdminCreateListingService,
  ) {}

  @Get()
  @RequirePermission(PermissionEnum.LISTINGS_VIEW)
  @ApiOperation({ summary: 'Get all yacht listings' })
  getAll(@Query() query: ListingFilterDto) {
    return this.service.getAll(query);
  }

  @Get(':id')
  @RequirePermission(PermissionEnum.LISTINGS_VIEW)
  @ApiOperation({ summary: 'Get single yacht listing by ID' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  @RequirePermission(PermissionEnum.LISTINGS_UPDATE)
  @ApiOperation({ summary: 'Update a yacht listing' })
  @ApiBody({
    type: UpdateListingDto,
    description: 'Update yacht listing fields. All fields are optional.',
    examples: {
      example1: {
        summary: 'Update name and price',
        value: { name: 'Sapphire', price: 125000.5 },
      },
      example2: { summary: 'Update status', value: { status: 'ACTIVE' } },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.service.update(id, dto);
  }

  @Post('admin-create-listing')
  @RequirePermission(PermissionEnum.LISTINGS_CREATE)
  @ApiOperation({ summary: 'Create admin Boat Listing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BoatListingDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'covers', maxCount: 5 },
        { name: 'galleries', maxCount: 100 },
      ],
      new MulterService().createMultipleFileOptions({
        destinationFolder: './temp',
        prefix: 'boat_listing',
        fileType: FileType.IMAGE,
        maxFileCount: 150,
      }),
    ),
  )
  async admincreateListing(
    @GetUser('sub') userId: string,
    @Body() data: { boatInfo: CreateBoatsInfoDto },
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    const mappedFiles: QueueFile[] = [
      ...(files.covers || []).map((file) => ({
        path: file.path,
        type: BoatImageType.COVER,
        originalName: file.originalname,
      })),
      ...(files.galleries || []).map((file) => ({
        path: file.path,
        type: BoatImageType.GALLERY,
        originalName: file.originalname,
      })),
    ];
    return this.AdminCreateListingService.admincreateListing(
      userId,
      data,
      mappedFiles,
    );
  }

  @Delete(':id')
  @RequirePermission(PermissionEnum.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Delete a yacht listing' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
