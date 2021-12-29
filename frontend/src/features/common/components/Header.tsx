import { useEffect, useRef, useState } from "react";
import { FaBars, FaSearch, FaUserAlt, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../app/store";
import { Modal } from "./Modal";

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
  const [showSearchField, setShowSearchField] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const searchFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearchField) {
      searchFieldRef.current?.focus();
    }

    const searchFormHandler = (event: MouseEvent) => {
      const nodeName = (event.target as HTMLElement).nodeName;
      if (nodeName !== "INPUT") {
        if (showSearchField) {
          setShowSearchField(false);
        }
      }
    };

    const dropdownHandler = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", searchFormHandler);
    document.addEventListener("click", dropdownHandler);

    return () => {
      document.removeEventListener("click", searchFormHandler);
      document.removeEventListener("click", dropdownHandler);
    };
  }, [showSearchField, showDropdown]);

  const closeSearchFieldHandler = () => {
    setShowSearchField(false);
  };

  const searchVocabulariesHandler: React.FormEventHandler = (event) => {
    event.preventDefault();
    if (searchFieldRef.current) {
      const value = searchFieldRef.current.value;
      if (value) {
        navigate(`/vocabularies?title=${value}`);
      } else {
        navigate("/");
      }
    }
  };

  const handleSearchButton = () => {
    if (!showSearchField) {
      setShowSearchField(true);
    }
  };

  const handleDropdownButton = () => {
    setShowDropdown((prev) => !prev);
  };

  const logoutHandler = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(logout());
    navigate("/login");
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
              className="rounded-full border p-0.5 mr-2"
              onClick={handleSearchButton}
            >
              <FaSearch className="w-[25px] h-[25px] text-gray-400 hover:text-gray-500 p-0.5" />
              <span className="sr-only">단어장 검색</span>
            </button>
            <div className="relative">
              <button
                type="button"
                className="rounded-full border p-0.5"
                onClick={handleDropdownButton}
              >
                <FaUserAlt className="w-[25px] h-[25px] text-gray-400 hover:text-gray-500 p-0.5" />
                <span className="sr-only">회원 관련 메뉴</span>
              </button>
              {showDropdown && (
                <ul className="absolute -bottom-50 right-0 border bg-white w-24 rounded-sm">
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
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>
      {showSearchField && (
        <Modal closeHandler={closeSearchFieldHandler}>
          <form
            onSubmit={searchVocabulariesHandler}
            className={`absolute top-1/2 inset-x-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 md:w-1/3 z-100`}
          >
            <div className="relative">
              <input
                ref={searchFieldRef}
                type="text"
                className="border-b bg-transparent outline-none text-white p-1 w-full"
                placeholder="단어장명을 입력해주세요."
              />
              <button
                type="button"
                onClick={closeSearchFieldHandler}
                className="absolute top-1/2 right-0 -translate-y-1/2 w-[25px] h-[25px] text-white flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
