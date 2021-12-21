import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { render, waitFor } from "../../features/common/utils/test-utils";
import { LoginPage } from "../LoginPage";

describe("LoginPage", () => {
  const Component = (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Outlet />
            </div>
          }
        >
          <Route index element={<main>MainPage</main>} />
          <Route path="reset-password" element={<div>Reset Password</div>} />
          <Route path="sign-up" element={<div>Sign Up</div>} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/login");
  });

  describe("로그인 된 상태에서 해당 컴포넌트가 렌더링되면", () => {
    it('"/" url로 이동한다.', () => {
      render(Component, {
        preloadedState: {
          user: {
            user: { id: 1, email: "tester@gmail.com", nickname: "tester" },
            accessToken: "accesstoken",
            refreshToken: "refreshtoken",
          },
        },
      });

      expect(window.location.pathname).toBe("/");
    });
  });

  describe("로그인되지 않은 상태에서 해당 컴포넌트가 렌더링되면", () => {
    it("로고와 로그인 폼, 비밀번호 재설정 및 회원가입 링크를 렌더링한다.", () => {
      const { getByRole } = render(Component);

      const textLogo = getByRole("heading", { name: "VOCATEST" });
      const loginForm = getByRole("form");
      const findPasswordLink = getByRole("link", { name: "비밀번호 재설정" });
      const signUpLink = getByRole("link", { name: "회원가입" });

      expect(textLogo).toBeInTheDocument();
      expect(loginForm).toBeInTheDocument();
      expect(findPasswordLink).toBeInTheDocument();
      expect(signUpLink).toBeInTheDocument();
    });

    it('로그인에 성공하면 "/" url로 이동한다.', async () => {
      const { getByRole, getByLabelText } = render(Component);

      const emailField = getByLabelText("이메일");
      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      expect(window.location.pathname).toBe("/login");

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.type(passwordField, "12345678");
      userEvent.click(loginButton);

      await waitFor(
        () => {
          expect(window.location.pathname).toBe("/");
        },
        { timeout: 2000 }
      );
    });

    it('"비밀번호 재설정" 링크를 누르면 "/reset-password" url로 이동한다.', async () => {
      const { getByRole } = render(Component);

      const resetPasswordLink = getByRole("link", { name: "비밀번호 재설정" });

      userEvent.click(resetPasswordLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe("/reset-password");
      });
    });

    it('"회원가입" 링크를 누르면 "/sign-up" url로 이동한다.', async () => {
      const { getByRole } = render(Component);

      const signUpLink = getByRole("link", { name: "회원가입" });

      userEvent.click(signUpLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe("/sign-up");
      });
    });
  });
});
