export class AccessAndRefreshTokenDto {
  accessToken: string;
  refreshToken: string;

  static create(accessToken: string, refreshToken: string) {
    const accessAndRefreshTokenDto: AccessAndRefreshTokenDto = {
      accessToken,
      refreshToken,
    };

    return accessAndRefreshTokenDto;
  }
}
