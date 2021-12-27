import { useEffect, useLayoutEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthCodeMutation, useResetPasswordMutation } from "../../api/slice";
import { ErrorResponse } from "../../api/types";
import { useTimeoutTrigger } from "../../common/hooks/useTimeoutTrigger";

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

    setError,
    clearErrors,
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
      data,
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

  useEffect(() => {
    if (authCodeError && "data" in authCodeError) {
      const { status, data } = authCodeError;
      const errorMessage: string = (data as ErrorResponse).message;
      if (status >= 500) {
        setServerError(errorMessage);
      } else if (status >= 400) {
        if (/이메일/.test(errorMessage)) {
          setError("email", {
            type: "manual",
            message: errorMessage,
          });
        } else {
          setServerError(errorMessage);
        }
      }
    } else if (!authCodeError) {
      setServerError(null);
    }
  }, [authCodeError, setError]);

  useEffect(() => {
    if (resetPasswordError && "data" in resetPasswordError) {
      const { status, data } = resetPasswordError;
      const errorMessage = (data as ErrorResponse).message;
      if (status >= 500) {
        setServerError(errorMessage);
      } else if (status >= 400) {
        if (/이메일/.test(errorMessage)) {
          setError("email", {
            type: "manual",
            message: errorMessage,
          });
        } else {
          setServerError(errorMessage);
        }
      }
    } else if (!resetPasswordError) {
      setServerError(null);
    }
  }, [resetPasswordError, setError]);

  const authCodeTimeoutTrigger = () => {
    setError("resetPasswordAuthCode", {
      type: "manual",
      message: "인증 번호를 다시 요청해주세요.",
    });
    if (!!serverError) {
      setServerError(null);
    }
    resetAuthCodeRequest();
  };

  const { ttl, isSet } = useTimeoutTrigger(
    authCodeTimeoutTrigger,
    isAuthCodeRequestSuccess && data
      ? { isSetTimeout: true, ttl: data.ttl }
      : { isSetTimeout: false }
  );

  useLayoutEffect(() => {
    if (isResetPasswordSuccess) {
      handleSuccess();
    }
  }, [isResetPasswordSuccess, handleSuccess]);

  const handleResetPasswordAuthCodeButton = async () => {
    if (errors.resetPasswordAuthCode) {
      clearErrors("resetPasswordAuthCode");
    }

    if (!!serverError) {
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
