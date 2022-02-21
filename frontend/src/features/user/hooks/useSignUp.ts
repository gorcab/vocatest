import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuthCodeMutation, useSignUpMutation } from "../../api/slice";
import { useTimeoutTrigger } from "../../common/hooks/useTimeoutTrigger";
import { is4XXError, is5XXError } from "../../common/utils/helper";
import { useToast } from "../../toast/hooks/useToast";

type SignUpDto = {
  email: string;
  signUpAuthCode: number;
  password: string;
  passwordConfirm: string;
  nickname: string;
};

export const useSignUp = () => {
  const toast = useToast();
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
      isLoading: isAuthCodeRequestLoading,
      error: authCodeError,
      data: authCodeData,
      reset: resetSignUpAuthCodeRequest,
    },
  ] = useAuthCodeMutation();

  const [
    signUp,
    {
      isLoading: isSignUpLoading,
      error: signUpError,
      reset: resetSignUpRequest,
    },
  ] = useSignUpMutation();

  const serverError = useMemo(() => {
    if (isAuthCodeRequestLoading || isSignUpLoading) {
      return null;
    }
    if (
      authCodeError &&
      is4XXError(authCodeError) &&
      !/이메일/.test(authCodeError.data.message)
    ) {
      return authCodeError.data.message;
    }
    if (signUpError && is4XXError(signUpError)) {
      if (
        !/이메일/.test(signUpError.data.message) &&
        !/인증 번호/.test(signUpError.data.message)
      ) {
        return signUpError.data.message;
      }
    }

    return null;
  }, [isAuthCodeRequestLoading, isSignUpLoading, authCodeError, signUpError]);

  // AuthCode request error handling
  useEffect(() => {
    if (authCodeError) {
      if (is4XXError(authCodeError)) {
        if (/이메일/.test(authCodeError.data.message)) {
          setFormError("email", {
            type: "manual",
            message: authCodeError.data.message,
          });
        }
      } else if (is5XXError(authCodeError)) {
        toast({
          type: "ERROR",
          desc: "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
      resetSignUpAuthCodeRequest();
    }
  }, [
    authCodeError,
    setFormError,
    toast,
    isAuthCodeRequestLoading,
    resetSignUpAuthCodeRequest,
  ]);

  // Sign Up request error handling
  useEffect(() => {
    if (signUpError) {
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
        }
      } else if (is5XXError(signUpError)) {
        toast({
          type: "ERROR",
          desc:
            signUpError.data?.message ||
            "회원 가입에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
      resetSignUpRequest();
    }
  }, [signUpError, setFormError, toast, isSignUpLoading, resetSignUpRequest]);

  const onSubmit: SubmitHandler<SignUpDto> = ({
    email,
    password,
    nickname,
    signUpAuthCode,
  }) => {
    if (signUpError) {
      resetSignUpRequest();
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

    resetSignUpAuthCodeRequest();
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
