import { Controller, Get, Post, Patch, Body, Res, Req, InternalServerErrorException, UnauthorizedException, BadRequestException, UseGuards  } from '@nestjs/common';
import type { Response, Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, GetUserDto, UpdatePasswordDto, UpdateUserRoleDto,UpdateUserDto } from './entities/users.dto';
import { UserLogger } from '../logger/user-logger.service';
import type { Session } from 'express-session';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUserId } from './decorators/current-user-id.decorater';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: UserLogger, // <-- Logger injiziert
  ) {}

  // --------------------
  // Login
  // --------------------
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request & { session: Session & { userId?: string } },
  ) {
    this.logger.log(`[UsersController] Login attempt for email: ${body.email}`);

    try {
      const userId = await this.usersService.validateUser(body.email, body.password);
      if (!userId) {
        this.logger.warn(`[UsersController] Invalid credentials for email: ${body.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      req.session.userId = userId;
      this.logger.log(`[UsersController] Login successful for userId: ${userId}`);
      return { message: 'Login erfolgreich', userId };
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`[UsersController] Error during login for email: ${body.email}`, err.stack);
        throw err;
      } else {
        this.logger.error(`[UsersController] Unknown error during login for email: ${body.email}`);
        throw new UnauthorizedException('Unknown error');
      }
    }
  }

  // --------------------
  // Logout
  // --------------------
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.logger.log('[UsersController] Logout attempt');

    req.session.destroy((err) => {
      if (err) {
        this.logger.error('[UsersController] Session destroy error', err.stack);
      } else {
        this.logger.log('[UsersController] Session destroyed successfully');
      }
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
    this.logger.log(`[UsersController] Create user attempt: ${createUserDto.email}`);

    try {
      const user = await this.usersService.create(createUserDto);

      req.session.userId = user.id;
      this.logger.log(`[UsersController] User created successfully: ${user.email} (ID: ${user.id})`);

      return user;
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`[UsersController] Error creating user ${createUserDto.email}: ${err.message}`, err.stack);
        throw new BadRequestException(err.message);
      }
      this.logger.error(`[UsersController] Unknown error creating user ${createUserDto.email}`);
      throw new BadRequestException('Unknown error');
    }
  }

  // --------------------
  // Check Session
  // --------------------
  @Get('check-session')
  async checkCookie(
    @Req() req: Request & { session: Session & { userId?: string } }
  ) {
    const loggedIn = !!req.session.userId;
    this.logger.log(`[UsersController] Check-cookie: loggedIn=${loggedIn}`);
    return { loggedIn };
  }

  // --------------------
  // Get current user
  // --------------------
  @Get('me')
  async getUserData(
    @Req() req: Request & { session: Session & { userId?: string } }
  ) {
    const userId = req.session.userId;
    if (!userId) {
      this.logger.warn('[UsersController] getUserData: Not logged in');
      throw new UnauthorizedException('Not logged in');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn(`[UsersController] getUserData: User not found for ID: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.log(`[UsersController] getUserData: Returning user ${user.email}`);
    return user;
  }

  // --------------------
// Update password
// --------------------
@Patch('updatePassword')
@UseGuards(AuthGuard)
async updatePassword(
  @CurrentUserId() userId: string,
  @Body() body: UpdatePasswordDto,
  @Req() req: Request & { session: Session & { userId?: string } }
) {

  if (!userId) {
    this.logger.warn('[UsersController] updatePassword: decorator has no userId found');
    throw new InternalServerErrorException('Problem with the userId');
  }

  const success = await this.usersService.updatePassword(
    userId,
    body.currentPassword,
    body.newPassword
  );

  if (!success) {
    this.logger.warn(
      `[UsersController] updatePassword: Invalid current password for userId ${userId}`
    );
    throw new BadRequestException('Current password is incorrect');
  }

  this.logger.log(
    `[UsersController] updatePassword: Password updated for userId ${userId}`
  );

  return { message: 'Password updated successfully' };
}

  // --------------------
// Update UserRole
// --------------------
@Patch('updateUserRole')
@UseGuards(AdminGuard)
async updateUserRole(
  @Body() body: UpdateUserRoleDto,
  @Req() req: Request & { session: Session & { userId?: string } }
) {

  if (!body.userId) {
    this.logger.error('[UsersController] updateUserRole: no userId in the Request');
    throw new BadRequestException('Problem with the userId');
  }

  const success = await this.usersService.updateUserRole(
    body.userId,
    body.isAdmin
  );

  if (!success) {
    this.logger.warn(
      `[UsersController] updateUserRole: update UserRole not worked ${body.userId}`
    );
    throw new BadRequestException('Problems with upadte USerRole');
  }

  this.logger.log(
    `[UsersController] updateUserRole: Password updated for userId ${body.userId}`
  );

  return { message: 'UserRole updated successfully' };
}

// --------------------
// Update UserData
// --------------------
@Patch('updateUserData')
@UseGuards(AuthGuard)
async updateUserData(
  @CurrentUserId() userId: string,
  @Body() body: UpdateUserDto,
  @Req() req: Request & { session: Session & { userId?: string } }
) {

  if (!userId) {
    this.logger.warn('[UsersController] updateUserData: decorator has no userId found');
    throw new InternalServerErrorException('Problem with the userId');
  }

  const success = await this.usersService.updateUser(
    userId,
    body
  );

  if (!success) {
    this.logger.warn(
      `[UsersController] updateUserData: Problem by updating Data from User ${userId}`
    );
    throw new BadRequestException('Problem with updating');
  }

  this.logger.log(
    `[UsersController] updateUserData: UserData updated for userId ${userId}`
  );

  return { message: 'UserData updated successfully' };
}
}