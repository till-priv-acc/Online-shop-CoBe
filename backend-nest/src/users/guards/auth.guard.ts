import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const userId = req.session?.userId;

    if (!userId) {
      throw new UnauthorizedException('Not logged in');
    }

    req.userId = userId; // Speichert User-ID im Request
    return true;
  }
}