import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostStatus, SchemaType } from 'generated/client';

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  blogTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  blogDescription: string;

  @ApiProperty({ enum: PostStatus, example: 'DRAFT', required: true })
  @IsEnum(PostStatus)
  postStatus: PostStatus;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  blogImage?: Express.Multer.File;

  // SEO Metadata
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  focusKeyword?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((s) => s.trim());
      }
    }
    return value;
  })
  @IsArray()
  secondaryKeywords?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  robotsIndex?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  robotsFollow?: boolean;

  // Social / Open Graph & Twitter Cards
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  twitterImageUrl?: string;

  // Editorial & Author Information
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorBio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  publishedAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  featuredImageAlt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  featuredImageCaption?: string;

  // Content Clusters, Pillars & Series
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPillarPage?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentClusterId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seriesName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  seriesOrder?: number;

  // Self-referential Previous & Next Articles
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  previousArticleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nextArticleId?: string;

  // Structured Data (JSON-LD) & FAQs
  @ApiProperty({ enum: SchemaType, required: false, default: 'ARTICLE' })
  @IsOptional()
  @IsEnum(SchemaType)
  schemaType?: SchemaType;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  faqSection?: any;
}
