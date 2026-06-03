import { ENVEnum } from '@/common/enum/env.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Controller, Get, Headers, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

const CRAWLER_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|Telegram/i;

const DEFAULT_IMAGE = 'https://jupitermarinesales.com/default-preview.jpg';

function escapeHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildOgHtml(
  title: string,
  description: string,
  imageUrl: string,
  canonicalUrl: string,
): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
  </head>
  <body>
    <p>Redirecting to Jupiter Marine Sales...</p>
  </body>
</html>`;
}

@ApiTags('Share')
@Controller('share')
export class ShareController {
  private readonly deepLinkBaseUrl: string;
  private readonly shareBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.deepLinkBaseUrl = this.configService.getOrThrow<string>(
      ENVEnum.DEEP_LINK_BASE_URL,
    );
    this.shareBaseUrl = this.configService.getOrThrow<string>(ENVEnum.BASE_URL);
  }

  @Get('boats-com/:documentId')
  @ApiOperation({
    summary:
      'Share a Boats.com listing (OG preview for crawlers, deep-link for users)',
  })
  async shareBoatsCom(
    @Param('documentId') documentId: string,
    @Headers('user-agent') userAgent: string = '',
    @Res() res: Response,
  ): Promise<void> {
    if (CRAWLER_PATTERN.test(userAgent)) {
      try {
        const listing = await this.prisma.client.boatsComListing.findUnique({
          where: { documentId },
        });

        if (listing) {
          const images = Array.isArray(listing.images)
            ? (listing.images as Record<string, unknown>[])
            : [];
          const imageUrl = escapeHtml(
            (images[0]?.uri as string) ?? DEFAULT_IMAGE,
          );

          const name =
            listing.listingTitle ??
            `${listing.makeString ?? ''} ${listing.model ?? ''}`.trim();
          const title = escapeHtml(`${name} | Jupiter Marine Sales`);

          const priceStr =
            listing.price != null
              ? `$${Number(listing.price).toLocaleString()}`
              : 'Contact for price';
          const lengthStr =
            listing.nominalLength != null
              ? ` — ${listing.nominalLength} ft`
              : '';
          const description = escapeHtml(
            `${listing.modelYear ?? ''} ${listing.makeString ?? ''} ${listing.model ?? ''}${lengthStr} | Price: ${priceStr}`.trim(),
          );

          const canonicalUrl = escapeHtml(
            `${this.shareBaseUrl}/share/boats-com/${documentId}`,
          );

          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(buildOgHtml(title, description, imageUrl, canonicalUrl));
          return;
        }
      } catch {
        // Fall through to deep-link redirect on any DB error
      }
    }

    res.redirect(`${this.deepLinkBaseUrl}/boat?id=${documentId}`);
  }

  @Get('yachtbroker/:id')
  @ApiOperation({
    summary:
      'Share a YachtBroker listing (OG preview for crawlers, deep-link for users)',
  })
  async shareYachtBroker(
    @Param('id') externalId: string,
    @Headers('user-agent') userAgent: string = '',
    @Res() res: Response,
  ): Promise<void> {
    if (CRAWLER_PATTERN.test(userAgent)) {
      try {
        const listing = await this.prisma.client.yachtBrokerListing.findUnique({
          where: { externalId },
        });

        if (listing) {
          const displayPicture = listing.displayPicture as Record<
            string,
            unknown
          > | null;
          const imageUrl = escapeHtml(
            ((displayPicture?.large ??
              displayPicture?.hd ??
              displayPicture?.medium) as string | undefined) ?? DEFAULT_IMAGE,
          );

          const name =
            listing.vesselName ??
            `${listing.manufacturer ?? ''} ${listing.model ?? ''}`.trim();
          const title = escapeHtml(`${name} | Jupiter Marine Sales`);

          const priceStr =
            listing.priceUsd != null
              ? `$${Number(listing.priceUsd).toLocaleString()}`
              : 'Contact for price';
          const lengthStr =
            listing.displayLengthFeet != null
              ? ` — ${listing.displayLengthFeet} ft`
              : '';
          const description = escapeHtml(
            `${listing.year ?? ''} ${listing.manufacturer ?? ''} ${listing.model ?? ''}${lengthStr} | Price: ${priceStr}`.trim(),
          );

          const canonicalUrl = escapeHtml(
            `${this.shareBaseUrl}/share/yachtbroker/${externalId}`,
          );

          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(buildOgHtml(title, description, imageUrl, canonicalUrl));
          return;
        }
      } catch {
        // Fall through to deep-link redirect on any DB error
      }
    }

    res.redirect(`${this.deepLinkBaseUrl}/boat?id=${externalId}`);
  }
}
