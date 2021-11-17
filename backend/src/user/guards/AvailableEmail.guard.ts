import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { SignUpAuthRequestDto } from '../dtos/SignUpAuthRequest.dto';
import { UserService } from '../service/user.service';

@Injectable()
export class AvailableEmailGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signUpAuthRequestDto = request.body as SignUpAuthRequestDto;

    const user = await this.userService.findByEmail(signUpAuthRequestDto.email);

    if (user) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    return true;
  }
}
