import { IsInt, IsString } from 'class-validator';
import { IsCategoryNameAlreadyExist } from 'src/common/validators/IsCategoryNameAlreadyExist';
import { IsValidUser } from 'src/common/validators/IsvalidUser';

export class CreateCategoryRequestDto {
  @IsInt({ message: 'ID는 정수형 숫자여야 합니다.' })
  @IsValidUser()
  userId: number;

  @IsString({ message: '카테고리명은 문자로 구성되어야 합니다.' })
  @IsCategoryNameAlreadyExist()
  name: string;
}
