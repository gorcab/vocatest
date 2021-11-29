import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthService } from 'src/auth/service/auth.service';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { DeleteUserDto } from '../dtos/DeleteUser.dto';
import { SignUpAuthRequestDto } from '../dtos/SignUpAuthRequest.dto';
import { SignUpAuthResponseDto } from '../dtos/SignUpAuthResponse.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UserResponseDto } from '../dtos/UserResponse.dto';
import { AvailableEmailGuard } from '../guards/AvailableEmail.guard';
import { SameUserIdInTokenAndParamGuard } from '../guards/SameUserIdInTokenAndParam.guard';
import { ValidSignUpAuthCodeGuard } from '../guards/ValidSignUpAuthCode.guard';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(ValidSignUpAuthCodeGuard)
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

  @Patch(':id')
  @UseGuards(SameUserIdInTokenAndParamGuard)
  @UseGuards(JwtAuthGuard)
  public async update(
    @Param('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.findOneByEmailAndPassword(
      updateUserDto.email,
      updateUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    return this.userService.update(user, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SameUserIdInTokenAndParamGuard)
  @UseGuards(JwtAuthGuard)
  public async delete(
    @Param('id') userId: number,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    const user = await this.userService.findOneByEmailAndPassword(
      deleteUserDto.email,
      deleteUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    await this.userService.delete(user);
  }
}
