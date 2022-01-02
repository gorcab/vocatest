import {
  combineReducers,
  configureStore,
  createAction,
} from "@reduxjs/toolkit";
import { baseApi } from "../features/api/slice";
import userReducer, { UserState } from "../features/user/slice";
import toastReducer from "../features/toast/slice";
import { TokenSaveMiddleware } from "./middlewares/tokenSaveMiddleware";

export const combinedReducer = combineReducers({
  user: userReducer,
  toast: toastReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export const logout = createAction("logout");

const createStore = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  let preloadedState = {};
  if (accessToken && refreshToken) {
    preloadedState = {
      user: {
        user: null,
        accessToken,
        refreshToken,
      } as UserState,
    };
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
  const store = configureStore({
    preloadedState,
    reducer: (state, action) => {
      if (action.type === logout.type) {
        return combinedReducer(undefined, action);
      }
      return combinedReducer(state, action);
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, TokenSaveMiddleware),
  });
  return store;
};

export const store = createStore();

export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = typeof store.dispatch;
