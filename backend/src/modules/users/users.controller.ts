import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@GetUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  async updateMe(
    @GetUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(userId, updateUserDto);
  }

  @Get('me/sessions')
  async getSessions(@GetUser('id') userId: string) {
    return this.usersService.getSessions(userId);
  }

  @Delete('me/sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.usersService.revokeSession(userId, sessionId);
  }
}
