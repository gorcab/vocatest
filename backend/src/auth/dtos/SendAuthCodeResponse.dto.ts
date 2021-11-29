import { Purpose, SendAuthCodeRequestDto } from './SendAuthCodeRequest.dto';

export class SendAuthCodeResponseDto extends SendAuthCodeRequestDto {
  ttl: number;

  static create(purpose: Purpose, email: string, ttl: number) {
    const sendAuthCodeResponseDto: SendAuthCodeResponseDto = {
      email,
      purpose,
      ttl,
    };

    return sendAuthCodeResponseDto;
  }
}
