import { AnyAction, Middleware, MiddlewareAPI } from "redux";
import { baseApi } from "../../features/api/slice";
import { saveTokens } from "../../features/user/slice";
import { RootState } from "../store";

export const TokenSaveMiddleware: Middleware<{}, RootState> =
  (storeApi: MiddlewareAPI) => (next) => (action: AnyAction) => {
    if (
      baseApi.endpoints.login.matchFulfilled(action) ||
      baseApi.endpoints.signUp.matchFulfilled(action) ||
      action.type === saveTokens.type
    ) {
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    }

    return next(action);
  };
