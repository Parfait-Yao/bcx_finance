import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('users/me')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.usersService.getProfile(user.userId);
  }

  // Endpoint dashboard allégé : réponse < 3 Ko
  @Get('dashboard')
  getDashboard(@CurrentUser() user: { userId: string }) {
    return this.usersService.getDashboard(user.userId);
  }
}
