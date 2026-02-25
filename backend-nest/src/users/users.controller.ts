import { Controller, Get, Post, Body, Res, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import type { Session } from 'express-session';
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
  @Req() req: Request & { session: Session & { userId?: string } },
) {
  const userId = await this.usersService.validateUser(body.email, body.password);
  if (!userId) throw new UnauthorizedException('Invalid credentials');

  // Session speichern
  req.session.userId = userId;

  return { message: 'Login erfolgreich', userId };
}

  // --------------------
  // Logout
  // --------------------
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    req.session.destroy(err => {
      if (err) console.error('Session destroy error:', err);
    });
    return { message: 'Logout erfolgreich' };
  }

  // --------------------
  // Create User
  // --------------------
  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<GetUserDto> {
    try {
      const user = await this.usersService.create(createUserDto);

      // Session direkt nach Erstellung setzen
      req.session.userId = user.id;

      return user; // GetUserDto ohne Passwort
    } catch (err) {
      if (err instanceof Error) {
        throw new BadRequestException(err.message);
      }
      throw new BadRequestException('Unknown error');
    }
  }

@Get('check-cookie')
async checkCookie(
  @Req() req: Request & { session: Session & { userId?: string } }
) {
  return { loggedIn: !!req.session.userId };
}

@Get('me')
async getUserData(
  @Req() req: Request & { session: Session & { userId?: string } }
) {
  const userId = req.session.userId;
  if (!userId) throw new UnauthorizedException('Not logged in');

  const user = await this.usersService.findById(userId);
  if (!user) throw new UnauthorizedException('User not found');

  return user;
}
}