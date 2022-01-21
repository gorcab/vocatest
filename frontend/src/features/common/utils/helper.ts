import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import React from "react";
import { ErrorResponse } from "../../api/types";
import { DEFAULT_PER_PAGE } from "./constants";

export const getFormattedDate = (date: Date) => {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
};

export function is5XXError(
  error: FetchBaseQueryError | SerializedError | undefined
): error is FetchBaseQueryError & { status: number; data: ErrorResponse } {
  if (
    error &&
    "data" in error &&
    typeof error.status === "number" &&
    error.status >= 500
  ) {
    return true;
  }

  return false;
}

export function is4XXError(
  error: FetchBaseQueryError | SerializedError | undefined
): error is FetchBaseQueryError & { status: number; data: ErrorResponse } {
  if (
    error &&
    "data" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  )
    return true;
  return false;
}

type VocabularyListSearchRelatedProperties = {
  page: number;
  perPage: number;
  title?: string;
  categoryId?: number;
};

type GetVocabularyListSearchUrlReturnType = {
  pathname: string;
  search: string;
};

export const getVocabularyListSearchUrl = ({
  page,
  perPage,
  categoryId,
  title,
}: VocabularyListSearchRelatedProperties): GetVocabularyListSearchUrlReturnType => {
  let pathname = "/";
  let search = "";

  if (categoryId) {
    search += `category=${categoryId}&`;
  }

  if (isNaN(page)) {
    search += `page=1`;
  } else {
    search += `page=${page}`;
  }

  if (isNaN(perPage)) {
    search += `&perPage=${DEFAULT_PER_PAGE}`;
  } else {
    search += `&perPage=${perPage}`;
  }

  if (title) {
    search += `&title=${title}`;
  }

  return {
    pathname,
    search,
  };
};

export const focusableSelectors = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "[tabindex]",
  "[contentEditable=true]",
]
  .map((selector) => `${selector}:not([tabindex='-1'])`)
  .join(",");

export const isFocusableElement = (element: HTMLElement | null): boolean => {
  if (element === document.body || element === null) return false;
  return (
    element.matches(focusableSelectors) ||
    isFocusableElement(element.parentElement)
  );
};

export const callAllEventHandlers =
  (...funcs: (Function | undefined)[]) =>
  (event: React.SyntheticEvent<any, Event>, ...args: any) => {
    funcs.forEach((func) =>
      typeof func === "function" ? func(event, ...args) : void 0
    );
  };
