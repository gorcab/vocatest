import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'src/common/types';
import { EmailService } from 'src/email/services/email.service';
import { UserResponseDto } from 'src/user/dtos/UserResponse.dto';
import { SendResetPasswordAuthCodeDto } from '../dtos/SendResetPasswordAuthCode.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RegisteredEmailGuard } from '../guards/RegisteredEmail.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public login(@Req() req: RequestWithUser): UserResponseDto {
    const accessToken = this.authService.login(req.user);

    const userResponseDto: UserResponseDto = {
      id: req.user.id as number,
      email: req.user.email as string,
      nickname: req.user.nickname as string,
      accessToken: accessToken,
    };

    return userResponseDto;
  }

  @Post('reset-password')
  @UseGuards(RegisteredEmailGuard)
  public async sendResetPasswordAuthCodeEmail(
    @Body() requestDto: SendResetPasswordAuthCodeDto,
  ) {
    const { email, resetPasswordAuthCode } =
      await this.authService.saveResetPasswordAuthCode(requestDto.email);

    await this.emailService.sendResetPasswordAuthCode(
      email,
      resetPasswordAuthCode,
    );
  }
}
