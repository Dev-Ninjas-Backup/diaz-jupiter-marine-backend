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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogService } from './services/blog.service';

@ApiTags('Admin -- Blog')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all blogs' })
  findAll() {
    return this.blogService.findAll();
  }

  @Get('shared-link/:sharedLink')
  @ApiOperation({ summary: 'Get blog by shared link' })
  findBySharedLink(@Param('sharedLink') sharedLink: string) {
    return this.blogService.findBySharedLink(sharedLink);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Post()
  @RequirePermission(PermissionEnum.BLOG_MANAGE)
  @ApiOperation({ summary: 'Create a blog post' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('blogImage', { storage: multer.memoryStorage() }),
  )
  create(
    @Body() dto: CreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogService.create(dto, file);
  }

  @Patch(':id')
  @RequirePermission(PermissionEnum.BLOG_MANAGE)
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('blogImage', { storage: multer.memoryStorage() }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogService.update(id, dto, file);
  }

  @Delete(':id')
  @RequirePermission(PermissionEnum.BLOG_MANAGE)
  @ApiOperation({ summary: 'Delete blog post' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
