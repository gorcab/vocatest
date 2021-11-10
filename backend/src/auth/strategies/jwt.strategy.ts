import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  public async validate(payload: JwtPayloadDto) {
    // 생성자의 jwtFromRequest로부터 디코딩된 payload가 인자로 호출된다.
    return {
      id: payload.sub,
      email: payload.email,
    }; // 반환한 객체를 req.user로 참조할 수 있다.
  }
}
