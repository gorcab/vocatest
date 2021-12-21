import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store";
import { baseApi } from "../../api/slice";

export type User = {
  id: number;
  email: string;
  nickname: string;
};

export type UserState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type TokenState = {
  accessToken: string;
  refreshToken: string;
};

const name = "user";

const initialState: UserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name,
  initialState,
  reducers: {
    saveTokens: (
      state,
      action: PayloadAction<Pick<UserState, "accessToken" | "refreshToken">>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        baseApi.endpoints.login.matchFulfilled,
        (
          state,
          { payload: { id, email, nickname, accessToken, refreshToken } }
        ) => {
          state.user = {
            id,
            email,
            nickname,
          };
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
        }
      )
      .addMatcher(
        baseApi.endpoints.user.matchFulfilled,
        (state, { payload: { id, email, nickname } }) => {
          state.user = {
            id,
            email,
            nickname,
          };
        }
      );
  },
});

export const { saveTokens } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectAccessToken = (state: RootState) => state.user.accessToken;
export const selectUserAndAccessToken = (state: RootState) => ({
  user: state.user.user,
  accessToken: state.user.accessToken,
});

export default userSlice.reducer;
