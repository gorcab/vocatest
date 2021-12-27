import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { server } from "../../../../mocks/server";
import { AuthCodeRequest } from "../../../api/types";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { ResetPasswordForm } from "../ResetPasswordForm";

describe("ResetPasswordForm", () => {
  function renderAndGetFields() {
    const handleSuccess = jest.fn();
    const renderResult = render(
      <ResetPasswordForm handleSuccess={handleSuccess} />
    );
    const { getByLabelText, getByRole } = renderResult;
    const emailField = getByLabelText("이메일");
    const authCodeRequestButton = getByRole("button", { name: "인증 요청" });
    const resetPasswordAuthCodeField = getByLabelText("인증 번호");
    const passwordField = getByLabelText("새 비밀번호");
    const passwordConfirmField = getByLabelText("새 비밀번호 재입력");
    const resetPasswordButton = getByRole("button", {
      name: "비밀번호 재설정",
    });

    return {
      renderResult,
      handleSuccess,
      emailField,
      authCodeRequestButton,
      resetPasswordAuthCodeField,
      passwordField,
      passwordConfirmField,
      resetPasswordButton,
    };
  }

  it("비밀번호 재설정 폼을 렌더링한다.", () => {
    const {
      emailField,
      authCodeRequestButton,
      resetPasswordAuthCodeField,
      passwordField,
      passwordConfirmField,
      resetPasswordButton,
    } = renderAndGetFields();

    expect(emailField).toBeInTheDocument();
    expect(authCodeRequestButton).toBeInTheDocument();
    expect(resetPasswordAuthCodeField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
    expect(passwordConfirmField).toBeInTheDocument();
    expect(resetPasswordButton).toBeInTheDocument();
    expect(resetPasswordButton).toBeDisabled();
  });

  describe("이메일 필드를 올바르게 입력하지 않은 상태", () => {
    it("이메일을 입력하지 않으면 비밀번호 재설정 버튼은 비활성화 상태이다.", () => {
      const { passwordField, passwordConfirmField, resetPasswordButton } =
        renderAndGetFields();

      userEvent.type(passwordField, "test1234");
      userEvent.type(passwordConfirmField, "test1234");

      expect(resetPasswordButton).toBeDisabled();
    });

    it('이메일 형식으로 입력하지 않으면 "이메일 형식으로 입력해주세요." 메시지를 보여준다.', async () => {
      const { renderResult, emailField } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "test@");
      userEvent.tab();

      const emailAlert = await findByRole("alert");
      expect(emailAlert).toHaveTextContent("이메일 형식으로 입력해주세요.");
    });
  });

  describe("인증 번호 필드를 올바르게 입력하지 않은 상태", () => {
    it('인증 번호 필드를 입력하지 않으면 "이메일로 전송된 인증번호를 입력해주세요." 메시지를 보여준다.', async () => {
      const { renderResult, resetPasswordAuthCodeField } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.click(resetPasswordAuthCodeField);
      userEvent.tab();

      const authCodeAlert = await findByRole("alert");
      expect(authCodeAlert).toHaveTextContent(
        "이메일로 전송된 인증번호를 입력해주세요."
      );
    });

    it('숫자 형식의 인증 번호를 입력하지 않으면 "인증번호가 올바르지 않습니다." 메시지를 보여준다.', async () => {
      const { renderResult, resetPasswordAuthCodeField } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(resetPasswordAuthCodeField, "code1234");
      userEvent.tab();

      const authCodeAlert = await findByRole("alert");
      expect(authCodeAlert).toHaveTextContent("인증번호가 올바르지 않습니다.");
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
                ttl: 1, // 제한 시간 1초
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

      server.resetHandlers();
    });
  });

  describe("새 비밀번호 관련 필드를 올바르게 입력하지 않은 상태", () => {
    it('새 비밀번호 필드를 입력하지 않으면 "비밀번호를 입력해주세요." 메시지를 보여준다.', async () => {
      const { renderResult, passwordField } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.click(passwordField);
      userEvent.tab();

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent("비밀번호를 입력해주세요.");
    });

    it('새 비밀번호 필드에 8자 미만의 비밀번호를 입력하고 회원가입 버튼을 누르면 "비밀번호는 최소 8자 이상이어야 합니다." 메시지를 보여준다.', async () => {
      const { renderResult, passwordField } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(passwordField, "test123");
      userEvent.tab();

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent(
        "비밀번호는 최소 8자 이상이어야 합니다."
      );
    });

    it('새 비밀번호 필드에 13자 이상의 비밀번호를 입력하고 회원가입 버튼을 누르면 "비밀번호는 최대 12자 이하여야 합니다." 메시지를 보여준다.', async () => {
      const { renderResult, passwordField } = renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(passwordField, "1234567890123");
      userEvent.tab();

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent(
        "비밀번호는 최대 12자 이하여야 합니다."
      );
    });

    it('새 비밀번호 재입력 필드에 새 비밀번호 필드와 동일하게 입력하지 않으면 "새 비밀번호를 동일하게 입력해주세요." 메시지를 보여준다.', async () => {
      const { renderResult, passwordField, passwordConfirmField } =
        renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(passwordField, "test1234");
      userEvent.type(passwordConfirmField, "test123");
      userEvent.tab();

      const passwordAlert = await findByRole("alert");
      expect(passwordAlert).toHaveTextContent(
        "새 비밀번호를 동일하게 입력해주세요."
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

      const serverErrorAlert = await findByRole("alert");

      expect(serverErrorAlert).toHaveTextContent(
        "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요."
      );
    });

    it('회원가입 되지 않은 이메일로 인증 번호 요청을 시도하면 "가입되지 않은 이메일입니다." 메시지를 보여준다.', async () => {
      const { renderResult, emailField, authCodeRequestButton } =
        renderAndGetFields();
      const { findByRole } = renderResult;

      userEvent.type(emailField, "notexists@gmail.com");
      userEvent.click(authCodeRequestButton);

      const serverErrorAlert = await findByRole("alert");
      expect(serverErrorAlert).toHaveTextContent("가입되지 않은 이메일입니다.");
    });

    it('인증 번호가 틀리면 "인증 번호가 올바르지 않습니다." 메시지를 보여준다.', async () => {
      const {
        renderResult,
        emailField,
        authCodeRequestButton,
        resetPasswordAuthCodeField,
        passwordField,
        passwordConfirmField,
        resetPasswordButton,
      } = renderAndGetFields();
      const { getByRole } = renderResult;

      userEvent.type(emailField, "tester@gmail.com");
      userEvent.click(authCodeRequestButton);
      await waitForElementToBeRemoved(
        document.querySelector("svg.animate-spin")
      );
      userEvent.type(resetPasswordAuthCodeField, "444444");
      userEvent.type(passwordField, "test1234");
      userEvent.type(passwordConfirmField, "test1234");
      userEvent.click(resetPasswordButton);

      await waitFor(() => {
        expect(getByRole("alert")).toHaveTextContent(
          "인증 번호가 올바르지 않습니다."
        );
      });
    });
  });

  it("비밀번호 재설정에 성공하면 handleSuccess prop을 호출한다.", async () => {
    const {
      emailField,
      handleSuccess,
      authCodeRequestButton,
      resetPasswordAuthCodeField,
      passwordField,
      passwordConfirmField,
      resetPasswordButton,
    } = renderAndGetFields();

    userEvent.type(emailField, "tester@gmail.com");
    userEvent.click(authCodeRequestButton);
    await waitForElementToBeRemoved(document.querySelector("svg.animate-spin"));
    userEvent.type(resetPasswordAuthCodeField, "123456");
    userEvent.type(passwordField, "test1234");
    userEvent.type(passwordConfirmField, "test1234");
    userEvent.click(resetPasswordButton);

    await waitFor(
      () => {
        expect(handleSuccess).toBeCalled();
      },
      { timeout: 2000 }
    );
  });
});
