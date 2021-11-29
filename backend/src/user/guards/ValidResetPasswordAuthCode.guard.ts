import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ResetPasswordDto } from '../dtos/ResetPassword.dto';
import { UserService } from '../service/user.service';

@Injectable()
export class ValidResetPasswordAuthCodeGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, resetPasswordAuthCode } = request.body as ResetPasswordDto;

    const isValid = await this.userService.validateResetPasswordAuthCode(
      email,
      resetPasswordAuthCode,
    );

    if (!isValid) {
      throw new BadRequestException('인증 번호가 올바르지 않습니다.');
    }

    return true;
  }
}
