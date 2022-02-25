import { useUpdateUserMutation } from "features/api/slice";
import { UpdateUserRequest } from "features/api/types";
import { useAuth } from "features/common/hooks/useAuth";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { useToast } from "features/toast/hooks/useToast";
import {
  EditProfileForm,
  UpdateUserDto,
} from "features/user/profile/components/EditProfileForm";
import { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { Navigate } from "react-router";

export const EditUserProfilePage: React.FC = () => {
  const user = useAuth();
  const toast = useToast();
  const [
    mutateUserProfile,
    { isLoading: isEditLoading, isSuccess, error: mutationError },
  ] = useUpdateUserMutation();

  const updateUser: SubmitHandler<UpdateUserDto> = (data) => {
    if (user) {
      const { id, email } = user;
      const { password, newPassword, newNickname } = data;
      const updateUserDtoWithId: UpdateUserRequest & { id: number } = {
        id,
        email,
        password,
        newPassword,
        newNickname,
      };
      mutateUserProfile(updateUserDtoWithId);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({ type: "SUCCESS", desc: "성공적으로 프로필이 변경되었습니다." });
    }
  }, [isSuccess, toast]);

  useEffect(() => {
    if (mutationError) {
      if (is4XXError(mutationError) || is5XXError(mutationError)) {
        toast({
          type: "INFO",
          desc:
            mutationError.data?.message ??
            "프로필 변경에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      } else {
        toast({
          type: "INFO",
          desc: "서버 측 에러로 인해 프로필 변경에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }
  }, [mutationError, toast]);

  if (isSuccess || !user) {
    return <Navigate to="/" replace={!user} />;
  }

  return (
    <div className="h-[70vh] flex items-center">
      <div className="w-full max-w-[30em] md:w-1/2 lg:w-1/3 mx-auto flex flex-col justify-center items-center rounded border p-5 bg-white shadow-sm">
        <h2 className="text-blue-500 text-center text-3xl font-extrabold mb-4">
          내 프로필
        </h2>
        <EditProfileForm
          isEditLoading={isEditLoading}
          user={user}
          onSubmit={updateUser}
        />
      </div>
    </div>
  );
};
