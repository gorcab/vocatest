import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/service/user.service';
import { Purpose } from '../dtos/SendAuthCodeRequest.dto';

@Injectable()
export class ValidAuthCodeRequest implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { purpose, email, ...restBody } = request.body as {
      purpose: Purpose;
      email: string;
      [key: string]: any;
    };

    const user = await this.userService.findByEmail(email);

    if (purpose === 'SIGN_UP') {
      if (user) {
        throw new BadRequestException('이미 존재하는 이메일입니다.');
      }
    } else if (purpose === 'RESET_PASSWORD') {
      if (!user) {
        throw new BadRequestException('존재하지 않는 이메일입니다.');
      }
    }

    return true;
  }
}
