import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { CategoryService } from '../service/category.service';

@Injectable()
export class UsersCategoryGuard implements CanActivate {
  constructor(private readonly categoryService: CategoryService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const categoryRequestDto = request.body as { id: number };

    const category = await this.categoryService.findByUserAndId(
      user,
      categoryRequestDto.id,
    );

    if (!category) {
      throw new UnauthorizedException('올바르지 않은 카테고리입니다.');
    }

    return true;
  }
}
