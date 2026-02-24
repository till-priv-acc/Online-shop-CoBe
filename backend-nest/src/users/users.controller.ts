import { Controller, Get, Post, Body, Res, UnauthorizedException, BadRequestException  } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, GetUserDto } from './entities/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --------------------
  // Login
  // --------------------
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    // validateUser prüft Email + gehashtes Passwort und gibt nur ID zurück
    const userId = await this.usersService.validateUser(body.email, body.password);
    if (!userId) throw new UnauthorizedException('Invalid credentials');

    // Cookie setzen (HttpOnly, minimalistisch)
    res.cookie('userId', userId, { httpOnly: true });

    return { message: 'Login erfolgreich', userId };
  }

  // --------------------
  // Logout
  // --------------------
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Cookie löschen
    res.clearCookie('userId');
    return { message: 'Logout erfolgreich' };
  }

  // --------------------
  // Create User
  // --------------------
  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<GetUserDto> {
    try {
      const user = await this.usersService.create(createUserDto);

      // Optional: User direkt nach Erstellung einloggen
      res.cookie('userId', user.id, { httpOnly: true });

      return user; // GetUserDto ohne Passwort
    } catch (err) {
        if (err instanceof Error) {
            throw new BadRequestException(err.message);
        }
        throw new BadRequestException('Unknown error');
    }
  }
  // --------------------
  // Get User Data
  // --------------------
  @Get('me')
  async getUserData(@Res({ passthrough: true }) res: Response): Promise<GetUserDto> {
    const userId = res.req.cookies['userId'];
    if (!userId) throw new UnauthorizedException('Not logged in');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return user; // Already a GetUserDto, Passwort nicht enthalten
  }
}