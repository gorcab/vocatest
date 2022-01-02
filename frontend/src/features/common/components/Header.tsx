import { useEffect, useState } from "react";
import { FaBars, FaSearch, FaUserAlt, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SearchVocabulariesFormModal } from "./SearchVocabulariesFormModal";
import { UserDropdownMenu } from "./UserDropdownMenu";

type HeaderProps = {
  height: number;
  showSidebarOnMobile: boolean;
  handleSidebarButton: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  height,
  handleSidebarButton,
  showSidebarOnMobile,
}) => {
  const [showSearchVocabulariesFormModal, setShowSearchVocabulariesFormModal] =
    useState<boolean>(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState<boolean>(false);

  useEffect(() => {
    const dropdownHandler = () => {
      if (showDropdownMenu) {
        setShowDropdownMenu(false);
      }
    };

    document.addEventListener("click", dropdownHandler);

    return () => {
      document.removeEventListener("click", dropdownHandler);
    };
  }, [showDropdownMenu]);

  const closeSearchFormModalHandler = () => {
    setShowSearchVocabulariesFormModal(false);
  };

  const openSearchFormModalHandler = () => {
    if (!showSearchVocabulariesFormModal) {
      setShowSearchVocabulariesFormModal(true);
    }
  };

  const dropdownMenuToggler = () => {
    setShowDropdownMenu((prev) => !prev);
  };

  return (
    <>
      <header
        className={`shadow-sm sticky top-0 w-full z-[5] bg-slate-100`}
        style={{ height }}
      >
        <div className="container mx-auto h-full flex items-center relative">
          <div className="flex items-center grow">
            <button
              type="button"
              className="p-2 grow-0 md:hidden"
              onClick={handleSidebarButton}
            >
              {showSidebarOnMobile ? (
                <>
                  <FaTimes className="w-[30px] h-[30px] text-gray-400 hover:text-gray-500" />
                  <span className="sr-only">카테고리 메뉴 닫기</span>
                </>
              ) : (
                <>
                  <FaBars className="w-[30px] h-[30px] text-gray-400 hover:text-gray-500" />
                  <span className="sr-only">카테고리 메뉴 열기</span>
                </>
              )}
            </button>
            <h1 className="text-blue-500 font-bold text-3xl absolute md:static left-1/2 md:inset-auto -translate-x-1/2 md:transform-none md:grow md:text-left md:pl-2">
              <Link to="/">VOCATEST</Link>
            </h1>
          </div>
          <div className="grow-0 flex items-center mr-2">
            <button
              type="button"
              className="rounded-full border p-0.5 mr-2 text-gray-400 hover:text-gray-500 focus:text-gray-500"
              onClick={openSearchFormModalHandler}
            >
              <FaSearch className="w-[25px] h-[25px] p-0.5" />
              <span className="sr-only">단어장 검색</span>
            </button>
            <div className="relative">
              <button
                type="button"
                className="rounded-full border p-0.5 text-gray-400 hover:text-gray-500 focus:text-gray-500"
                onClick={dropdownMenuToggler}
              >
                <FaUserAlt className="w-[25px] h-[25px] p-0.5" />
                <span className="sr-only">회원 관련 메뉴</span>
              </button>
              <UserDropdownMenu isOpen={showDropdownMenu} />
            </div>
          </div>
        </div>
      </header>
      <SearchVocabulariesFormModal
        isOpen={showSearchVocabulariesFormModal}
        closeModalHandler={closeSearchFormModalHandler}
      />
    </>
  );
};
