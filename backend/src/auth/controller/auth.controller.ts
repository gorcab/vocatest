import {
  Body,
  Controller,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'src/common/types';
import { EmailService } from 'src/email/services/email.service';
import { UpdatedUserResponseDto } from 'src/user/dtos/UpdatedUserResponse.dto';
import { UserWithJwtTokenDto } from 'src/user/dtos/UserWithJwtToken.dto';
import { SendAuthCodeRequestDto } from '../dtos/SendAuthCodeRequest.dto';
import { SendAuthCodeResponseDto } from '../dtos/SendAuthCodeResponse.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ValidAuthCodeRequest } from '../guards/ValidAuthCodeRequest.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(
    @Req() req: RequestWithUser,
  ): Promise<UserWithJwtTokenDto> {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
    return UserWithJwtTokenDto.create(req.user, accessToken, refreshToken);
  }

  @Post('/code')
  @UseGuards(ValidAuthCodeRequest)
  public async sendAuthCodeToEmail(
    @Body() { purpose, email }: SendAuthCodeRequestDto,
  ) {
    const {
      email: receiverEmail,
      authCode,
      ttl,
    } = await this.authService.saveAuthCode(email, purpose);

    try {
      if (purpose === 'SIGN_UP') {
        await this.emailService.sendSignUpAuthCode(receiverEmail, authCode);
      } else if (purpose === 'RESET_PASSWORD') {
        await this.emailService.sendResetPasswordAuthCode(
          receiverEmail,
          authCode,
        );
      }
      return SendAuthCodeResponseDto.create(purpose, email, ttl);
    } catch (error) {
      throw new ServiceUnavailableException(
        '이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.',
      );
    }
  }
}
