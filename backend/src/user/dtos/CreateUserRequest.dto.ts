import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsWhitespaceString } from 'src/common/validators/IsWhitespaceString';

export class CreateUserRequestDto {
  @IsEmail({}, { message: '이메일은 이메일 형식이어야 합니다.' })
  email: string;

  signUpAuthCode: number;

  @IsString({ message: '비밀번호는 8 ~ 12자로 구성된 문자여야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(12, { message: '비밀번호는 최대 12자 이하여야 합니다.' })
  password: string;

  @IsString({ message: '닉네임은 2자 이상으로 구성된 문자여야 합니다.' })
  @IsWhitespaceString({
    message: '공백으로만 구성된 닉네임은 사용할 수 없습니다.',
  })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  nickname: string;
}
