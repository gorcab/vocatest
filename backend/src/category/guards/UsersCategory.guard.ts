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
    const categoryId =
      request.body.id || request.body.categoryId || request.params.id;

    if (categoryId == null) {
      throw new UnauthorizedException('올바르지 않은 카테고리입니다.');
    }

    const category = await this.categoryService.findByUserAndId(
      user,
      categoryId,
    );

    if (!category) {
      throw new UnauthorizedException('올바르지 않은 카테고리입니다.');
    }

    return true;
  }
}
