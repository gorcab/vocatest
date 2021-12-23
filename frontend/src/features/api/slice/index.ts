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
  SignUpAuthCodeRequest,
  SignUpAuthCodeResponse,
  SignUpResponse,
  SignUpRequest,
  UserResponse,
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
    signUpAuthCode: builder.mutation<
      SignUpAuthCodeResponse,
      SignUpAuthCodeRequest
    >({
      query: (signUpAuthCodeDto) => ({
        url: "/auth/code",
        method: "POST",
        body: signUpAuthCodeDto,
      }),
    }),
    signUp: builder.mutation<SignUpResponse, SignUpRequest>({
      query: (signUpDto) => ({
        url: "/users",
        method: "POST",
        body: signUpDto,
      }),
    }),
  }),
});

export const {
  useUserQuery,
  useLoginMutation,
  useSignUpAuthCodeMutation,
  useSignUpMutation,
} = baseApi;
