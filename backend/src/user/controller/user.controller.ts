import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthService } from 'src/auth/service/auth.service';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { DeleteUserDto } from '../dtos/DeleteUser.dto';
import { ResetPasswordDto } from '../dtos/ResetPassword.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UserDto } from '../dtos/User.dto';
import { UserWithJwtTokenDto } from '../dtos/UserWithJwtToken.dto';
import { RegisteredEmailGuard } from '../guards/RegisteredEmail.guard';
import { SameUserIdInTokenAndParamGuard } from '../guards/SameUserIdInTokenAndParam.guard';
import { ValidResetPasswordAuthCodeGuard } from '../guards/ValidResetPasswordAuthCode.guard';
import { ValidSignUpAuthCodeGuard } from '../guards/ValidSignUpAuthCode.guard';
import { UserService } from '../service/user.service';

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
    const { accessToken, refreshToken } = await this.authService.login(user);

    return UserWithJwtTokenDto.create(user, accessToken, refreshToken);
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

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ValidResetPasswordAuthCodeGuard)
  @UseGuards(RegisteredEmailGuard)
  public async resetPassword(
    @Body() { email, password, resetPasswordAuthCode }: ResetPasswordDto,
  ) {
    await this.userService.updatePassword(email, password);
  }
}
