import { useEffect, useLayoutEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthCodeMutation, useResetPasswordMutation } from "../../api/slice";
import { useTimeoutTrigger } from "../../common/hooks/useTimeoutTrigger";
import { is4XXError, is5XXError } from "../../common/utils/helper";
import { useToast } from "../../toast/hooks/useToast";

type ResetPasswordDto = {
  email: string;
  resetPasswordAuthCode: number;
  password: string;
  passwordConfirm: string;
};

export const useResetPassword = (handleSuccess: () => void) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },

    setError: setFormError,
    clearErrors: clearFormErrors,
    getValues,
  } = useForm<ResetPasswordDto>({
    mode: "onBlur",
  });

  const [
    requestResetPasswordAuthCode,
    {
      isLoading: isAuthCodeRequestLoading,
      error: authCodeError,
      data: authCodeData,
      reset: resetAuthCodeRequest,
    },
  ] = useAuthCodeMutation();

  const [
    resetPassword,
    {
      isSuccess: isResetPasswordSuccess,
      isLoading: isResetPasswordLoading,
      isError: isResetPasswordError,
      error: resetPasswordError,
      reset: resetPasswordReset,
    },
  ] = useResetPasswordMutation();

  // Auth code request error handling
  useEffect(() => {
    if (authCodeError) {
      if (is5XXError(authCodeError)) {
        toast({
          type: "ERROR",
          desc:
            authCodeError.data?.message ||
            "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      } else if (is4XXError(authCodeError)) {
        const message = authCodeError.data.message;
        if (/이메일/.test(message)) {
          setFormError("email", {
            type: "manual",
            message,
          });
        } else {
          setServerError(message);
        }
      }
      resetAuthCodeRequest();
    } else if (isAuthCodeRequestLoading && serverError) {
      setServerError(null);
    }
  }, [
    authCodeError,
    serverError,
    setFormError,
    isAuthCodeRequestLoading,
    resetAuthCodeRequest,
    toast,
  ]);

  // Reset password request error handling
  useEffect(() => {
    if (resetPasswordError) {
      if (is5XXError(resetPasswordError)) {
        toast({
          type: "ERROR",
          desc:
            resetPasswordError.data?.message ||
            "비밀번호 재설정에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      } else if (is4XXError(resetPasswordError)) {
        const message = resetPasswordError.data.message;
        if (/이메일/.test(message)) {
          setFormError("email", {
            type: "manual",
            message,
          });
        } else {
          setServerError(message);
        }
      }
      resetPasswordReset();
    } else if (isResetPasswordSuccess && serverError) {
      setServerError(null);
    }
  }, [
    resetPasswordError,
    setFormError,
    serverError,
    isResetPasswordSuccess,
    toast,
    resetPasswordReset,
  ]);

  const authCodeTimeoutTrigger = () => {
    setFormError("resetPasswordAuthCode", {
      type: "manual",
      message: "인증 번호를 다시 요청해주세요.",
    });
    if (Boolean(serverError)) {
      setServerError(null);
    }
    resetAuthCodeRequest();
  };

  const { ttl, isSet } = useTimeoutTrigger(
    authCodeTimeoutTrigger,
    authCodeData
      ? { isSetTimeout: true, ttl: authCodeData.ttl }
      : { isSetTimeout: false }
  );

  useLayoutEffect(() => {
    if (isResetPasswordSuccess) {
      handleSuccess();
    }
  }, [isResetPasswordSuccess, handleSuccess]);

  const handleResetPasswordAuthCodeButton = async () => {
    if (errors.resetPasswordAuthCode) {
      clearFormErrors("resetPasswordAuthCode");
    }

    if (Boolean(serverError)) {
      setServerError(null);
      resetAuthCodeRequest();
    }

    if (!errors.email) {
      const email = getValues("email");
      await requestResetPasswordAuthCode({
        purpose: "RESET_PASSWORD",
        email,
      });
    }
  };

  const onSubmit: SubmitHandler<ResetPasswordDto> = ({
    email,
    password,
    resetPasswordAuthCode,
  }) => {
    if (isResetPasswordError) {
      resetPasswordReset();
    }
    resetPassword({
      email,
      password,
      resetPasswordAuthCode,
    });
  };

  const submitHandler = handleSubmit(onSubmit);

  return {
    getValues,
    serverError,
    submitHandler,
    errors,
    register,
    isAuthCodeRequestLoading,
    isResetPasswordLoading,
    handleResetPasswordAuthCodeButton,
    isSet,
    ttl,
  };
};
