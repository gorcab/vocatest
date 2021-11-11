import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RequestWithUser } from 'src/common/types';
import { UserResponseDto } from 'src/user/dtos/UserResponse.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
