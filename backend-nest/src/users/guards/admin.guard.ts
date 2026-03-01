import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.session?.userId;

    if (!userId) {
      throw new UnauthorizedException('Not logged in');
    }

    // User-Daten holen
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Prüfung auf type "ADMIN" statt isAdmin
    if (user.type !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admin only.');
    }

    req.userId = userId; // User-ID bleibt verfügbar
    return true;
  }
}