import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'src/common/types';
import { EmailService } from 'src/email/services/email.service';
import { UserWithJwtTokenDto } from 'src/user/dtos/UserWithJwtToken.dto';
import { User } from '../../common/decorators/user.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { ACCESS_TOKEN_TTL } from '../constants';
import { RefreshTokenDto } from '../dtos/RefreshToken.dto';
import { RefreshTokensDto } from '../dtos/RefreshTokens.dto';
import { SendAuthCodeRequestDto } from '../dtos/SendAuthCodeRequest.dto';
import { SendAuthCodeResponseDto } from '../dtos/SendAuthCodeResponse.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ValidAuthCodeRequest } from '../guards/ValidAuthCodeRequest.guard';
import { ValidRefreshTokenGuard } from '../guards/ValidRefreshToken.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  public async login(
    @Req() req: RequestWithUser,
  ): Promise<UserWithJwtTokenDto> {
    const { accessToken, refreshToken } =
      await this.authService.createAccessAndRefreshToken(req.user);
    return UserWithJwtTokenDto.create(req.user, accessToken, refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  public async logout(@User() user: UserEntity): Promise<void> {
    await this.authService.deleteRefreshToken(user.email);
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

  @Post('/token')
  @UseGuards(ValidRefreshTokenGuard)
  public async refreshAccessToken(
    @Req() request,
    @Body() { refreshToken }: RefreshTokenDto,
  ): Promise<RefreshTokensDto> {
    let accessToken: string;
    accessToken = request.headers.authorization?.split(' ')[1];
    if (accessToken) {
      // access token 만료 시, 재발급
      if (this.authService.isExpiredToken(accessToken)) {
        const { sub, email } = this.authService.decodeToken(accessToken);
        accessToken = this.authService.createJwtToken(
          {
            sub,
            email,
          },
          ACCESS_TOKEN_TTL,
        );
      }
      return RefreshTokensDto.create(accessToken, refreshToken);
    } else {
      throw new UnauthorizedException();
    }
  }
}
