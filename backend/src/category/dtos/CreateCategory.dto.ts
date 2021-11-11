import { IsInt, IsString } from 'class-validator';
import { IsCategoryNameAlreadyExist } from 'src/common/validators/IsCategoryNameAlreadyExist';
import { IsInvalidUser } from 'src/common/validators/IsInvalidUser';

export class CreateCategoryDto {
  @IsInt({ message: 'ID는 정수형 숫자여야 합니다.' })
  @IsInvalidUser()
  userId: number;

  @IsString({ message: '카테고리명은 문자로 구성되어야 합니다.' })
  @IsCategoryNameAlreadyExist()
  name: string;
}
