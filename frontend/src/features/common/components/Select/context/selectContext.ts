import { createContext, useContext, Dispatch, MutableRefObject } from "react";
import { SelectState, SelectAction } from "../reducer";

export const SelectContext =
  createContext<{
    selectState: SelectState;
    dispatch: Dispatch<SelectAction>;
    selectButtonRef: MutableRefObject<HTMLDivElement | null>;
    listBoxRef: MutableRefObject<HTMLUListElement | null>;
  } | null>(null);

export function useSelectContext(componentName: string) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(`<${componentName}> must be within <Select> component.`);
  }
  return context;
}
