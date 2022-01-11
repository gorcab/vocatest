import { useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../app/store";
import { Dropdown } from "./Dropdown";
import { DropdownButton } from "./DropdownButton";
import { DropdownItem } from "./DropdownItem";
import { DropdownList } from "./DropdownList";
import { Modal } from "./Modal";

export const UserDropdownMenu: React.FC = ({}) => {
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <Dropdown id="user">
        <DropdownButton className="rounded-full border p-0.5 text-gray-400 hover:text-blue-500 focus:text-blue-500">
          <FaUserAlt className="w-[25px] h-[25px] p-0.5" />
          <span className="sr-only">회원 관련 메뉴</span>
        </DropdownButton>
        <DropdownList>
          <DropdownItem as="link" to="/profile">
            내 프로필
          </DropdownItem>
          <DropdownItem as="button" onClick={openDeleteAcoountModalHandler}>
            회원 탈퇴
          </DropdownItem>
          <DropdownItem as="button" onClick={logoutHandler}>
            로그아웃
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <Modal
        isOpen={openDeleteAccountModal}
        onClose={closeDeleteAccountModalHandler}
      >
        <div>회원 탈퇴</div>
      </Modal>
    </>
  );
};
