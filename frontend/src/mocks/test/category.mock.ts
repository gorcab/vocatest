import {
  CategoryDto,
  CreateCategoryRequest,
  EditCategoryRequest,
} from "features/api/types";
import { mockCategories } from "mocks/lib/category.factory";
import { createMockResponse } from "mocks/lib/networkMockUtils.factory";

export const existedCategoryNameForCreatingCategoryResponse =
  createMockResponse<CreateCategoryRequest>(
    "/categories",
    (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          status: 400,
          message: "이미 존재하는 카테고리명입니다.",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const serverErrorForCreatingCategoryResponse =
  createMockResponse<CreateCategoryRequest>(
    "/categories",
    (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({
          status: 500,
          message: "Internal Server Error",
        })
      );
    },
    {
      method: "POST",
    }
  );

export const successCreatingCategoryResponse =
  createMockResponse<CreateCategoryRequest>(
    "/categories",
    (req, res, ctx) => {
      const { id, name }: CategoryDto = {
        id: 1,
        name: "토익",
      };
      return res(
        ctx.status(201),
        ctx.json({
          id,
          name,
        })
      );
    },
    {
      method: "POST",
    }
  );

export const invalidRequestForDeletingCategoryResponse = createMockResponse(
  "/categories/:id",
  (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        status: 401,
        message: "올바르지 않은 카테고리입니다.",
      })
    );
  },
  {
    method: "DELETE",
  }
);

export const successEditingCategoryResponse =
  createMockResponse<EditCategoryRequest>(
    "/categories/:id",
    (req, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json({
          ...mockCategories[0],
        })
      );
    },
    {
      method: "PATCH",
    }
  );

export const existingCategoryNameForEditingCategoryResponse =
  createMockResponse<EditCategoryRequest>(
    "/categories/:id",
    (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          status: 400,
          message: "이미 존재하는 카테고리명입니다.",
        })
      );
    },
    {
      method: "PATCH",
    }
  );

export const successToGetCategoriesResponse = createMockResponse(
  "/categories",
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        categories: mockCategories,
      })
    );
  },
  {
    method: "GET",
  }
);

export const successToGetEmptyCategoryResponse = createMockResponse(
  "/categories",
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        categories: [],
      })
    );
  },
  {
    method: "GET",
  }
);

export const serverErrorForGettingCategoriesResponse = createMockResponse(
  "/categories",
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        status: 500,
        message: "Internal Server Error",
      })
    );
  },
  { method: "GET" }
);

export const failToGetCategoriesResponse = createMockResponse(
  "/categories",
  (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        status: 400,
        message: "카테고리 조회 실패",
      })
    );
  },
  { method: "GET" }
);
