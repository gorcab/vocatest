import { BasicForm } from "features/common/components/BasicForm";
import { Button } from "features/common/components/Button";
import { Input } from "features/common/components/Input";
import { InputErrorMessage } from "features/common/components/InputErrorMessage";
import { InputGroup } from "features/common/components/InputGroup";
import { Label } from "features/common/components/Label";
import { Spinner } from "features/common/components/Spinner";
import { User } from "features/user/slice";
import { SubmitHandler, useForm } from "react-hook-form";

export type UpdateUserDto = {
  password: string;
  newPassword: string;
  newPasswordConfirm: string;
  newNickname: string;
};

type EditProfileFormProps = {
  user: User;
  onSubmit: SubmitHandler<UpdateUserDto>;
  isEditLoading: boolean;
};

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  user,
  onSubmit,
  isEditLoading,
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<UpdateUserDto>({
    defaultValues: {
      newNickname: user.nickname ?? "",
    },
  });

  return (
    <BasicForm formLabel="프로필 수정 폼" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-10">
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
          {errors.password && (
            <InputErrorMessage as="div">
              {errors.password.message}
            </InputErrorMessage>
          )}
        </InputGroup>
        <InputGroup>
          <Label name="newPassword" label="새 비밀번호" />
          <Input
            type="password"
            id="newPassword"
            register={register("newPassword", {
              required: "변경할 비밀번호를 입력해주세요.",
              minLength: {
                value: 8,
                message: "새 비밀번호는 최소 8자 이상이어야 합니다.",
              },
              maxLength: {
                value: 12,
                message: "새 비밀번호는 최대 12자 이하여야 합니다.",
              },
            })}
          />
          {errors.newPassword && (
            <InputErrorMessage as="div">
              {errors.newPassword.message}
            </InputErrorMessage>
          )}
        </InputGroup>
        <InputGroup>
          <Label name="newPasswordConfirm" label="새 비밀번호 확인" />
          <Input
            type="password"
            id="newPasswordConfirm"
            register={register("newPasswordConfirm", {
              validate: (value) =>
                value === getValues("newPassword") ||
                "새 비밀번호와 동일하게 입력해주세요.",
            })}
          />
          {errors.newPasswordConfirm && (
            <InputErrorMessage as="div">
              {errors.newPasswordConfirm.message}
            </InputErrorMessage>
          )}
        </InputGroup>
        <InputGroup>
          <Label name="newNickname" label="닉네임" />
          <Input
            type="text"
            id="newNickname"
            register={register("newNickname", {
              required: "변경할 닉네임을 입력해주세요.",
              validate: {
                whiteSpaceNickname: (value) =>
                  value.trim() !== "" ||
                  "공백으로 구성된 닉네임은 사용할 수 없습니다.",
              },
            })}
          />
          {errors.newNickname && (
            <InputErrorMessage as="div">
              {errors.newNickname.message}
            </InputErrorMessage>
          )}
        </InputGroup>
      </div>
      <Button type="submit" disabled={isEditLoading}>
        {isEditLoading ? (
          <Spinner size={24} thickness={2} gap={2} color="#fff" />
        ) : (
          "변경하기"
        )}
      </Button>
    </BasicForm>
  );
};
