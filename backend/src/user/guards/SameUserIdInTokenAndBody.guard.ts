import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SameUserIdInTokenAndParamGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { id, ...restBody } = request.params as {
      id: number;
      [key: string]: any;
    };

    if (Number(id) !== request.user.id) {
      throw new UnauthorizedException('올바르지 않은 접근입니다.');
    }

    return true;
  }
}
