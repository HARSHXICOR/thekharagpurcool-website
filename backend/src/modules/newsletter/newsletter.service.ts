import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: SubscribeDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing && existing.status === 'subscribed') {
      throw new ConflictException('This email is already subscribed to our newsletter.');
    }

    await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        status: 'subscribed', // Automatically subbed for MVP simplicity, or 'pending'
        source: dto.source || 'website',
        confirmedAt: new Date(),
      },
      create: {
        email,
        status: 'subscribed',
        source: dto.source || 'website',
        confirmedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Subscription successful! Thank you for subscribing.',
    };
  }

  async confirm(token: string) {
    // In production, verify JWT/HMAC token. For local testing, we mock
    return {
      success: true,
      message: 'Subscription confirmed successfully.',
    };
  }

  async unsubscribe(token: string) {
    // In production, decrypt subscriber token. For local testing, we mock
    return {
      success: true,
      message: 'You have been successfully unsubscribed.',
    };
  }
}
