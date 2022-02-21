import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "app/store";
import { saveTokens, TokenState } from "features/user/slice";
import {
  AuthCodeRequest,
  AuthCodeResponse,
  CategoryDto,
  CategoryResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  CreatedVocabularyListDto,
  CreateVocabularyListDto,
  DetailedVocabularyListDto,
  EditCategoryRequest,
  EditCategoryResponse,
  LoginRequest,
  LoginResponse,
  PagedVocabularyListsRequest,
  PagedVocabularyListsResponse,
  ResetPasswordRequest,
  SignUpRequest,
  SignUpResponse,
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
    const refreshTokenResult = await baseQuery("/users/me", api, extraOptions);
    if (refreshTokenResult.data) {
      api.dispatch(saveTokens(refreshTokenResult.data as TokenState));
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithReAuth,
  tagTypes: ["categories", "user", "vocabularyLists"],
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
      providesTags: ["user"],
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
    deleteUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : ["user"]),
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
    editCategory: builder.mutation<EditCategoryResponse, EditCategoryRequest>({
      query: (editCategoryDto) => ({
        url: `/categories/${editCategoryDto.id}`,
        method: "PATCH",
        body: editCategoryDto,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "categories", id: result.id },
              { type: "vocabularyLists", id: "LIST" },
            ]
          : [],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, categoryId) =>
        result !== undefined
          ? [
              { type: "categories", id: categoryId },
              { type: "vocabularyLists", id: "LIST" },
            ]
          : [],
    }),
    vocabularyLists: builder.query<
      PagedVocabularyListsResponse,
      PagedVocabularyListsRequest
    >({
      query: ({ page, perPage, categoryId, title }) => {
        let endPoint = `/vocabularies?page=${page}&perPage=${perPage}`;
        if (categoryId) {
          endPoint += `&category=${categoryId}`;
        }
        if (title) {
          endPoint += `&title=${title}`;
        }
        return endPoint;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((vocabularyList) => ({
                type: "vocabularyLists" as const,
                id: vocabularyList.id,
              })),
              { type: "vocabularyLists" as const, id: "LIST" },
            ]
          : [{ type: "vocabularyLists" as const, id: "LIST" }],
    }),
    deleteVocabularyList: builder.mutation<void, number>({
      query: (vocabularyListId) => ({
        url: `/vocabularies/${vocabularyListId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, vocabularyListId) => {
        return error ? [] : [{ type: "vocabularyLists", id: vocabularyListId }];
      },
    }),
    createVocabularyList: builder.mutation<
      CreatedVocabularyListDto,
      CreateVocabularyListDto
    >({
      query: (createVocabularyListDto) => ({
        url: `/vocabularies`,
        method: "POST",
        body: createVocabularyListDto,
      }),
      invalidatesTags: (result, error) =>
        result ? [{ type: "vocabularyLists", id: "LIST" }] : [],
    }),
    vocabularyList: builder.query<DetailedVocabularyListDto, number>({
      query: (id) => `/vocabularies/${id}`,
      providesTags: (result) =>
        result ? [{ type: "vocabularyLists" as const, id: result.id }] : [],
    }),
  }),
});

export const {
  useUserQuery,
  useLoginMutation,
  useAuthCodeMutation,
  useSignUpMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useCategoryQuery,
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
  useVocabularyListsQuery,
  useDeleteVocabularyListMutation,
  useCreateVocabularyListMutation,
  useVocabularyListQuery,
} = baseApi;
