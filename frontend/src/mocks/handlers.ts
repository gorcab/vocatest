import { rest } from "msw";
import { LoginRequest } from "../features/api/slice";

const accessToken = "accesstoken";
const refreshToken = "refreshtoken";
const validUser = {
  email: "tester@gmail.com",
  nickname: "tester",
};

export const handlers = [
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
            email: validUser.email,
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
