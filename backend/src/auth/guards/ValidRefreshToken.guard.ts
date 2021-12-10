import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Injectable()
export class ValidRefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { refreshToken, email, ...restBody } = request.body as {
      refreshToken: string;
      email: string;
      [key: string]: any;
    };

    const savedRefreshToken = await this.authService.getRefreshToken(email);

    if (
      this.authService.isExpiredToken(refreshToken) ||
      refreshToken !== savedRefreshToken
    ) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
