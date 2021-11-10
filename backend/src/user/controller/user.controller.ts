import {
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/service/auth.service';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { SignUpAuthRequestDto } from '../dtos/SignUpAuthRequest.dto';
import { SignUpAuthResponseDto } from '../dtos/SignUpAuthResponse.dto';
import { UserResponseDto } from '../dtos/UserResponse.dto';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
  ) {}

  @Post('email-authentication')
  async sendSignUpAuthenticationEmail(
    @Body() signUpAuthRequestDto: SignUpAuthRequestDto,
  ): Promise<SignUpAuthResponseDto> {
    try {
      // 1. Redis Store에 인증 번호를 저장한다.
      const saveSignUpAuthCodeResultDto =
        await this.userService.saveSignUpAuthCode(signUpAuthRequestDto.email);

      // 2. 인증번호를 이메일로 전송
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

  @Post()
  public async signUp(
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    const { signUpAuthCode, ...createUserServiceDto } = createUserRequestDto;

    const user = await this.userService.save(createUserServiceDto);

    const accessToken = await this.authService.login(user);

    const userResponseDto: UserResponseDto = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      accessToken,
    };

    return userResponseDto;
  }
}
