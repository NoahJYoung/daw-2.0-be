import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async get(@Request() req) {
    return this.usersService.findAll();
  }

  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  async updateProfile(@Request() req, @Body() updateData: Partial<User>) {
    return this.usersService.updateUser(req.user.id, updateData);
  }
}
