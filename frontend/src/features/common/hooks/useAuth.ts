import { useSelector } from "react-redux";
import { selectUser } from "../../user/slice";

export const useAuth = () => {
  const user = useSelector(selectUser);
  return user;
};
