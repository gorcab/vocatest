import { AnyAction } from "redux";
import reducer, { saveTokens, UserState } from "../";
import { baseApi } from "../../../api/slice";
import { accessToken, refreshToken } from "../../../../mocks/handlers";
import { setUpStore } from "../../../common/utils/test-utils";

describe("userSlice reducer", () => {
  it("최초 상태를 반환한다.", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  it("saveTokens 액션이 dispatch되면 인증 토큰들을 상태에 추가한다.", () => {
    const accessToken = "accesstoken";
    const refreshToken = "refreshtoken";
    const previousState: UserState = {
      user: null,
      accessToken: null,
      refreshToken: null,
    };

    const nextState = reducer(
      previousState,
      saveTokens({
        accessToken,
        refreshToken,
      })
    );

    expect(nextState).toEqual({
      user: null,
      accessToken,
      refreshToken,
    });
  });

  it("login api 요청을 성공하면 사용자 정보와 인증 토큰들을 상태에 추가한다.", async () => {
    // given
    const id = 1;
    const email = "tester@gmail.com";
    const password = "test1234";
    const nickname = "tester";
    const { getState, dispatch } = setUpStore();

    const initialState = getState();
    expect(initialState.user).toEqual({
      user: null,
      accessToken: null,
      refreshToken: null,
    });

    // when
    await dispatch(
      baseApi.endpoints.login.initiate({
        email,
        password,
      })
    );

    // then
    const nextState = getState();
    expect(nextState.user).toEqual({
      user: {
        id,
        email,
        nickname,
      },
      accessToken,
      refreshToken,
    });
  });

  it("user api 요청에 성공하면 사용자 정보를 상태에 추가한다.", async () => {
    const id = 1;
    const email = "tester@gmail.com";
    const nickname = "tester";
    const { getState, dispatch } = setUpStore({
      user: {
        user: null,
        accessToken,
        refreshToken,
      },
    });
    const initialState = getState();
    expect(initialState.user).toEqual({
      user: null,
      accessToken,
      refreshToken,
    });

    await dispatch(baseApi.endpoints.user.initiate());

    const nextState = getState();
    expect(nextState.user).toEqual({
      user: {
        id,
        email,
        nickname,
      },
      accessToken,
      refreshToken,
    });
  });

  it("signUp api 요청에 성공하면 사용자 정보와 토큰 정보를 상태에 추가한다.", async () => {
    const id = 1;
    const email = "tester@gmail.com";
    const password = "test1234";
    const nickname = "tester";
    const signUpAuthCode = 123456;
    const { getState, dispatch } = setUpStore();

    const initialState = getState();
    expect(initialState.user).toEqual({
      user: null,
      accessToken: null,
      refreshToken: null,
    });

    await dispatch(
      baseApi.endpoints.signUp.initiate({
        email,
        password,
        nickname,
        signUpAuthCode,
      })
    );

    const nextState = getState();
    expect(nextState.user).toEqual({
      user: {
        id,
        email,
        nickname,
      },
      accessToken,
      refreshToken,
    });
  });
});
