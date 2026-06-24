import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VideoMetricType } from '@prisma/client';

@Injectable()
export class MetaCapabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Probes the Meta Graph API for a specific account's metrics capabilities.
   * Runs offline (during initial link, refresh, or weekly sync) to prevent rate limits.
   */
  async probeAccountCapabilities(accountId: string, token: string): Promise<void> {
    const account = await this.prisma.instagramAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) return;

    const isMock = !token || token.startsWith('EAAGm_mock_');

    if (isMock) {
      // Mock account has full capabilities enabled
      await this.prisma.instagramAccount.update({
        where: { id: accountId },
        data: {
          supportsDemographics: true,
          supportsCountryBreakdown: true,
          supportsCityBreakdown: true,
          supportsHistoricalFollowerInsights: true,
          videoMetricType: VideoMetricType.VIEWS,
        },
      });
      return;
    }

    let supportsDemographics = false;
    let supportsCountryBreakdown = false;
    let supportsCityBreakdown = false;
    let supportsHistoricalFollowerInsights = false;
    let videoMetricType: VideoMetricType | null = null;

    // 1. Probe Demographics
    try {
      const demographicsRes = await fetch(
        `https://graph.instagram.com/v25.0/${account.instagramUserId}/insights?metric=follower_demographics&period=lifetime&access_token=${token}`,
      );

      if (demographicsRes.ok) {
        const demoData = await demographicsRes.json();
        const valueObj = demoData.data?.[0]?.values?.[0]?.value || {};
        
        // Check if there are keys returned in demographics
        if (Object.keys(valueObj).length > 0) {
          supportsDemographics = true;
          if (valueObj.country && Object.keys(valueObj.country).length > 0) {
            supportsCountryBreakdown = true;
          }
          if (valueObj.city && Object.keys(valueObj.city).length > 0) {
            supportsCityBreakdown = true;
          }
        }
      }
    } catch (err) {
      console.error(`Meta Probe demographics error for account ${accountId}:`, err);
    }

    // 2. Probe Follower History
    try {
      const historyRes = await fetch(
        `https://graph.instagram.com/v25.0/${account.instagramUserId}/insights?metric=follower_count&period=day&access_token=${token}`,
      );

      if (historyRes.ok) {
        const historyData = await historyRes.ok ? await historyRes.json() : null;
        if (historyData?.data?.[0]?.values && historyData.data[0].values.length > 0) {
          supportsHistoricalFollowerInsights = true;
        }
      }
    } catch (err) {
      console.error(`Meta Probe follower history error for account ${accountId}:`, err);
    }

    // 3. Probe Video Metric Type
    try {
      // Fetch latest media to find a video/reel
      const mediaListRes = await fetch(
        `https://graph.instagram.com/v25.0/me/media?fields=id,media_type&limit=10&access_token=${token}`,
      );

      if (mediaListRes.ok) {
        const mediaList = await mediaListRes.json();
        const videoItem = (mediaList.data || []).find(
          (m: any) => m.media_type === 'REEL' || m.media_type === 'VIDEO',
        );

        if (videoItem) {
          // Attempt views metric (v22.0+ standard)
          const viewsRes = await fetch(
            `https://graph.instagram.com/v25.0/${videoItem.id}/insights?metric=views&access_token=${token}`,
          );
          if (viewsRes.ok) {
            videoMetricType = VideoMetricType.VIEWS;
          } else {
            // Attempt legacy plays metric
            const playsRes = await fetch(
              `https://graph.instagram.com/v25.0/${videoItem.id}/insights?metric=plays&access_token=${token}`,
            );
            if (playsRes.ok) {
              videoMetricType = VideoMetricType.PLAYS;
            } else {
              // Attempt legacy video_views metric
              const vvRes = await fetch(
                `https://graph.instagram.com/v25.0/${videoItem.id}/insights?metric=video_views&access_token=${token}`,
              );
              if (vvRes.ok) {
                videoMetricType = VideoMetricType.VIDEO_VIEWS;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Meta Probe video metrics error for account ${accountId}:`, err);
    }

    // Default to VIEWS if no video item was found but other insights are accessible
    if (!videoMetricType && supportsDemographics) {
      videoMetricType = VideoMetricType.VIEWS;
    }

    // Save discovered capabilities to the database
    await this.prisma.instagramAccount.update({
      where: { id: accountId },
      data: {
        supportsDemographics,
        supportsCountryBreakdown,
        supportsCityBreakdown,
        supportsHistoricalFollowerInsights,
        videoMetricType,
      },
    });
  }
}
