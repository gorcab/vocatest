import { User } from "../../user/slice";
// Login Types
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = User & {
  accessToken: string;
  refreshToken: string;
};

// SignUp Types
export type SignUpAuthCodeRequest = {
  purpose: "SIGN_UP";
  email: string;
};

export type SignUpAuthCodeResponse = {
  email: string;
  purpose: string;
  ttl: number;
};

export type SignUpRequest = {
  email: string;
  signUpAuthCode: number;
  password: string;
  nickname: string;
};

export type SignUpResponse = {
  id: number;
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
};

// User Types
export type UserResponse = User;

// Error Response type
export type ErrorResponse = {
  status: number;
  message: string;
};
