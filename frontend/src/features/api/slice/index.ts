import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../app/store";
import { saveTokens, TokenState } from "../../user/slice";
import {
  LoginRequest,
  LoginResponse,
  SignUpResponse,
  SignUpRequest,
  UserResponse,
  AuthCodeResponse,
  AuthCodeRequest,
  ResetPasswordRequest,
  CategoryResponse,
  CategoryDto,
  CreateCategoryResponse,
  CreateCategoryRequest,
} from "../types";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state: RootState = getState() as RootState;
    const accessToken = state.user.accessToken;
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (api.endpoint !== "login" && result.error && result.error.status === 401) {
    const refreshTokenResult = await baseQuery(
      "/auth/refresh",
      api,
      extraOptions
    );
    if (refreshTokenResult.data) {
      api.dispatch(saveTokens(refreshTokenResult.data as TokenState));
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithReAuth,
  tagTypes: ["categories", "user"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (loginDto) => ({
        url: "/auth/login",
        method: "POST",
        body: loginDto,
      }),
    }),
    user: builder.query<UserResponse, void>({
      query: () => "/users/me",
    }),
    authCode: builder.mutation<AuthCodeResponse, AuthCodeRequest>({
      query: (authCodeDto) => ({
        url: "/auth/code",
        method: "POST",
        body: authCodeDto,
      }),
    }),
    signUp: builder.mutation<SignUpResponse, SignUpRequest>({
      query: (signUpDto) => ({
        url: "/users",
        method: "POST",
        body: signUpDto,
      }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (resetPasswordDto) => ({
        url: "/users/password",
        method: "POST",
        body: resetPasswordDto,
      }),
    }),
    category: builder.query<Array<CategoryDto>, void>({
      query: () => "/categories",
      transformResponse: (response: CategoryResponse) => response.categories,
      providesTags: (result, error) =>
        result
          ? [
              ...result.map(
                (category) => ({ type: "categories", id: category.id } as const)
              ),
              { type: "categories", id: "LIST" },
            ]
          : [{ type: "categories", id: "LIST" }],
    }),
    createCategory: builder.mutation<
      CreateCategoryResponse,
      CreateCategoryRequest
    >({
      query: (createCategoryDto) => ({
        url: "/categories",
        method: "POST",
        body: createCategoryDto,
      }),
      invalidatesTags: (result, error) =>
        result ? [{ type: "categories", id: "LIST" }] : [],
    }),
  }),
});

export const {
  useUserQuery,
  useLoginMutation,
  useAuthCodeMutation,
  useSignUpMutation,
  useResetPasswordMutation,
  useCategoryQuery,
  useCreateCategoryMutation,
} = baseApi;
