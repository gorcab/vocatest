import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../features/common/utils/test-utils";
import { LoginPage } from "../LoginPage";
import { ResetPasswordPage } from "../ResetPasswordPage";

describe("ResetPasswordPage", () => {
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
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/reset-password");
  });

  describe("로그인 된 상태에서 해당 컴포넌트가 렌더링될 때", () => {
    it('"/" url로 이동한다.', () => {
      render(Component, {
        preloadedState: {
          user: {
            user: { id: 1, email: "tester@gmail.com", nickname: "tester" },
            accessToken: "accestoken",
            refreshToken: "refreshtoken",
          },
        },
      });

      expect(window.location.pathname).toBe("/");
    });
  });

  describe("로그인되지 않은 상태에서 해당 컴포넌트가 렌더링 될 때", () => {
    it("로고와 비밀번호 재설정 폼을 렌더링한다.", () => {
      const { getByRole } = render(Component);

      const textLogo = getByRole("heading", { name: "VOCATEST" });
      const signUpForm = getByRole("form");

      expect(textLogo).toBeInTheDocument();
      expect(signUpForm).toBeInTheDocument();
    });

    it('비밀번호 재설정에 성공하면 "/login" url로 이동한다.', async () => {
      // given
      const { getByRole, getByLabelText } = render(Component);
      const emailField = getByLabelText("이메일");
      const authCodeRequestButton = getByRole("button", {
        name: "인증 요청",
      });
      const authCodeField = getByLabelText("인증 번호");
      const passwordField = getByLabelText("새 비밀번호");
      const passwordConfirmField = getByLabelText("새 비밀번호 재입력");
      const resetPasswordButton = getByRole("button", {
        name: "비밀번호 재설정",
      });

      // when
      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(authCodeField, "123456");
      userEvent.type(passwordField, "test1234");
      userEvent.type(passwordConfirmField, "test1234");
      userEvent.click(resetPasswordButton);

      // then
      await waitFor(
        () => {
          expect(window.location.pathname).toBe("/login");
        },
        { timeout: 2000 }
      );
    });
  });
});