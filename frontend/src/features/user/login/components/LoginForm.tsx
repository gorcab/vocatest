import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useLoginMutation } from "features/api/slice";
import { useToast } from "features/toast/hooks/useToast";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { BasicForm } from "features/common/components/BasicForm";
import { InputErrorMessage } from "features/common/components/InputErrorMessage";
import { InputGroup } from "features/common/components/InputGroup";
import { Label } from "features/common/components/Label";
import { Input } from "features/common/components/Input";
import { Button } from "features/common/components/Button";
import { Spinner } from "features/common/components/Spinner";

type LoginDto = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>();
  const [login, { isLoading, error, reset }] = useLoginMutation();
  const toast = useToast();
  const onSubmit: SubmitHandler<LoginDto> = (data) => {
    login(data);
  };

  useEffect(() => {
    if (error && is5XXError(error)) {
      toast({
        type: "ERROR",
        desc:
          error.data?.message ||
          "로그인에 실패했습니다. 잠시 후에 다시 시도해주세요.",
      });
      reset();
    }
  }, [error, reset, toast]);

  return (
    <BasicForm onSubmit={handleSubmit(onSubmit)}>
      {is4XXError(error) ? (
        <InputErrorMessage
          as="h2"
          isCenter={true}
          style={{ marginBottom: "1em" }}
        >
          {error.data.message}
        </InputErrorMessage>
      ) : null}
      <div className="mb-5">
        <InputGroup>
          <Label name="email" label="이메일" />
          <Input
            type="email"
            id="email"
            register={register("email", {
              required: "이메일을 입력해주세요.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "이메일 형식으로 입력해주세요.",
              },
            })}
          />
          {errors.email ? (
            <InputErrorMessage as="div">
              {errors.email.message}
            </InputErrorMessage>
          ) : null}
        </InputGroup>
        <InputGroup>
          <Label name="password" label="비밀번호" />
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
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Spinner size={24} thickness={2} gap={2} color="#fff" />
        ) : (
          "로그인"
        )}
      </Button>
    </BasicForm>
  );
};
