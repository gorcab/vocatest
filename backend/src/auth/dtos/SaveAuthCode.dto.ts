export class SaveAuthCodeDto {
  email: string;
  authCode: number;
  ttl: number;

  static create(email: string, authCode: number, ttl: number) {
    const saveAuthCodeDto: SaveAuthCodeDto = {
      email,
      authCode,
      ttl,
    };

    return saveAuthCodeDto;
  }
}
