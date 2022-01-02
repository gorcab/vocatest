import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store";

export type ToastType = {
  id: string;
  type: "ERROR" | "SUCCESS";
  desc: string;
  duration?: number;
};

export type ToastWithoutIdType = Omit<ToastType, "id">;

export type ToastState = {
  toasts: Array<ToastType>;
};

const name = "toast";

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name,
  initialState,
  reducers: {
    createToast: {
      reducer: ({ toasts }, action: PayloadAction<ToastType>) => {
        toasts.unshift(action.payload);
      },
      prepare: (toastWithoutId: ToastWithoutIdType) => {
        const id = nanoid();
        return {
          payload: {
            id,
            ...toastWithoutId,
          },
        };
      },
    },
    deleteToast: ({ toasts }, action: PayloadAction<string>) => {
      const itemIndexToDelete = toasts.findIndex(
        (toast) => toast.id === action.payload
      );
      if (itemIndexToDelete !== -1) {
        toasts.splice(itemIndexToDelete, 1);
      }
    },
  },
});

export const { createToast, deleteToast } = toastSlice.actions;

export const selectToasts = (state: RootState) => state.toast.toasts;

export default toastSlice.reducer;
