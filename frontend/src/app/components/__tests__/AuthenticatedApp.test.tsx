import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { render } from "../../../features/common/utils/test-utils";
import { UserState } from "../../../features/user/slice";
import { AuthenticatedApp } from "../AuthenticatedApp";

describe("AuthenticatedApp", () => {
  function renderAuthenticatedApp() {
    const { getByRole, debug } = render(
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>,
      {
        preloadedState: {
          user: {
            user: {
              id: 1,
              email: "tester@gmail.com",
              nickname: "tester",
            },
            accessToken: "accesstoken",
            refreshToken: "refreshtoken",
          } as UserState,
        },
      }
    );

    return {
      getByRole,
      debug,
    };
  }

  it("현재 url이 UnauthenticatedApp에서 관리하는 route라면 state.from 속성을 확인하여 있다면 해당 url로 redirect한다.", async () => {
    const { getByRole } = render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/login",
            state: {
              from: "/profile",
            },
          },
        ]}
      >
        <AuthenticatedApp />
      </MemoryRouter>,
      {
        preloadedState: {
          user: {
            user: {
              id: 1,
              email: "tester@gmail.com",
              nickname: "tester",
            },
            accessToken: "accesstoken",
            refreshToken: "refreshtoken",
          } as UserState,
        },
      }
    );

    const profileHeading = getByRole("heading", { name: "내 프로필" });

    expect(profileHeading).toBeInTheDocument();
  });

  it("AuthenticatedApp에서 관리하는 route가 아니라면 NotFoundPage를 렌더링한다.", async () => {
    window.history.replaceState({}, "", "/not-found");
    const { getByRole } = renderAuthenticatedApp();

    const alertMessage = getByRole("heading", {
      name: "요청하신 페이지를 찾을 수 없습니다.",
    });

    expect(alertMessage).toBeInTheDocument();
  });
});
