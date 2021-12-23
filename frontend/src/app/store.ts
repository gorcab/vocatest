import {
  AnyAction,
  combineReducers,
  configureStore,
  createAction,
  DeepPartial,
  Reducer,
} from "@reduxjs/toolkit";
import { baseApi } from "../features/api/slice";
import userReducer from "../features/user/slice";
import { TokenSaveMiddleware } from "./middlewares/tokenSaveMiddleware";

const combinedReducer = combineReducers({
  user: userReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  if (action.type === logout.type) {
    state = {} as RootState;
  }

  return combinedReducer(state, action);
};

export const logout = createAction("logout");

const createStore = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  let preloadedState: DeepPartial<RootState> = {};
  if (accessToken && refreshToken) {
    preloadedState = {
      user: {
        user: null,
        accessToken,
        refreshToken,
      },
    };
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
  const store = configureStore({
    preloadedState,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, TokenSaveMiddleware),
  });
  return store;
};

export const store = createStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
