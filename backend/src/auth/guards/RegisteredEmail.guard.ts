import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class RegisteredEmailGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, ...restBody } = request.body as {
      email: string;
      [key: string]: any;
    };

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('존재하지 않는 이메일입니다.');
    }

    return true;
  }
}
