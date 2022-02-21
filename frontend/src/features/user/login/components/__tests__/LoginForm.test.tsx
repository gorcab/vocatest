import userEvent from "@testing-library/user-event";
import { render } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { server } from "mocks/test/server";
import {
  serverErrorForLoginResponse,
  unregisteredEmailForLoginResponse,
} from "mocks/test/user.mock";
import { LoginForm } from "../LoginForm";

describe("LoginForm", () => {
  const Component = (
    <>
      <LoginForm />
      <ToastContainer />
    </>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/login");
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("로그인 폼을 렌더링한다.", () => {
    const { getByLabelText, getByRole } = render(Component);
    const emailField = getByLabelText("이메일");
    const passwordField = getByLabelText("비밀번호");
    const loginButton = getByRole("button", { name: "로그인" });

    expect(emailField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  describe("이메일 형식이 올바르지 않은 상태", () => {
    it('이메일을 입력하지 않고 로그인 버튼을 누르면 "이메일을 입력해주세요." 메시지를 보여준다.', async () => {
      const { getByLabelText, getByRole, findByRole } = render(Component);

      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(passwordField, "test1234");
      userEvent.click(loginButton);

      expect(await findByRole("alert")).toHaveTextContent(
        "이메일을 입력해주세요."
      );
    });

    it('올바르지 않은 이메일 형식을 입력한 뒤 로그인 버튼을 누르면 "이메일 형식으로 입력해주세요." 메시지를 보여준다.', async () => {
      const { getByLabelText, getByRole, findByRole } = render(Component);

      const emailField = getByLabelText("이메일");
      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(emailField, "test@gma");
      userEvent.type(passwordField, "test1234");
      userEvent.click(loginButton);

      expect(await findByRole("alert")).toHaveTextContent(
        "이메일 형식으로 입력해주세요."
      );
    });
  });

  describe("비밀번호가 올바르지 않은 상태", () => {
    it('비밀번호를 입력하지 않고 로그인 버튼을 누르면 "비밀번호를 입력해주세요." 메시지를 보여준다.', async () => {
      const { getByLabelText, findByRole, getByRole } = render(Component);

      const emailField = getByLabelText("이메일");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(loginButton);

      expect(await findByRole("alert")).toHaveTextContent(
        "비밀번호를 입력해주세요."
      );
    });

    it('8자 미만의 비밀번호를 입력하고 로그인 버튼을 누르면 "비밀번호는 최소 8자 이상이어야 합니다." 메시지를 보여준다.', async () => {
      const { getByLabelText, findByRole, getByRole } = render(Component);

      const emailField = getByLabelText("이메일");
      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.type(passwordField, "1234567");
      userEvent.click(loginButton);

      expect(await findByRole("alert")).toHaveTextContent(
        "비밀번호는 최소 8자 이상이어야 합니다."
      );
    });

    it('13자 이상의 비밀번호를 입력하고 로그인 버튼을 누르면 "비밀번호는 최대 12자 이하여야 합니다." 메시지를 보여준다.', async () => {
      const { getByLabelText, findByRole, getByRole } = render(Component);

      const emailField = getByLabelText("이메일");
      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.type(passwordField, "1234567890123");
      userEvent.click(loginButton);

      expect(await findByRole("alert")).toHaveTextContent(
        "비밀번호는 최대 12자 이하여야 합니다."
      );
    });
  });

  describe("이메일과 비밀번호를 올바르게 입력한 상태", () => {
    it('가입되지 않은 이메일로 로그인을 시도하면 "이메일 또는 비밀번호가 올바르지 않습니다." 메시지를 보여준다 ', async () => {
      server.use(unregisteredEmailForLoginResponse);
      const { getByLabelText, findByRole, getByRole } = render(Component);

      const emailField = getByLabelText("이메일");
      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(emailField, "wrong@gmail.com");
      userEvent.type(passwordField, "12345678");
      userEvent.click(loginButton);

      expect(await findByRole("alert")).toHaveTextContent(
        "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    });

    it("서버 측 에러(5XX 에러)로 인해 로그인에 실패하면 에러 메시지를 Toast로 띄운다.", async () => {
      server.use(serverErrorForLoginResponse);
      const { getByLabelText, findByRole, getByRole } = render(Component);

      const emailField = getByLabelText("이메일");
      const passwordField = getByLabelText("비밀번호");
      const loginButton = getByRole("button", { name: "로그인" });

      userEvent.type(emailField, "wrong@gmail.com");
      userEvent.type(passwordField, "12345678");
      userEvent.click(loginButton);

      const alertMessage = await findByRole("alert");
      expect(alertMessage).toHaveTextContent(
        /로그인에 실패했습니다. 잠시 후에 다시 시도해주세요./g
      );
    });
  });
});
