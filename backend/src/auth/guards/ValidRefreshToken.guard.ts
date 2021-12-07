import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../service/auth.service';

@Injectable()
export class ValidRefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { refreshToken, ...restBody } = request.body as {
      refreshToken: string;
      [key: string]: any;
    };

    if (this.authService.isExpiredToken(refreshToken)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
