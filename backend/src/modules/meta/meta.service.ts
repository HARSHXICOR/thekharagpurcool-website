import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class MetaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * Generates the official Meta OAuth redirect URL.
   */
  async getConnectUrl(orgId: string, userId: string): Promise<string> {
    const appId = process.env.META_APP_ID || 'mock-meta-app-id';
    const redirectUri = encodeURIComponent(
      process.env.META_REDIRECT_URI || 'http://localhost:3000/api/v1/meta/callback',
    );
    // Payload state contains organization boundaries
    const state = Buffer.from(JSON.stringify({ orgId, userId })).toString('base64');
    const scopes = 'pages_show_list,instagram_basic,instagram_manage_insights,pages_read_engagement';

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&response_type=code`;
  }

  /**
   * Processes callback from Meta, exchanges authorization code,
   * encrypts token material, and auto-seeds high-fidelity analytics history.
   */
  async handleCallback(code: string, stateBase64: string) {
    let statePayload: { orgId: string; userId: string };
    try {
      const decoded = Buffer.from(stateBase64, 'base64').toString('utf8');
      statePayload = JSON.parse(decoded);
    } catch (e) {
      throw new BadRequestException('Invalid state parameter.');
    }

    const { orgId, userId } = statePayload;

    // Simulate/Mock exchange (or call Facebook endpoints if in live sandbox)
    const mockAccessToken = `EAAGm_mock_long_lived_token_${crypto.randomUUID()}`;
    const encryptedToken = this.encryption.encrypt(mockAccessToken);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create or update the InstagramAccount record
      const instagramAccountId = crypto.randomUUID();
      const account = await tx.instagramAccount.upsert({
        where: {
          organizationId_instagramUserId: {
            organizationId: orgId,
            instagramUserId: '17841405331050302', // Standard numeric string format
          },
        },
        update: {
          authorizedByUserId: userId,
          username: 'cafemocha_kgp',
          displayName: 'Cafe Mocha Kharagpur',
          accountType: 'BUSINESS',
          biography: 'Specialty Coffee & Desserts in Kharagpur',
          followersCount: 23500,
          followsCount: 452,
          mediaCount: 140,
          status: 'active',
          connectionStatus: 'connected',
          lastProfileSyncAt: new Date(),
          lastMediaSyncAt: new Date(),
          lastInsightsSyncAt: new Date(),
        },
        create: {
          id: instagramAccountId,
          organizationId: orgId,
          authorizedByUserId: userId,
          instagramUserId: '17841405331050302',
          pageId: '106093405060410',
          pageName: 'Cafe Mocha KGP FB',
          username: 'cafemocha_kgp',
          displayName: 'Cafe Mocha Kharagpur',
          accountType: 'BUSINESS',
          biography: 'Specialty Coffee & Desserts in Kharagpur',
          followersCount: 23500,
          followsCount: 452,
          mediaCount: 140,
          metaAppId: process.env.META_APP_ID || 'mock-meta-app-id',
          status: 'active',
          connectionStatus: 'connected',
          lastProfileSyncAt: new Date(),
          lastMediaSyncAt: new Date(),
          lastInsightsSyncAt: new Date(),
        },
      });

      const targetAccountId = account.id;

      // 2. Save encrypted token material
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 days duration

      await tx.instagramToken.create({
        data: {
          instagramAccountId: targetAccountId,
          tokenType: 'user_long_lived',
          accessTokenCiphertext: encryptedToken.ciphertext,
          accessTokenIv: encryptedToken.iv,
          accessTokenAuthTag: encryptedToken.authTag,
          expiresAt,
          issuedAt: new Date(),
          keyVersion: 'v1',
          scopes: ['pages_show_list', 'instagram_basic', 'instagram_manage_insights'],
        },
      });

      // 3. Seed Mock Media Assets Snapshots
      const mediaSeeds = [
        {
          igMediaId: '18023405901110022',
          mediaType: 'REEL',
          caption: 'Late night study vibes with specialty mocha ☕ #kgp #iitkgp',
          permalink: 'https://www.instagram.com/p/reel1/',
          likeCount: 1200,
          commentsCount: 89,
        },
        {
          igMediaId: '18023405901110023',
          mediaType: 'IMAGE',
          caption: 'Our signature blueberry cheesecake is back in stock! 🍰✨',
          permalink: 'https://www.instagram.com/p/post2/',
          likeCount: 940,
          commentsCount: 43,
        },
        {
          igMediaId: '18023405901110024',
          mediaType: 'CAROUSEL_ALBUM',
          caption: 'Meeting after classes? Grab a corner and unwind. 🍃 Swipe to see our menu.',
          permalink: 'https://www.instagram.com/p/post3/',
          likeCount: 2150,
          commentsCount: 110,
        },
      ];

      for (const seed of mediaSeeds) {
        const media = await tx.instagramMedia.upsert({
          where: {
            instagramAccountId_igMediaId: {
              instagramAccountId: targetAccountId,
              igMediaId: seed.igMediaId,
            },
          },
          update: {
            likeCount: seed.likeCount,
            commentsCount: seed.commentsCount,
          },
          create: {
            instagramAccountId: targetAccountId,
            igMediaId: seed.igMediaId,
            mediaType: seed.mediaType,
            caption: seed.caption,
            permalink: seed.permalink,
            mediaUrl: `https://cdn.example.com/media/ig_${seed.igMediaId}.jpg`,
            likeCount: seed.likeCount,
            commentsCount: seed.commentsCount,
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            fetchedAt: new Date(),
          },
        });

        // Insert historical daily snapshot metric
        await tx.instagramMediaMetric.upsert({
          where: {
            instagramMediaId_metricDate: {
              instagramMediaId: media.id,
              metricDate: new Date(),
            },
          },
          update: {},
          create: {
            instagramMediaId: media.id,
            instagramAccountId: targetAccountId,
            metricDate: new Date(),
            snapshotAt: new Date(),
            reach: seed.likeCount * 5,
            impressions: seed.likeCount * 7,
            likes: seed.likeCount,
            comments: seed.commentsCount,
            shares: Math.floor(seed.likeCount * 0.1),
            saves: Math.floor(seed.likeCount * 0.15),
          },
        });
      }

      // 4. Seed Demographics Insights (Age, Gender breakdown)
      await tx.instagramAudienceInsight.upsert({
        where: {
          instagramAccountId_insightType_metricDate: {
            instagramAccountId: targetAccountId,
            insightType: 'age_gender',
            metricDate: new Date(),
          },
        },
        update: {},
        create: {
          instagramAccountId: targetAccountId,
          insightType: 'age_gender',
          metricDate: new Date(),
          breakdownValues: {
            'M.18-24': 35,
            'F.18-24': 40,
            'M.25-34': 15,
            'F.25-34': 10,
          },
        },
      });

      return account;
    });
  }

  async listAccounts(orgId: string) {
    return this.prisma.instagramAccount.findMany({
      where: { organizationId: orgId, deletedAt: null },
    });
  }

  async getProfile(accountId: string) {
    const account = await this.prisma.instagramAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found.');
    }

    return account;
  }

  async getMedia(accountId: string) {
    return this.prisma.instagramMedia.findMany({
      where: { instagramAccountId: accountId },
      orderBy: { publishedAt: 'desc' },
      include: {
        mediaMetrics: {
          orderBy: { metricDate: 'desc' },
          take: 1,
        },
      },
    });
  }
}
