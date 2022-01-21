import { useEffect, useLayoutEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthCodeMutation, useSignUpMutation } from "../../api/slice";
import { ErrorResponse } from "../../api/types";
import { useTimeoutTrigger } from "../../common/hooks/useTimeoutTrigger";
import { is4XXError, is5XXError } from "../../common/utils/helper";

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
    setError: setFormError,
    formState: { errors },
    clearErrors: clearFormErrors,
  } = useForm<SignUpDto>({
    mode: "onBlur",
  });
  const [
    requestSignUpAuthCode,
    {
      isSuccess: isAuthCodeRequestSuccess,
      isLoading: isAuthCodeRequestLoading,
      error: authCodeError,
      data: authCodeData,
      reset: signUpAuthCodeRequestReset,
    },
  ] = useAuthCodeMutation();

  const [
    signUp,
    {
      isSuccess: isSignUpSuccess,
      isLoading: isSignUpLoading,
      error: signUpError,
      reset: signUpRequestReset,
    },
  ] = useSignUpMutation();

  // AuthCode request error handling
  useEffect(() => {
    if (is4XXError(authCodeError)) {
      if (/이메일/.test(authCodeError.data.message)) {
        setFormError("email", {
          type: "manual",
          message: authCodeError.data.message,
        });
      } else {
        setServerError(authCodeError.data.message);
      }
    } else if (is5XXError(authCodeError)) {
      setServerError(authCodeError.data.message);
    }
  }, [authCodeError, setFormError]);

  // Sign Up request error handling
  useEffect(() => {
    if (is4XXError(signUpError)) {
      if (/이메일/.test(signUpError.data.message)) {
        setFormError("email", {
          type: "manual",
          message: signUpError.data.message,
        });
      } else if (/인증 번호/.test(signUpError.data.message)) {
        setFormError("signUpAuthCode", {
          type: "manual",
          message: signUpError.data.message,
        });
      } else {
        setServerError(signUpError.data.message);
      }
    } else if (is5XXError(signUpError)) {
      setServerError(signUpError.data.message);
    }
  }, [signUpError, setFormError]);

  const onSubmit: SubmitHandler<SignUpDto> = ({
    email,
    password,
    nickname,
    signUpAuthCode,
  }) => {
    if (signUpError) {
      signUpRequestReset();
    }

    signUp({
      email,
      password,
      nickname,
      signUpAuthCode,
    });
  };

  const submitHandler = handleSubmit(onSubmit);

  const signUpAuthCodeTimeoutTrigger = () => {
    setFormError("signUpAuthCode", {
      type: "manual",
      message: "인증 번호를 다시 요청해주세요.",
    });
    if (Boolean(serverError)) {
      setServerError(null);
    }
    signUpAuthCodeRequestReset();
  };

  const { ttl, isSet } = useTimeoutTrigger(
    signUpAuthCodeTimeoutTrigger,
    authCodeData
      ? { isSetTimeout: true, ttl: authCodeData.ttl }
      : { isSetTimeout: false }
  );

  const handleSignUpAuthCodeButton = async () => {
    if (errors.signUpAuthCode) {
      clearFormErrors("signUpAuthCode");
    }

    if (Boolean(serverError)) {
      setServerError(null);
      signUpAuthCodeRequestReset();
    }

    if (!errors.email) {
      const email = getValues("email");
      await requestSignUpAuthCode({
        purpose: "SIGN_UP",
        email,
      });
    }
  };

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
