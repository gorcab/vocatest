import { User } from "features/user/slice";

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

export type EditCategoryRequest = {
  id: number;
  name: string;
};

export type EditCategoryResponse = CategoryDto;

// Vocabulary Types
export type VocabularyListDto = {
  id: number;
  title: string;
  createdAt: string;
  numOfVocabularies: number;
  category: CategoryDto;
};

export type PagedVocabularyListsResponse = {
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
  data: Array<VocabularyListDto>;
};

export type PagedVocabularyListsRequest = {
  page: number;
  perPage: number;
  categoryId?: number;
  title?: string;
};

export type ExampleDto = {
  sentence: string;
  translation: string;
};

export type CreatedExampleDto = ExampleDto & { id: number };

export type CreateVocabularyDto = {
  english: string;
  korean: string;
  examples: Array<ExampleDto>;
};

export type CreatedVocabularyDto = Omit<CreateVocabularyDto, "examples"> & {
  id: number;
  examples?: Array<CreatedExampleDto>;
};

export type CreateVocabularyListDto = {
  categoryId: number;
  title: string;
  vocabularies: Array<CreateVocabularyDto>;
};

export type CreatedVocabularyListDto = Omit<
  CreateVocabularyListDto,
  "vocabularies"
> & {
  id: number;
  numOfVocabularies: number;
};

export type DetailedVocabularyListDto = {
  id: number;
  title: string;
  category: CategoryDto;
  createdAt: string;
  vocabularies: Array<CreatedVocabularyDto>;
};

export type EditVocabularyListDto = CreateVocabularyListDto;

// Error Response type
export type ErrorResponse = {
  status: number;
  message: string;
};
