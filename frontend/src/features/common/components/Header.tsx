import { useState } from "react";
import { FaBars, FaSearch, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SearchVocabulariesFormModal } from "./SearchVocabulariesFormModal";
import { UserDropdownMenu } from "./UserDropdownMenu";

type HeaderProps = {
  showSidebarOnMobile: boolean;
  handleSidebarButton: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  handleSidebarButton,
  showSidebarOnMobile,
}) => {
  const [showSearchVocabulariesFormModal, setShowSearchVocabulariesFormModal] =
    useState<boolean>(false);

  const closeSearchFormModalHandler = () => {
    if (showSearchVocabulariesFormModal) {
      setShowSearchVocabulariesFormModal(false);
    }
  };

  const openSearchFormModalHandler = () => {
    if (!showSearchVocabulariesFormModal) {
      setShowSearchVocabulariesFormModal(true);
    }
  };

  return (
    <>
      <header
        className={`h-[60px] shadow-sm sticky top-0 w-full z-[5] bg-slate-100`}
      >
        <div className="md:container mx-auto h-full flex items-center relative">
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
          <div className="grow-0 flex items-center justify-center mr-2">
            <button
              type="button"
              className="rounded-full border p-0.5 mr-2 text-gray-400 hover:text-blue-500 focus:text-blue-500"
              onClick={openSearchFormModalHandler}
            >
              <FaSearch className="w-[25px] h-[25px] p-0.5" />
              <span className="sr-only">단어장 검색</span>
            </button>
            <div className="relative">
              <div className="flex items-center">
                <UserDropdownMenu />
              </div>
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
