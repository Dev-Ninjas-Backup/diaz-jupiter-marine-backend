import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private makeSharedLink(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateBlogDto, file?: Express.Multer.File) {
    let fileRecord = null;

    if (file) {
      const uploaded = await this.s3.uploadFiles([file]);
      fileRecord = uploaded.data.files[0];
    }

    const sharedLink = dto.slug || this.makeSharedLink(dto.blogTitle);

    const existing = await this.prisma.client.blog.findFirst({
      where: { sharedLink },
    });

    if (existing) {
      throw new ConflictException(
        'Blog with the same shared link already exists',
      );
    }

    const cleanDescription = dto.blogDescription?.replace(
      /&nbsp;|\u00a0/g,
      ' ',
    );

    return this.prisma.client.blog.create({
      data: {
        blogTitle: dto.blogTitle,
        blogDescription: cleanDescription,
        postStatus: dto.postStatus,
        sharedLink: sharedLink,
        blogImageId: fileRecord?.id,
        // SEO Metadata
        seoTitle: dto.seoTitle || dto.blogTitle,
        metaDescription: dto.metaDescription,
        focusKeyword: dto.focusKeyword,
        secondaryKeywords: dto.secondaryKeywords || [],
        slug: dto.slug || sharedLink,
        canonicalUrl: dto.canonicalUrl,
        robotsIndex: dto.robotsIndex ?? true,
        robotsFollow: dto.robotsFollow ?? true,
        // Social OG & Twitter
        ogTitle: dto.ogTitle || dto.seoTitle || dto.blogTitle,
        ogDescription: dto.ogDescription || dto.metaDescription,
        ogImageUrl: dto.ogImageUrl,
        twitterTitle: dto.twitterTitle || dto.seoTitle || dto.blogTitle,
        twitterDescription: dto.twitterDescription || dto.metaDescription,
        twitterImageUrl: dto.twitterImageUrl,
        // Editorial
        authorName: dto.authorName,
        authorBio: dto.authorBio,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
        featuredImageAlt: dto.featuredImageAlt,
        featuredImageCaption: dto.featuredImageCaption,
        // Clusters & Series
        isPillarPage: dto.isPillarPage ?? false,
        parentClusterId: dto.parentClusterId,
        seriesName: dto.seriesName,
        seriesOrder: dto.seriesOrder,
        previousArticleId: dto.previousArticleId,
        nextArticleId: dto.nextArticleId,
        // Schema & FAQs
        schemaType: dto.schemaType || 'ARTICLE',
        faqSection: dto.faqSection || null,
      },
      include: { blogImage: true },
    });
  }

  async findAll() {
    const blogs = await this.prisma.client.blog.findMany({
      include: { blogImage: true },
      orderBy: { createdAt: 'desc' },
    });

    const withViews = await Promise.all(
      blogs.map(async (blog) => {
        const viewCount = await this.getBlogPageViews(blog.sharedLink);
        return { ...blog, pageViewCount: viewCount };
      }),
    );

    return withViews;
  }

  async findOne(id: string) {
    let blog = await this.prisma.client.blog.findFirst({
      where: {
        OR: [{ id }, { sharedLink: id }, { slug: id }],
      },
      include: { blogImage: true },
    });

    if (!blog) {
      const allBlogs = await this.prisma.client.blog.findMany({
        include: { blogImage: true },
      });
      blog =
        allBlogs.find((b) => this.makeSharedLink(b.blogTitle) === id) || null;
    }

    if (!blog) throw new NotFoundException('Blog not found');
    const viewCount = await this.getBlogPageViews(blog.sharedLink || id);
    return { ...blog, pageViewCount: viewCount };
  }

  async update(id: string, dto: UpdateBlogDto, file?: Express.Multer.File) {
    await this.findOne(id);

    let fileRecord = null;

    if (file) {
      const uploaded = await this.s3.uploadFiles([file]);
      fileRecord = uploaded.data.files[0];
    }

    const sharedLink = dto.slug
      ? dto.slug
      : dto.blogTitle
        ? this.makeSharedLink(dto.blogTitle)
        : undefined;

    const { blogTitle, blogDescription, postStatus } = dto;
    const cleanUpdateDescription = blogDescription?.replace(
      /&nbsp;|\u00a0/g,
      ' ',
    );

    return this.prisma.client.blog.update({
      where: { id },
      data: {
        blogTitle,
        blogDescription: cleanUpdateDescription,
        postStatus,
        sharedLink,
        blogImageId: fileRecord ? fileRecord.id : undefined,
        // SEO Metadata
        seoTitle: dto.seoTitle,
        metaDescription: dto.metaDescription,
        focusKeyword: dto.focusKeyword,
        secondaryKeywords: dto.secondaryKeywords,
        slug: dto.slug,
        canonicalUrl: dto.canonicalUrl,
        robotsIndex: dto.robotsIndex,
        robotsFollow: dto.robotsFollow,
        // Social OG & Twitter
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        ogImageUrl: dto.ogImageUrl,
        twitterTitle: dto.twitterTitle,
        twitterDescription: dto.twitterDescription,
        twitterImageUrl: dto.twitterImageUrl,
        // Editorial
        authorName: dto.authorName,
        authorBio: dto.authorBio,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        featuredImageAlt: dto.featuredImageAlt,
        featuredImageCaption: dto.featuredImageCaption,
        // Clusters & Series
        isPillarPage: dto.isPillarPage,
        parentClusterId: dto.parentClusterId,
        seriesName: dto.seriesName,
        seriesOrder: dto.seriesOrder,
        previousArticleId: dto.previousArticleId,
        nextArticleId: dto.nextArticleId,
        // Schema & FAQs
        schemaType: dto.schemaType,
        faqSection: dto.faqSection,
      },
      include: { blogImage: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.blog.delete({
      where: { id },
    });
  }

  async findBySharedLink(sharedLink: string) {
    const blog = await this.prisma.client.blog.findFirst({
      where: { sharedLink },
      include: { blogImage: true },
    });

    if (!blog) throw new NotFoundException('Blog not found');

    const viewCount = await this.getBlogPageViews(sharedLink);

    return { ...blog, pageViewCount: viewCount };
  }

  private async getBlogPageViews(sharedLink: string): Promise<number> {
    const page = `/blogs/${sharedLink}`;

    const views = await this.prisma.client.pageView.aggregate({
      _sum: { count: true },
      where: { page },
    });

    return views._sum.count ?? 0;
  }
}
