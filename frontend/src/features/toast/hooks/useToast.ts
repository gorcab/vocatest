import { useCallback } from "react";
import { useAppDispatch } from "../../../app/hooks";
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
