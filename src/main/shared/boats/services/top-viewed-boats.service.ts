import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TopViewedBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopViewedBoats() {
    // Aggregate page views across both boat detail page patterns
    const topPages = await this.prisma.client.pageView.groupBy({
      by: ['page'],
      where: {
        OR: [
          { page: { startsWith: '/featured-boats/' } },
          { page: { startsWith: '/florida-yacht-trader-mls/' } },
        ],
      },
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
      take: 10,
    });

    const results = await Promise.all(
      topPages.map(
        async (entry: { page: string; _sum: { count: number | null } }) => {
          const viewCount = entry._sum.count ?? 0;
          const page = entry.page;

          if (page.startsWith('/featured-boats/')) {
            const documentId = page.replace('/featured-boats/', '');
            const listing = await this.prisma.client.boatsComListing.findUnique(
              {
                where: { documentId },
              },
            );
            if (!listing) return null;

            const images = Array.isArray(listing.images)
              ? (listing.images as Record<string, unknown>[])
              : [];
            const firstImage = images[0] as Record<string, unknown> | undefined;
            const imageUrl = (firstImage?.uri as string) ?? null;

            return {
              listingId: documentId,
              source: 'boats-com' as const,
              name:
                listing.listingTitle ||
                listing.boatName ||
                `${listing.makeString ?? ''} ${listing.model ?? ''}`.trim(),
              make: listing.makeString ?? null,
              model: listing.model ?? null,
              buildYear: listing.modelYear ?? null,
              price: listing.price ?? null,
              city: listing.city ?? null,
              state: listing.state ?? null,
              imageUrl,
              viewCount,
            };
          }

          if (page.startsWith('/florida-yacht-trader-mls/')) {
            const externalId = page.replace('/florida-yacht-trader-mls/', '');
            const listing =
              await this.prisma.client.yachtBrokerListing.findUnique({
                where: { externalId },
              });
            if (!listing) return null;

            const displayPicture = listing.displayPicture as Record<
              string,
              unknown
            > | null;
            const imageUrl =
              (displayPicture?.large as string) ??
              (displayPicture?.hd as string) ??
              (displayPicture?.medium as string) ??
              null;

            return {
              listingId: externalId,
              source: 'yachtbroker' as const,
              name:
                listing.vesselName ||
                `${listing.manufacturer ?? ''} ${listing.model ?? ''}`.trim(),
              make: listing.manufacturer ?? null,
              model: listing.model ?? null,
              buildYear: listing.year ?? null,
              price: listing.priceUsd ?? null,
              city: listing.city ?? null,
              state: listing.state ?? null,
              imageUrl,
              viewCount,
            };
          }

          return null;
        },
      ),
    );

    return results.filter(Boolean);
  }
}
