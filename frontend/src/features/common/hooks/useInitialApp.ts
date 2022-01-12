import { useAppSelector } from "../../../app/hooks";
import { useUserQuery } from "../../api/slice";
import { selectUserAndAccessToken } from "../../user/slice";

export const useInitialApp = () => {
  // 최초 앱이 마운팅됐을 때, user와 accessToken이 전역 스토어에 저장되어 있는지를 확인한다.
  const { user, accessToken } = useAppSelector(selectUserAndAccessToken);
  // user가 저장되어 있거나 accessToken이 저장되어 있지 않다면
  // 서버로부터 사용자 정보를 받아올 필요가 없다.
  const skip = !!(user || !accessToken);
  // user가 저장되어 있지 않고 accessToken만 있는 상태라면
  // 사용자가 브라우저 새로고침을 한 상태이기 때문에 서버로부터 user 정보를 새롭게 받아 온다.
  const { isLoading } = useUserQuery(undefined, {
    skip,
  });

  return {
    isLoading,
    user,
  };
};
