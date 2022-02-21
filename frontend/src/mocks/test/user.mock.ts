import {
  AuthCodeRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
} from "features/api/types";
import { createMockResponse } from "mocks/lib/networkMockUtils.factory";

export const successToGetUserProfileResponse = createMockResponse(
  "/users/me",
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: "tester@gmail.com",
        nickname: "tester",
      })
    );
  },
  {
    method: "GET",
  }
);

export const successToUnregisterResponse = createMockResponse(
  "/users/:id",
  (req, res, ctx) => {
    return res(ctx.status(201));
  },
  { method: "DELETE" }
);

export const serverErrorForUnregisterResponse = createMockResponse(
  "/users/:id",
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        status: 500,
        message: "Internal Server Error",
      })
    );
  },
  {
    method: "DELETE",
  }
);

export const successSendingAuthCodeResponse =
  createMockResponse<AuthCodeRequest>(
    "/auth/code",
    (req, res, ctx) => {
      const { email, purpose } = req.body;
      return res(
        ctx.status(201),
        ctx.json({
          email,
          purpose,
          ttl: 300,
        })
      );
    },
    { method: "POST" }
  );

export const wrongAuthCodeForSignUpResponse = createMockResponse<SignUpRequest>(
  "/users",
  (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        status: 400,
        message: "인증 번호가 올바르지 않습니다.",
      })
    );
  },
  {
    method: "POST",
  }
);

export const alreadyRegisteredEmailForAuthCodeResponse =
  createMockResponse<AuthCodeRequest>(
    "/auth/code",
    (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          status: 400,
          message: "이미 가입된 이메일입니다.",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const failedSendingAuthCodeResponse =
  createMockResponse<AuthCodeRequest>(
    "/auth/code",
    (req, res, ctx) => {
      return res(
        ctx.status(503),
        ctx.json({
          status: 503,
          message: "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const timedOutAuthCodeResponse = createMockResponse<AuthCodeRequest>(
  "/auth/code",
  (req, res, ctx) => {
    const { email, purpose } = req.body;
    return res(
      ctx.status(201),
      ctx.json({
        email,
        purpose,
        ttl: 1,
      })
    );
  },
  {
    method: "POST",
  }
);

export const unregisteredEmailForAuthCodeResponse =
  createMockResponse<AuthCodeRequest>(
    "/auth/code",
    (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          status: 400,
          message: "가입되지 않은 이메일입니다.",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const wrongAuthCodeForResetPasswordResponse =
  createMockResponse<ResetPasswordRequest>(
    "/users/password",
    (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          status: 400,
          message: "인증 번호가 올바르지 않습니다.",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const successResetPasswordResponse =
  createMockResponse<ResetPasswordRequest>(
    "/users/password",
    (req, res, ctx) => {
      return res(ctx.status(204));
    },
    { method: "POST" }
  );

export const unregisteredEmailForLoginResponse =
  createMockResponse<LoginRequest>(
    "/auth/login",
    (req, res, ctx) => {
      return res(
        ctx.status(401),
        ctx.json({
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const serverErrorForLoginResponse = createMockResponse<LoginRequest>(
  "/auth/login",
  (req, res, ctx) => {
    return res(ctx.status(500));
  },
  {
    method: "POST",
  }
);
