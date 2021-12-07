import { JwtPayloadDto } from './JwtPayload.dto';

export class JwtTokenDto extends JwtPayloadDto {
  iat: number;
  exp: number;
}
