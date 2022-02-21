import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { configureStore, DeepPartial } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { combinedReducer, logout, RootState, store } from "app/store";
import { baseApi } from "features/api/slice";
import { authTokenMiddleware } from "app/middlewares/authTokenMiddleware";

type RenderType = (
  ui: React.ReactElement,
  options?: RenderOptions & {
    preloadedState?: DeepPartial<RootState>;
    store?: typeof store;
  }
) => ReturnType<typeof rtlRender>;

export function setUpStore(preloadedState?: DeepPartial<RootState>) {
  return configureStore({
    reducer: (state, action) => {
      if (action.type === logout.type) {
        return combinedReducer(undefined, action);
      }
      return combinedReducer(state, action);
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, authTokenMiddleware),
    preloadedState,
  });
}

const render: RenderType = (
  ui,
  { preloadedState, store = setUpStore(preloadedState), ...renderOptions } = {}
) => {
  const Wrapper: React.FC = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

export * from "@testing-library/react";
export { render };
