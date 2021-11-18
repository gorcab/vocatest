import { IsString } from 'class-validator';

export class CreateExampleDto {
  @IsString({ message: '예문은 문자열로 구성되어야 합니다.' })
  sentence: string;

  @IsString({ message: '예문에 대한 해석은 문자열로 구성되어야 합니다.' })
  translation: string;
}
