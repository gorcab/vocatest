import { useEffect, useLayoutEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthCodeMutation, useSignUpMutation } from "../../api/slice";
import { ErrorResponse } from "../../api/types";
import { useTimeoutTrigger } from "../../common/hooks/useTimeoutTrigger";

type SignUpDto = {
  email: string;
  signUpAuthCode: number;
  password: string;
  passwordConfirm: string;
  nickname: string;
};

export const useSignUp = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    getValues,
    handleSubmit,
    setError,
    formState: { errors },
    clearErrors,
  } = useForm<SignUpDto>({
    mode: "onBlur",
  });

  const [
    requestSignUpAuthCode,
    {
      isSuccess: isAuthCodeRequestSuccess,
      isLoading: isAuthCodeRequestLoading,
      reset: signUpAuthCodeReset,
      data,
      error: authCodeErrorResponse,
    },
  ] = useAuthCodeMutation();

  const [
    signUp,
    {
      isSuccess: isSignUpSuccess,
      isLoading: isSignUpLoading,
      error: signUpErrorResponse,
      reset: signUpReset,
    },
  ] = useSignUpMutation();

  useEffect(() => {
    if (authCodeErrorResponse && "data" in authCodeErrorResponse) {
      const { status, data } = authCodeErrorResponse;
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
    }
  }, [authCodeErrorResponse, setError]);

  useEffect(() => {
    if (signUpErrorResponse && "data" in signUpErrorResponse) {
      const { status, data } = signUpErrorResponse;
      const errorMessage: string = (data as ErrorResponse).message;
      if (status >= 500) {
        setServerError(errorMessage);
      } else if (status >= 400) {
        if (/이메일/.test(errorMessage)) {
          setError("email", {
            type: "manual",
            message: errorMessage,
          });
        } else if (/인증 번호/.test(errorMessage)) {
          setError("signUpAuthCode", {
            type: "manual",
            message: errorMessage,
          });
        } else {
          setServerError(errorMessage);
        }
      }
    }
  }, [signUpErrorResponse, setError]);

  const onSubmit: SubmitHandler<SignUpDto> = ({
    email,
    password,
    nickname,
    signUpAuthCode,
  }) => {
    if (signUpErrorResponse) {
      signUpReset();
    }

    signUp({
      email,
      password,
      nickname,
      signUpAuthCode,
    });
  };

  const signUpAuthCodeTimeoutTrigger = () => {
    setError("signUpAuthCode", {
      type: "manual",
      message: "인증 번호를 다시 요청해주세요.",
    });
    if (!!serverError) {
      setServerError(null);
    }
    signUpAuthCodeReset();
  };

  const { ttl, isSet } = useTimeoutTrigger(
    signUpAuthCodeTimeoutTrigger,
    isAuthCodeRequestSuccess && data
      ? { isSetTimeout: true, ttl: data.ttl }
      : { isSetTimeout: false }
  );

  const handleSignUpAuthCodeButton = async () => {
    if (errors.signUpAuthCode) {
      clearErrors("signUpAuthCode");
    }

    if (!!serverError) {
      setServerError(null);
      signUpAuthCodeReset();
    }

    if (!errors.email) {
      const email = getValues("email");
      await requestSignUpAuthCode({
        purpose: "SIGN_UP",
        email,
      });
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  return {
    register,
    getValues,
    submitHandler,
    errors,
    serverError,
    ttl,
    isSet,
    isAuthCodeRequestLoading,
    handleSignUpAuthCodeButton,
    isSignUpLoading,
  };
};
