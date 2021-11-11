import { IsInt, IsString } from 'class-validator';
import { IsCategoryNameAlreadyExist } from 'src/common/validators/IsCategoryNameAlreadyExist';
import { IsUsersCategory } from 'src/common/validators/IsUsersCategory';
import { IsValidUser } from 'src/common/validators/IsvalidUser';

export class UpdateCategoryRequestDto {
  @IsInt({ message: '올바르지 않은 사용자입니다.' })
  @IsValidUser()
  userId: number;

  @IsInt({ message: '올바르지 않은 카테고리입니다.' })
  @IsUsersCategory()
  id: number;

  @IsString({ message: '카테고리명은 문자로 구성되어야 합니다.' })
  @IsCategoryNameAlreadyExist()
  name: string;
}
