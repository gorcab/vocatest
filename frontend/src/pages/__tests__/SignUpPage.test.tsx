import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../features/common/utils/test-utils";
import { SignUpPage } from "../SignUpPage";

describe("SignUpPage", () => {
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
        <Route path="sign-up" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/sign-up");
  });

  describe("로그인 된 상태에서 해당 컴포넌트가 렌더링 될 때", () => {
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
    it("로고와 회원가입 폼을 렌더링한다.", () => {
      const { getByRole } = render(Component);

      const textLogo = getByRole("heading", { name: "VOCATEST" });
      const signUpForm = getByRole("form");

      expect(textLogo).toBeInTheDocument();
      expect(signUpForm).toBeInTheDocument();
    });

    it('회원가입에 성공하면 "/" url로 이동한다.', async () => {
      // given
      const { getByRole, getByLabelText } = render(Component);
      const emailField = getByLabelText("이메일");
      const signUpAuthCodeRequestButton = getByRole("button", {
        name: "인증 요청",
      });
      const authCodeField = getByLabelText("인증 번호");
      const passwordField = getByLabelText("비밀번호");
      const passwordConfirmField = getByLabelText("비밀번호 재입력");
      const nicknameField = getByLabelText("닉네임");
      const signUpButton = getByRole("button", { name: "회원가입" });

      // when
      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(signUpAuthCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(authCodeField, "123456");
      userEvent.type(passwordField, "test1234");
      userEvent.type(passwordConfirmField, "test1234");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      // then
      await waitFor(
        () => {
          expect(window.location.pathname).toBe("/");
        },
        { timeout: 2000 }
      );
    });
  });
});
