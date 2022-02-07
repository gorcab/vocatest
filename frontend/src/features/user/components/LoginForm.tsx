import { SubmitHandler, useForm } from "react-hook-form";
import { BasicForm } from "../../common/components/BasicForm";
import { Button } from "../../common/components/Button";
import { Input } from "../../common/components/Input";
import { useLoginMutation } from "../../api/slice";
import { Spinner } from "../../common/components/Spinner";
import { Label } from "../../common/components/Label";
import { InputErrorMessage } from "../../common/components/InputErrorMessage";
import { InputGroup } from "../../common/components/InputGroup";
import { is4XXError, is5XXError } from "../../common/utils/helper";
import { useEffect } from "react";
import { useToast } from "../../toast/hooks/useToast";

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
