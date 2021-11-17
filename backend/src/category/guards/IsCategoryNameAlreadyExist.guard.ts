import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UpdateCategoryDto } from '../dtos/UpdateCategory.dto';
import { CategoryService } from '../service/category.service';

@Injectable()
export class IsCategoryNameAlreadyExistGuard implements CanActivate {
  constructor(private readonly categoryService: CategoryService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const categoryRequestDto = request.body as UpdateCategoryDto;

    const category = await this.categoryService.findByUserAndName(
      user,
      categoryRequestDto.name,
    );

    if (category) {
      throw new BadRequestException('이미 존재하는 카테고리명입니다.');
    }

    return true;
  }
}
