import { rest } from "msw";
import {
  LoginRequest,
  SignUpAuthCodeRequest,
  SignUpRequest,
} from "../features/api/types";

export const accessToken = "accesstoken";
export const refreshToken = "refreshtoken";
const validUser = {
  email: "tester@gmail.com",
  nickname: "tester",
};

export const handlers = [
  // 회원가입 이메일 인증 토큰 전송 요청 핸들러
  rest.post<SignUpAuthCodeRequest>(
    `${process.env.REACT_APP_API_URL}/auth/code`,
    (req, res, ctx) => {
      const { email, purpose } = req.body;
      if (purpose === "SIGN_UP") {
        if (email === "wrong@gmail.com") {
          return res(
            ctx.status(503),
            ctx.json({
              status: 503,
              message:
                "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
            })
          );
        } else if (email === "already@gmail.com") {
          return res(
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 가입된 이메일입니다.",
            })
          );
        } else {
          return res(
            ctx.status(201),
            ctx.json({
              email,
              purpose,
              ttl: 5,
            })
          );
        }
      }
    }
  ),

  // 회원가입 핸들러
  rest.post<SignUpRequest>(
    `${process.env.REACT_APP_API_URL}/users`,
    (req, res, ctx) => {
      const { email, password, nickname, signUpAuthCode } = req.body;
      if (signUpAuthCode === 444444) {
        return res(
          ctx.delay(100),
          ctx.status(400),
          ctx.json({
            status: 400,
            message: "인증 번호가 올바르지 않습니다.",
          })
        );
      } else if (email === "wrong@gmail.com") {
        return res(
          ctx.delay(100),
          ctx.status(400),
          ctx.json({
            status: 400,
            message: "이미 가입된 이메일입니다.",
          })
        );
      } else {
        return res(
          ctx.delay(100),
          ctx.status(201),
          ctx.json({
            id: 1,
            email,
            nickname,
            accessToken,
            refreshToken,
          })
        );
      }
    }
  ),
  // 로그인 핸들러
  rest.post<LoginRequest>(
    `${process.env.REACT_APP_API_URL}/auth/login`,
    (req, res, ctx) => {
      const { email } = req.body;
      if (email === "wrong@gmail.com") {
        return res(
          ctx.status(401),
          ctx.json({
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          })
        );
      } else {
        return res(
          ctx.delay(1000),
          ctx.status(201),
          ctx.json({
            id: 1,
            email,
            nickname: validUser.nickname,
            accessToken,
            refreshToken,
          })
        );
      }
    }
  ),

  // access token을 통한 사용자 정보 요청
  rest.get(`${process.env.REACT_APP_API_URL}/users/me`, (req, res, ctx) => {
    if (req.headers.get("Authorization") === `Bearer ${accessToken}`) {
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          email: validUser.email,
          nickname: validUser.nickname,
        })
      );
    } else {
      return res(ctx.status(401));
    }
  }),
];
