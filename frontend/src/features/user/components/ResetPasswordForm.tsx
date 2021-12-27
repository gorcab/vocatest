import { BasicForm } from "../../common/components/BasicForm";
import { Button } from "../../common/components/Button";
import { Input } from "../../common/components/Input";
import { InputErrorMessage } from "../../common/components/InputErrorMessage";
import { InputGroup } from "../../common/components/InputGroup";
import { InputRightElement } from "../../common/components/InputRightElement";
import { Label } from "../../common/components/Label";
import { Spinner } from "../../common/components/Spinner";
import { useResetPassword } from "../hooks/useResetPassword";

type ResetPasswordFormProps = {
  handleSuccess: () => void;
};

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  handleSuccess,
}) => {
  const {
    errors,
    handleResetPasswordAuthCodeButton,
    isAuthCodeRequestLoading,
    isResetPasswordLoading,
    isSet,
    register,
    getValues,
    submitHandler,
    serverError,
    ttl,
  } = useResetPassword(handleSuccess);

  return (
    <BasicForm onSubmit={submitHandler}>
      {serverError ? (
        <InputErrorMessage
          as="h2"
          isCenter={true}
          style={{ marginBottom: "1em" }}
        >
          {serverError}
        </InputErrorMessage>
      ) : null}
      <div className="mb-6">
        <Label name="email" label="이메일" />
        <InputGroup
          style={{
            marginBottom: errors.email ? 0 : "1em",
          }}
        >
          <Input
            type="email"
            id="email"
            style={{ paddingRight: "4em" }}
            register={register("email", {
              required: "이메일을 입력해주세요.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "이메일 형식으로 입력해주세요.",
              },
            })}
          />
          <InputRightElement>
            <Button
              type="button"
              disabled={isAuthCodeRequestLoading}
              style={{ width: "5em", fontSize: "0.7em" }}
              onClick={handleResetPasswordAuthCodeButton}
            >
              {isAuthCodeRequestLoading ? (
                <Spinner gap={2} thickness={2} size="1em" color="#fff" />
              ) : (
                "인증 요청"
              )}
            </Button>
          </InputRightElement>
        </InputGroup>
        {errors.email ? (
          <InputErrorMessage as="div" style={{ marginBottom: "1em" }}>
            {errors.email.message}
          </InputErrorMessage>
        ) : null}
        <Label name="resetPasswordAuthCode" label="인증 번호" />
        <InputGroup
          style={{ marginBottom: errors.resetPasswordAuthCode ? 0 : "1em" }}
        >
          <Input
            type="text"
            id="resetPasswordAuthCode"
            style={{
              paddingRight: ttl >= 0 ? "4em" : 0,
            }}
            register={register("resetPasswordAuthCode", {
              valueAsNumber: true,
              required: "이메일로 전송된 인증번호를 입력해주세요.",
              validate: {
                codeFormat: (value) =>
                  !isNaN(value) || "인증번호가 올바르지 않습니다.",
                timeout: () => {
                  return ttl > 0 || "인증 번호를 다시 요청해주세요.";
                },
              },
            })}
          />
          {isSet && ttl >= 0 && (
            <InputRightElement>
              <span className="text-slate-500 text-sm">
                {new Date(ttl * 1000).toISOString().substr(14, 5)}
              </span>
            </InputRightElement>
          )}
        </InputGroup>
        {errors.resetPasswordAuthCode ? (
          <InputErrorMessage as="div" style={{ marginBottom: "1em" }}>
            {errors.resetPasswordAuthCode.message}
          </InputErrorMessage>
        ) : null}
        <InputGroup>
          <Label name="password" label="새 비밀번호" />
          <Input
            type="password"
            id="password"
            register={register("password", {
              required: "비밀번호를 입력해주세요.",
              minLength: {
                value: 8,
                message: "비밀번호는 최소 8자 이상이어야 합니다.",
              },
              maxLength: {
                value: 12,
                message: "비밀번호는 최대 12자 이하여야 합니다.",
              },
            })}
          />
          {errors.password ? (
            <InputErrorMessage as="div">
              {errors.password.message}
            </InputErrorMessage>
          ) : null}
        </InputGroup>
        <InputGroup>
          <Label name="passwordConfirm" label="새 비밀번호 재입력" />
          <Input
            type="password"
            id="passwordConfirm"
            register={register("passwordConfirm", {
              validate: (value) =>
                value === getValues("password") ||
                "새 비밀번호를 동일하게 입력해주세요.",
            })}
          />
          {errors.passwordConfirm ? (
            <InputErrorMessage as="div">
              {errors.passwordConfirm.message}
            </InputErrorMessage>
          ) : null}
        </InputGroup>
      </div>
      <Button
        type="submit"
        disabled={
          isAuthCodeRequestLoading || isResetPasswordLoading || ttl <= 0
        }
      >
        {isResetPasswordLoading ? (
          <Spinner size={24} thickness={2} gap={2} color="#fff" />
        ) : (
          "비밀번호 재설정"
        )}
      </Button>
    </BasicForm>
  );
};
