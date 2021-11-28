export class SaveResetPasswordAuthCodeDto {
  email: string;
  resetPasswordAuthCode: number;

  static create(email: string, resetPasswordAuthCode: number) {
    const saveResetPasswordAuthCode: SaveResetPasswordAuthCodeDto = {
      email,
      resetPasswordAuthCode,
    };

    return saveResetPasswordAuthCode;
  }
}
