import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { server } from "../../../../mocks/server";
import { AuthCodeRequest } from "../../../api/types";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { ToastContainer } from "../../../toast/components/ToastContainer";
import { SignUpForm } from "../SignUpForm";

describe("SignUpForm", () => {
  function renderAndGetFields() {
    const renderResult = render(
      <>
        <SignUpForm />
        <ToastContainer />
      </>
    );
    const { getByLabelText, getByRole } = renderResult;
    const emailField = getByLabelText("이메일");
    const authCodeRequestButton = getByRole("button", { name: "인증 요청" });
    const signUpAuthCodeField = getByLabelText("인증 번호");
    const passwordField = getByLabelText("비밀번호");
    const passwordConfirmField = getByLabelText("비밀번호 재입력");
    const nicknameField = getByLabelText("닉네임");
    const signUpButton = getByRole("button", { name: "회원가입" });

    return {
      renderResult,
      emailField,
      authCodeRequestButton,
      signUpAuthCodeField,
      passwordField,
      passwordConfirmField,
      nicknameField,
      signUpButton,
    };
  }

  it("회원가입 폼을 렌더링한다.", () => {
    const {
      emailField,
      authCodeRequestButton,
      signUpAuthCodeField,
      passwordField,
      passwordConfirmField,
      nicknameField,
      signUpButton,
    } = renderAndGetFields();

    expect(emailField).toBeInTheDocument();
    expect(authCodeRequestButton).toBeInTheDocument();
    expect(signUpAuthCodeField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
    expect(passwordConfirmField).toBeInTheDocument();
    expect(nicknameField).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();
  });

  describe("이메일 필드를 올바르게 입력하지 않은 상태", () => {
    it("이메일을 입력하지 않으면 회원가입 버튼은 비활성화 상태이다.", () => {
      const {
        nicknameField,
        passwordConfirmField,
        passwordField,
        signUpButton,
      } = renderAndGetFields();

      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "12345678");
      userEvent.type(nicknameField, "tester");

      expect(signUpButton).toBeDisabled();
    });

    it('이메일 형식으로 입력하지 않고 회원가입 버튼을 누르면 "이메일 형식으로 입력해주세요." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findAllByRole } = renderResult;

      userEvent.type(emailField, "test@");
      userEvent.click(authCodeRequestButton);
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "12345678");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const alerts = await findAllByRole("alert");
      expect(alerts[0]).toHaveTextContent("이메일 형식으로 입력해주세요.");
    });
  });

  describe("인증 번호 필드를 올바르게 입력하지 않은 상태", () => {
    it("인증 번호를 입력하지 않으면 회원가입 버튼은 비활성화 상태이다.", () => {
      const {
        emailField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "12345678");
      userEvent.type(nicknameField, "tester");

      expect(signUpButton).toBeDisabled();
    });

    it('숫자 형식의 인증 번호를 입력하지 않고 회원가입 버튼을 누르면 "인증번호가 올바르지 않습니다." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpAuthCodeField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.type(signUpAuthCodeField, "asd123");
      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "12345678");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const signUpAuthCodeAlert = await findByRole("alert");
      expect(signUpAuthCodeAlert).toHaveTextContent(
        "인증번호가 올바르지 않습니다."
      );
    });

    it('인증 번호를 요청한 뒤 시간 제한 내에 회원가입 버튼을 누르지 않으면 "인증 번호를 다시 요청해주세요." 메시지를 보여준다.', async () => {
      // given
      server.use(
        rest.post<AuthCodeRequest>(
          `${process.env.REACT_APP_API_URL}/auth/code`,
          (req, res, ctx) => {
            const { email, purpose } = req.body;
            return res(
              ctx.status(201),
              ctx.json({
                email,
                purpose,
                ttl: 1,
              })
            );
          }
        )
      );
      const { renderResult, emailField, authCodeRequestButton } =
        renderAndGetFields();
      const { getByRole } = renderResult;

      // when
      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );

      // then
      await waitFor(
        () => {
          const authCodeAlert = getByRole("alert");
          expect(authCodeAlert).toHaveTextContent(
            "인증 번호를 다시 요청해주세요."
          );
        },
        { timeout: 2000 }
      );
    });

    server.resetHandlers();
  });

  describe("비밀번호 관련 필드를 올바르게 입력하지 않은 상태", () => {
    it('비밀번호 필드를 입력하지 않고 회원가입 버튼을 누르면 "비밀번호를 입력해주세요." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent("비밀번호를 입력해주세요.");
    });

    it('8자 미만의 비밀번호를 입력하고 회원가입 버튼을 누르면 "비밀번호는 최소 8자 이상이어야 합니다." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(passwordField, "1234");
      userEvent.type(passwordConfirmField, "1234");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent(
        "비밀번호는 최소 8자 이상이어야 합니다."
      );
    });

    it('13자 이상의 비밀번호를 입력하고 회원가입 버튼을 누르면 "비밀번호는 최대 12자 이하여야 합니다." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(passwordField, "1234567890123");
      userEvent.type(passwordConfirmField, "1234567890123");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent(
        "비밀번호는 최대 12자 이하여야 합니다."
      );
    });

    it('비밀번호 재입력 필드를 비밀번호 필드와 동일하게 입력하지 않은 상태에서 회원가입 버튼을 누르면 "비밀번호를 동일하게 입력해주세요." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "1234567");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const passwordConfirmAlert = await findByRole("alert");
      expect(passwordConfirmAlert).toHaveTextContent(
        "비밀번호를 동일하게 입력해주세요."
      );
    });
  });

  describe("닉네임 필드를 올바르게 입력하지 않은 상태", () => {
    it('닉네임을 입력하지 않고 회원가입 버튼을 누르면 "닉네임을 입력해주세요." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "12345678");
      userEvent.click(signUpButton);

      const nicknameAlert = await findByRole("alert");
      expect(nicknameAlert).toHaveTextContent("닉네임을 입력해주세요.");
    });

    it('공백으로만 이루어진 닉네임을 입력하고 회원가입 버튼을 누르면 "공백으로 구성된 닉네임은 사용할 수 없습니다." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "123456");
      userEvent.type(passwordField, "12345678");
      userEvent.type(passwordConfirmField, "12345678");
      userEvent.type(nicknameField, "   ");
      userEvent.click(signUpButton);

      const nicknameAlert = await findByRole("alert");
      expect(nicknameAlert).toHaveTextContent(
        "공백으로 구성된 닉네임은 사용할 수 없습니다."
      );
    });
  });

  describe("서버로의 요청이 실패한 상태", () => {
    it('인증 번호 전송 요청이 실패하면 "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요." 메시지를 보여준다.', async () => {
      const { renderResult, emailField, authCodeRequestButton } =
        renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "wrong@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );

      const nicknameAlert = await findByRole("alert");
      expect(nicknameAlert).toHaveTextContent(
        "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요."
      );
    });

    it('이미 가입된 이메일로 회원가입을 위해 인증 번호 요청을 시도하면 "이미 가입된 이메일입니다." 메시지를 보여준다.', async () => {
      const { renderResult, emailField, authCodeRequestButton } =
        renderAndGetFields();
      const { findByRole, getByRole } = renderResult;

      userEvent.type(emailField, "already@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );

      const emailAlert = await findByRole("alert");
      expect(emailAlert).toHaveTextContent("이미 가입된 이메일입니다.");
    });

    it('인증 번호가 틀리면 "인증 번호가 올바르지 않습니다." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        signUpAuthCodeField,
        passwordField,
        passwordConfirmField,
        nicknameField,
        signUpButton,
      } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(signUpAuthCodeField, "444444");
      userEvent.type(passwordField, "test1234");
      userEvent.type(passwordConfirmField, "test1234");
      userEvent.type(nicknameField, "tester");
      userEvent.click(signUpButton);

      const authCodeAlert = await findByRole("alert");
      expect(authCodeAlert).toHaveTextContent("인증 번호가 올바르지 않습니다.");
    });
  });
});
