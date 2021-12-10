import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { UserService } from '../service/user.service';

@Injectable()
export class ValidSignUpAuthCodeGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, signUpAuthCode } = request.body as CreateUserRequestDto;

    const isValid = await this.userService.validateSignUpAuthCode(
      email,
      signUpAuthCode,
    );

    if (!isValid) {
      throw new BadRequestException('인증 번호가 올바르지 않습니다.');
    }

    await this.userService.deleteSignUpAuthCode(email);

    return true;
  }
}
