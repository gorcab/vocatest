import { render } from "features/common/utils/test-utils";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Protected } from "../Protected";

describe("Protected", () => {
  const Component = (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <div>Children Component</div>
            </Protected>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  describe("로그인 되지 않은 상태에서 해당 컴포넌트가 렌더링되면", () => {
    it("/login url로 이동한다.", () => {
      render(Component);

      expect(window.location.pathname).toBe("/login");
    });
  });

  describe("로그인이 된 상태에서 해당 컴포넌트가 렌더링되면", () => {
    it("children Component를 렌더링한다.", () => {
      const { getByText } = render(Component, {
        preloadedState: {
          user: {
            user: {
              id: 1,
              email: "tester@gmail.com",
              nickname: "tester",
            },
            accessToken: "accesstoken",
            refreshToken: "refreshtoken",
          },
        },
      });

      expect(getByText("Children Component")).toBeInTheDocument();
    });
  });
});
