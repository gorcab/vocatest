import { nanoid } from "@reduxjs/toolkit";
import { useState } from "react";

export const useId = () => {
  const [id] = useState(() => nanoid());
  return id;
};
