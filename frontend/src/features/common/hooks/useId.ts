import { nanoid } from "@reduxjs/toolkit";
import { useMemo, useState } from "react";

export const useId = (prefix?: string, length?: number) => {
  const [id] = useState(() => nanoid());
  const memoizedId = useMemo(() => {
    if (typeof length === "number" && length > 0) {
      const startIndex = Math.min(
        0,
        Math.floor(Math.random() * id.length) - length
      );
      const result = id.substr(startIndex, length);
      return prefix ? `${prefix}-${result}` : result;
    } else {
      return prefix ? `${prefix}-${id}` : id;
    }
  }, [id, length, prefix]);
  return memoizedId;
};
