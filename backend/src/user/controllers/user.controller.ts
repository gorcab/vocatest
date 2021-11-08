import {
  BadRequestException,
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { SignUpAuthRequestDto } from '../dtos/SignUpAuthRequest.dto';
import { SignUpAuthResponseDto } from '../dtos/SignUpAuthResponse.dto';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Post('email-authentication')
  async sendSignUpAuthenticationEmail(
    @Body() signUpAuthRequestDto: SignUpAuthRequestDto,
  ): Promise<SignUpAuthResponseDto> {
    try {
      // 1. 해당 이메일이 가입되어 있는지 확인한다.
      const user = await this.userService.findByEmail(
        signUpAuthRequestDto.email,
      );

      if (user) {
        throw new BadRequestException('이미 존재하는 이메일입니다.');
      }

      // 2. Redis Store에 인증 번호를 저장한다.
      const saveSignUpAuthCodeResultDto =
        await this.userService.saveSignUpAuthCode(signUpAuthRequestDto.email);

      // 3. 인증번호를 이메일로 전송
      await this.emailService.sndSignUpAuthCode({
        email: saveSignUpAuthCodeResultDto.email,
        signUpAuthCode: saveSignUpAuthCodeResultDto.signUpAuthCode,
      });

      const signUpAuthResponseDto: SignUpAuthResponseDto = {
        email: saveSignUpAuthCodeResultDto.email,
        ttl: saveSignUpAuthCodeResultDto.ttl,
      };

      return signUpAuthResponseDto;
    } catch (error) {
      if (error instanceof SendEmailFailedException) {
        throw new ServiceUnavailableException(
          '이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.',
        );
      }

      throw error;
    }
  }
}
