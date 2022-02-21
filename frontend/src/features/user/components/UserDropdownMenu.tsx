import { motion } from "framer-motion";
import { useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useAppDispatch } from "app/hooks";
import { logout } from "app/store";
import { DropdownMenu } from "features/common/components/Dropdown/DropdownMenu";
import { DropdownMenuButton } from "features/common/components/Dropdown/DropdownMenuButton";
import { DropdownMenuItem } from "features/common/components/Dropdown/DropdownMenuItem";
import { DropdownMenuList } from "features/common/components/Dropdown/DropdownMenuList";
import { visibleVariant } from "features/common/utils/animation-variants";
import { UnregisterAccountModal } from "../unregister/components/UnregisterAccountModal";

export const UserDropdownMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [openUnregisterAccountModal, setOpenUnregisterAccountModal] =
    useState(false);

  const openUnregisterAccountModalHandler = () => {
    setOpenUnregisterAccountModal(true);
  };

  const closeUnregisterAccountModalHandler = () => {
    setOpenUnregisterAccountModal(false);
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
          <DropdownMenuItem
            as="button"
            onClick={openUnregisterAccountModalHandler}
          >
            회원 탈퇴
          </DropdownMenuItem>
          <DropdownMenuItem as="button" onClick={logoutHandler}>
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuList>
      </DropdownMenu>
      {openUnregisterAccountModal && (
        <UnregisterAccountModal
          isOpen={openUnregisterAccountModal}
          onClose={closeUnregisterAccountModalHandler}
        />
      )}
    </>
  );
};
