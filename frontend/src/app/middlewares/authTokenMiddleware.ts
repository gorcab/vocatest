import { AnyAction, Middleware, MiddlewareAPI } from "redux";
import { baseApi } from "../../features/api/slice";
import { saveTokens } from "../../features/user/slice";
import { logout, RootState } from "../store";

export const authTokenMiddleware: Middleware<{}, RootState> =
  (storeApi: MiddlewareAPI) => (next) => (action: AnyAction) => {
    if (
      baseApi.endpoints.login.matchFulfilled(action) ||
      baseApi.endpoints.signUp.matchFulfilled(action) ||
      action.type === saveTokens.type
    ) {
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    }

    if (
      baseApi.endpoints.deleteUser.matchFulfilled(action) ||
      action.type === logout.type
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    return next(action);
  };
