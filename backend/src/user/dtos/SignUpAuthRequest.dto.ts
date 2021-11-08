import { IsEmail } from 'class-validator';

export class SignUpAuthRequestDto {
  @IsEmail({}, { message: '이메일 형식이어야 합니다.' })
  email: string;
}
