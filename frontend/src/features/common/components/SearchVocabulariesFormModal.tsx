import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router";
import { DEFAULT_PER_PAGE } from "../utils/constants";
import { Modal } from "./Modal";

type SearchVocabulariesFormModalProps = {
  isOpen: boolean;
  closeModalHandler: () => void;
};

export const SearchVocabulariesFormModal: React.FC<SearchVocabulariesFormModalProps> =
  ({ isOpen, closeModalHandler }) => {
    const navigate = useNavigate();
    const searchFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (searchFieldRef.current && isOpen) {
        searchFieldRef.current.focus();
      }
    }, [isOpen]);

    const searchVocabulariesHandler: React.FormEventHandler = (event) => {
      event.preventDefault();
      if (searchFieldRef.current) {
        const value = encodeURIComponent(searchFieldRef.current.value);
        if (value) {
          navigate(`/?page=1&perPage=${DEFAULT_PER_PAGE}&title=${value}`);
        } else {
          navigate("/");
        }
        closeModalHandler();
      }
    };

    return (
      <Modal onClose={closeModalHandler} isOpen={isOpen}>
        <form
          onSubmit={searchVocabulariesHandler}
          className="absolute top-1/2 inset-x-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 md:w-1/3 z-100"
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
              onClick={closeModalHandler}
              className="absolute top-1/2 right-0 -translate-y-1/2 w-[25px] h-[25px] text-white flex items-center justify-center"
            >
              <FaTimes />
              <span className="sr-only">닫기</span>
            </button>
          </div>
        </form>
      </Modal>
    );
  };
