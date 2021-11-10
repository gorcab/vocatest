import { IsEmail } from 'class-validator';
import { IsEmailAlreadyExist } from 'src/common/validators/IsEmailAlreadyExist';

export class SignUpAuthRequestDto {
  @IsEmail({}, { message: '이메일은 이메일 형식이어야 합니다.' })
  @IsEmailAlreadyExist()
  email: string;
}
