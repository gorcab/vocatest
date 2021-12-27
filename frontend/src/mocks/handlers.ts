import { rest } from "msw";
import {
  AuthCodeRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
} from "../features/api/types";

export const accessToken = "accesstoken";
export const refreshToken = "refreshtoken";
const validUser = {
  email: "tester@gmail.com",
  nickname: "tester",
};

export const handlers = [
  // 인증 토큰 전송 요청 핸들러
  rest.post<AuthCodeRequest>(
    `${process.env.REACT_APP_API_URL}/auth/code`,
    (req, res, ctx) => {
      const { email, purpose } = req.body;
      if (email === "wrong@gmail.com") {
        return res(
          ctx.status(503),
          ctx.json({
            status: 503,
            message: "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
          })
        );
      }

      if (purpose === "SIGN_UP") {
        if (email === "already@gmail.com") {
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
              ttl: 300,
            })
          );
        }
      } else if (purpose === "RESET_PASSWORD") {
        if (email === "notexists@gmail.com") {
          return res(
            ctx.delay(500),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "가입되지 않은 이메일입니다.",
            })
          );
        } else {
          return res(
            ctx.delay(500),
            ctx.status(201),
            ctx.json({
              email,
              purpose,
              ttl: 300,
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
      const { email, nickname, signUpAuthCode } = req.body;
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

  // 비밀번호 재설정 인증 토큰 전송 요청 핸들러
  rest.post<ResetPasswordRequest>(
    `${process.env.REACT_APP_API_URL}/users/password`,
    (req, res, ctx) => {
      const { resetPasswordAuthCode } = req.body;
      if (resetPasswordAuthCode === 444444) {
        return res(
          ctx.status(400),
          ctx.json({
            status: 400,
            message: "인증 번호가 올바르지 않습니다.",
          })
        );
      } else {
        return res(ctx.status(204));
      }
    }
  ),
];
