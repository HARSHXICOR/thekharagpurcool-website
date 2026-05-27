import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    return this.newsletterService.subscribe(subscribeDto);
  }

  @Public()
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(@Body('token') token: string) {
    return this.newsletterService.confirm(token);
  }

  @Public()
  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Body('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }
}
