import { useSelector } from "react-redux";
import { selectUser } from "features/user/slice";

export const useAuth = () => {
  const user = useSelector(selectUser);
  return user;
};
