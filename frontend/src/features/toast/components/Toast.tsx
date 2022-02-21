import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import { useAppDispatch } from "app/hooks";
import { deleteToast, ToastType } from "../slice";

type ToastProps = ToastType;

const BG_COLOR: Record<ToastProps["type"], string> = {
  ERROR: "bg-red-600/90",
  SUCCESS: "bg-green-600/90",
};

export const Toast = motion(
  React.forwardRef<HTMLLIElement, ToastProps>(
    ({ type, desc, id, duration = 5000 }, ref) => {
      const dispatch = useAppDispatch();

      const handleDelete = useCallback(() => {
        dispatch(deleteToast(id));
      }, [dispatch, id]);

      useEffect(() => {
        const deleteTimer = setTimeout(() => {
          handleDelete();
        }, duration);

        return () => {
          clearTimeout(deleteTimer);
        };
      }, [duration, handleDelete]);

      let Icon: React.ReactNode = null;
      switch (type) {
        case "ERROR":
          Icon = (
            <>
              <FaExclamationCircle className="bg-transparent" />
              <span className="sr-only">실패</span>
            </>
          );
          break;
        case "SUCCESS":
          Icon = (
            <>
              <FaCheckCircle className="bg-tansparent" />
              <span className="sr-only">성공</span>
            </>
          );
          break;
      }

      return (
        <li
          role="alert"
          ref={ref}
          className={`${BG_COLOR[type]} relative text-white p-3 mb-5 w-72 rounded-sm`}
        >
          <button
            onClick={handleDelete}
            className="absolute right-2 top-2 w-[10px] h-[10px] flex justify-center items-center"
          >
            <FaTimes />
            <span className="sr-only">닫기</span>
          </button>
          <div className="flex items-center px-3">
            <div className="mr-3">{Icon}</div>
            <div>{desc}</div>
          </div>
        </li>
      );
    }
  )
);
