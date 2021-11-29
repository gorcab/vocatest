import { IsEmail, IsIn } from 'class-validator';

export type Purpose = 'SIGN_UP' | 'RESET_PASSWORD';

export class SendAuthCodeRequestDto {
  @IsIn(['SIGN_UP', 'RESET_PASSWORD'], { message: '올바르지 않은 요청입니다.' })
  purpose: Purpose;

  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;
}
