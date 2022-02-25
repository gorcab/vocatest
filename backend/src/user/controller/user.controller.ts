import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthService } from 'src/auth/service/auth.service';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { ResetPasswordDto } from '../dtos/ResetPassword.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UserDto } from '../dtos/User.dto';
import { UserWithJwtTokenDto } from '../dtos/UserWithJwtToken.dto';
import { RegisteredEmailGuard } from '../guards/RegisteredEmail.guard';
import { SameUserIdInTokenAndParamGuard } from '../guards/SameUserIdInTokenAndParam.guard';
import { ValidResetPasswordAuthCodeGuard } from '../guards/ValidResetPasswordAuthCode.guard';
import { ValidSignUpAuthCodeGuard } from '../guards/ValidSignUpAuthCode.guard';
import { UserService } from '../service/user.service';
import { User as UserEntity } from '../entities/user.entity';
import { UpdatedUserResponseDto } from '../dtos/UpdatedUserResponse.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(ValidSignUpAuthCodeGuard)
  public async signUp(
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserDto> {
    const { signUpAuthCode, ...createUserServiceDto } = createUserRequestDto;
    const user = await this.userService.save(createUserServiceDto);
    const { accessToken, refreshToken } =
      await this.authService.createAccessAndRefreshToken(user);

    return UserWithJwtTokenDto.create(user, accessToken, refreshToken);
  }

  @Patch(':id')
  @UseGuards(SameUserIdInTokenAndParamGuard)
  @UseGuards(JwtAuthGuard)
  public async update(
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdatedUserResponseDto> {
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
  public async delete(@Param('id') userId: number): Promise<void> {
    return await this.userService.deleteById(userId);
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ValidResetPasswordAuthCodeGuard)
  @UseGuards(RegisteredEmailGuard)
  public async resetPassword(
    @Body() { email, password, resetPasswordAuthCode }: ResetPasswordDto,
  ): Promise<void> {
    await this.userService.updatePassword(email, password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getUser(@User() user: UserEntity): Promise<UserDto> {
    return UserDto.create(user);
  }
}
