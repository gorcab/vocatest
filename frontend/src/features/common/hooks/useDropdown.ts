import { useContext } from "react";
import { DropdownContext } from "../components/Dropdown";

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a Dropdown");
  }

  return context;
};
