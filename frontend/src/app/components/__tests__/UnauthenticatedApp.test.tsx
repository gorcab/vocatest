import { BrowserRouter, Routes } from "react-router-dom";
import { render } from "../../../features/common/utils/test-utils";
import { UnauthenticatedApp } from "../UnauthenticatedApp";

describe("UnauthenticatedApp", () => {
  function renderUnauthenticatedApp(initialUrl: string = "/") {
    window.history.replaceState({}, "", initialUrl);

    const { getByRole } = render(
      <BrowserRouter>
        <UnauthenticatedApp />
      </BrowserRouter>
    );

    return {
      getByRole,
    };
  }
  it("`/login` url로 접속하면 LoginPage를 렌더링한다.", async () => {
    const loginUrl = "/login";
    const { getByRole } = renderUnauthenticatedApp(loginUrl);

    const loginButton = getByRole("button", { name: "로그인" });

    expect(loginButton).toBeInTheDocument();
    expect(window.location.pathname).toBe(loginUrl);
  });

  it("`/sign-up` url로 접속하면 SignUpPage를 렌더링한다.", async () => {
    const signUpUrl = "/sign-up";
    const { getByRole } = renderUnauthenticatedApp(signUpUrl);

    const signUpButton = getByRole("button", { name: "회원가입" });

    expect(signUpButton).toBeInTheDocument();
    expect(window.location.pathname).toBe(signUpUrl);
  });

  it("`/reset-password` url로 접속하면 ResetPasswordPage를 렌더링한다.", async () => {
    const resetPasswordUrl = "/reset-password";
    const { getByRole } = renderUnauthenticatedApp(resetPasswordUrl);

    const resetPasswordButton = getByRole("button", {
      name: "비밀번호 재설정",
    });

    expect(resetPasswordButton).toBeInTheDocument();
    expect(window.location.pathname).toBe(resetPasswordUrl);
  });

  it("해당 컴포넌트에서 처리하는 url이 아니라면 `/login` url로 redirect된다.", async () => {
    const profileUrl = "/profile";
    renderUnauthenticatedApp(profileUrl);

    expect(window.location.pathname).toBe("/login");
  });
});
