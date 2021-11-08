import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserRequestDto {
  @IsEmail({}, { message: 'email은 이메일 형식이어야 합니다.' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(12, { message: '비밀번호는 최대 12자 이하이어야 합니다.' })
  password: string;

  @IsString()
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  nickname: string;
}
