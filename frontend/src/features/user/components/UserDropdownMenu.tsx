import { useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../app/store";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { DropdownMenu } from "../../common/components/Dropdown/DropdownMenu";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { visibleVariant } from "../../common/utils/animation-variants";
import { DropdownMenuButton } from "../../common/components/Dropdown/DropdownMenuButton";
import { DropdownMenuList } from "../../common/components/Dropdown/DropdownMenuList";
import { DropdownMenuItem } from "../../common/components/Dropdown/DropdownMenuItem";

export const UserDropdownMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [openDeleteAccountModal, setOpenDeleteAccountModal] = useState(false);

  const openDeleteAcoountModalHandler = () => {
    setOpenDeleteAccountModal(true);
  };

  const closeDeleteAccountModalHandler = () => {
    setOpenDeleteAccountModal(false);
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <DropdownMenu className="w-[30px] h-[30px]">
        <DropdownMenuButton className="rounded-full border p-0.5 text-gray-400 hover:text-blue-500">
          <FaUserAlt className="w-[25px] h-[25px] p-0.5" />
          <span className="sr-only">회원 관련 메뉴</span>
        </DropdownMenuButton>
        <DropdownMenuList
          as={motion.div}
          variants={visibleVariant}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <DropdownMenuItem as={Link} to="/profile">
            내 프로필
          </DropdownMenuItem>
          <DropdownMenuItem as="button" onClick={openDeleteAcoountModalHandler}>
            회원 탈퇴
          </DropdownMenuItem>
          <DropdownMenuItem as="button" onClick={logoutHandler}>
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuList>
      </DropdownMenu>
      {openDeleteAccountModal && (
        <DeleteAccountModal
          isOpen={openDeleteAccountModal}
          onClose={closeDeleteAccountModalHandler}
        />
      )}
    </>
  );
};
