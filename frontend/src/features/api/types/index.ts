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

// Auth Code Types
export type AuthCodeRequest = {
  purpose: "SIGN_UP" | "RESET_PASSWORD";
  email: string;
};

export type AuthCodeResponse = {
  email: string;
  purpose: string;
  ttl: number;
};

// SignUp Types
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

// ResetPassword Types
export type ResetPasswordRequest = {
  email: string;
  password: string;
  resetPasswordAuthCode: number;
};

// User Types
export type UserResponse = User;

// Category Types
export type CategoryDto = {
  id: number;
  name: string;
};

export type CategoryResponse = {
  categories: Array<CategoryDto>;
};

export type CreateCategoryRequest = {
  name: string;
};

export type CreateCategoryResponse = CategoryDto;

// Error Response type
export type ErrorResponse = {
  status: number;
  message: string;
};
