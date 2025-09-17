import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor() {}

  // returns the raw profile (from /userinfo) and DB user entity
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async profile(@Req() req) {
    return { 
      profile: req.userProfile,
      user: req.userEntity,
    };
  }

  // explicit sync (guard already syncs, this returns DB user)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sync')
  async sync(@Req() req) {
    return req.userEntity;
  }
}
