import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../app/store";
import { visibleVariant } from "../utils/animation-variants";

type UserDropdownMenuProps = {
  isOpen: boolean;
};

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  isOpen,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.ul
          className="absolute -bottom-50 right-0 border bg-white w-24 rounded-sm"
          key="dropdown"
          variants={visibleVariant}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
        >
          <li className="flex items-center border-b text-slate-500 hover:text-slate-700 text-sm">
            <Link to="/profile" className="p-2 block w-full">
              내 프로필
            </Link>
          </li>
          <li className="flex items-center border-b text-slate-500 hover:text-slate-700 text-sm">
            <Link to="/delete-account" className="p-2 block w-full">
              회원 탈퇴
            </Link>
          </li>
          <li className="flex items-center text-slate-500 hover:text-slate-700 text-sm">
            <button
              type="button"
              className="p-2 w-full text-left"
              onClick={logoutHandler}
            >
              로그아웃
            </button>
          </li>
        </motion.ul>
      )}
    </AnimatePresence>
  );
};
