import {
  Controller,
  Get,
  Query,
  Param,
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
}
