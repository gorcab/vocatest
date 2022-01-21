import { useEffect, useLayoutEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthCodeMutation, useResetPasswordMutation } from "../../api/slice";
import { ErrorResponse } from "../../api/types";
import { useTimeoutTrigger } from "../../common/hooks/useTimeoutTrigger";
import { is4XXError, is5XXError } from "../../common/utils/helper";

type ResetPasswordDto = {
  email: string;
  resetPasswordAuthCode: number;
  password: string;
  passwordConfirm: string;
};

export const useResetPassword = (handleSuccess: () => void) => {
  const [serverError, setServerError] = useState<string | null>(null);
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
      isSuccess: isAuthCodeRequestSuccess,
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
        setServerError(authCodeError.data.message);
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
    } else {
      if (Boolean(serverError)) {
        setServerError(null);
      }
    }
  }, [authCodeError, setFormError]);

  // Reset password request error handling
  useEffect(() => {
    if (resetPasswordError) {
      if (is5XXError(resetPasswordError)) {
        setServerError(resetPasswordError.data.message);
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
    } else {
      if (Boolean(serverError)) {
        setServerError(null);
      }
    }
  }, [resetPasswordError, setFormError]);

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
