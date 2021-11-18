import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './controller/category.controller';
import { Category } from './entities/category.entity';
import { IsCategoryNameAlreadyExistGuard } from './guards/IsCategoryNameAlreadyExist.guard';
import { UsersCategoryGuard } from './guards/UsersCategory.guard';
import { CategoryService } from './service/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [
    CategoryService,
    IsCategoryNameAlreadyExistGuard,
    UsersCategoryGuard,
  ],
  controllers: [CategoryController],
  exports: [CategoryService, UsersCategoryGuard],
})
export class CategoryModule {}
