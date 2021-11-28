import { IsEmail } from 'class-validator';

export class SendResetPasswordAuthCodeDto {
  @IsEmail({}, { message: 'email은 이메일 형식이어야 합니다.' })
  email: string;
}
