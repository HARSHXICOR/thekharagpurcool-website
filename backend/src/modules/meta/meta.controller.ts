import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Headers,
  Req,
  Body,
  UseGuards,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { MetaService } from './meta.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../auth/guards/org-membership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('connect-url')
  async getConnectUrl(
    @Query('orgId') orgId: string,
    @GetUser('id') userId: string,
    @GetUser() user: any,
  ) {
    if (!orgId) {
      throw new ForbiddenException('orgId parameter is required.');
    }

    // Tenant check
    if (user.defaultRole === 'client_user') {
      const belongs = user.memberships.some((m: any) => m.organizationId === orgId);
      if (!belongs) {
        throw new ForbiddenException('Access denied.');
      }
    }

    const url = await this.metaService.getConnectUrl(orgId, userId);
    return { url };
  }

  @Public() // Webhook callback is public
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: express.Response,
  ) {
    if (!code || !state) {
      throw new ForbiddenException('Missing code or state parameters from callback.');
    }
    const account = await this.metaService.handleCallback(code, state);
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'https://thekharagpurcool.vercel.app';
    return res.redirect(`${frontendOrigin}/dashboard?connected=true&username=${account.username}`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  async listAccounts(
    @Query('orgId') orgId: string,
    @GetUser() user: any,
  ) {
    if (!orgId) {
      throw new ForbiddenException('orgId query parameter is required.');
    }

    // Tenant check
    if (user.defaultRole === 'client_user') {
      const belongs = user.memberships.some((m: any) => m.organizationId === orgId);
      if (!belongs) {
        throw new ForbiddenException('Access denied.');
      }
    }

    return this.metaService.listAccounts(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts/:id/profile')
  async getProfile(@Param('id') id: string) {
    return this.metaService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts/:id/media')
  async getMedia(@Param('id') id: string) {
    return this.metaService.getMedia(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts/:id/demographics')
  async getDemographics(@Param('id') id: string) {
    return this.metaService.getDemographics(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts/:id/follower-growth')
  async getFollowerGrowth(@Param('id') id: string) {
    return this.metaService.getFollowerGrowth(id);
  }

  @Public()
  @Get('webhook')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: express.Response,
  ) {
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'my-secure-verify-token';
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Meta webhook verification successful.');
      return res.status(200).send(challenge);
    } else {
      console.error('Meta webhook verification failed: Token mismatch.');
      return res.status(403).send('Verification token mismatch.');
    }
  }

  @Public()
  @Post('webhook')
  async handleWebhookEvent(
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: any,
    @Res() res: express.Response,
  ) {
    const appSecret = process.env.META_APP_SECRET || 'mock-meta-app-secret';

    if (signature && req.rawBody) {
      const crypto = require('crypto');
      const parts = signature.split('=');
      if (parts.length === 2 && parts[0] === 'sha256') {
        const signatureHash = parts[1];
        const expectedHash = crypto
          .createHmac('sha256', appSecret)
          .update(req.rawBody)
          .digest('hex');

        const sigBuffer = Buffer.from(signatureHash, 'hex');
        const expectedBuffer = Buffer.from(expectedHash, 'hex');

        if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
          console.error('Meta webhook signature validation failed.');
          return res.status(401).send('Signature verification failed.');
        }
      }
    }

    console.log('Received Meta Webhook Event Notification:', JSON.stringify(req.body, null, 2));

    return res.status(200).send('EVENT_RECEIVED');
  }
}
