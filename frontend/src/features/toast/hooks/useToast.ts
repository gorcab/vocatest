import { useAppDispatch } from "app/hooks";
import { useCallback } from "react";
import { createToast, ToastWithoutIdType } from "../slice";

export const useToast = () => {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (options: ToastWithoutIdType) => {
      dispatch(createToast(options));
    },
    [dispatch]
  );

  return toast;
};
