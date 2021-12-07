export class RefreshTokensDto {
  accessToken: string;
  refreshToken: string;

  static create(accessToken: string, refreshToken: string) {
    const refreshTokensDto: RefreshTokensDto = {
      accessToken,
      refreshToken,
    };

    return refreshTokensDto;
  }
}
