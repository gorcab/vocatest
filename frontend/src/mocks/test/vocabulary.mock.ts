import { DetailedVocabularyListDto } from "features/api/types";
import {
  createMockResponse,
  getQueryParamsFromRestRequest,
} from "mocks/lib/networkMockUtils.factory";
import {
  createMockVocabularyListsInEachCategory,
  getEntireVocabularyLists,
  getPageBasedVocabularyLists,
  createMockVocabularyList,
} from "mocks/lib/vocabulary.factory";

export const serverErrorForCreatingVocabularyResponse = createMockResponse(
  "/vocabularies",
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

export const failToCreateVocabularyResponse = createMockResponse(
  "/vocabularies",
  (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        status: 400,
        message: "동일한 이름의 단어장이 카테고리 내에 존재합니다.",
      })
    );
  },
  {
    method: "POST",
  }
);

export const successToCreateVocabularyResponse = createMockResponse(
  "/vocabularies",
  (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        status: 201,
      })
    );
  },
  {
    method: "POST",
  }
);

export const successToDeleteVocabularyResponse = createMockResponse(
  "/vocabularies/:id",
  (req, res, ctx) => {
    return res(ctx.status(201));
  },
  {
    method: "DELETE",
  }
);

export const failToDeleteVocabularyResponse = createMockResponse(
  "/vocabularies/:id",
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
    method: "DELETE",
  }
);

let vocabularyListsRecord = createMockVocabularyListsInEachCategory();
let entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);

export const successToGetVocabularyLists = createMockResponse(
  "/vocabularies",
  (req, res, ctx) => {
    const { page, perPage, categoryId, title } =
      getQueryParamsFromRestRequest(req);

    entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);

    // 특정 카테고리의 단어장 조회
    if (categoryId) {
      const vocabularyListsOfCategory = vocabularyListsRecord[categoryId];

      // 해당 카테고리의 특정 제목이 들어간 단어장들만 조회
      if (title) {
        const vocabularyListsOfCategoryToHaveTitle =
          vocabularyListsOfCategory.filter((vocabularyList) =>
            new RegExp(`${title}`, "g").test(vocabularyList.title)
          );
        const result = getPageBasedVocabularyLists(
          vocabularyListsOfCategoryToHaveTitle,
          page,
          perPage
        );
        return res(ctx.delay(500), ctx.status(200), ctx.json(result));
      }
      // 해당 카테고리의 모든 단어장 조회
      const result = getPageBasedVocabularyLists(
        vocabularyListsOfCategory,
        page,
        perPage
      );
      return res(ctx.delay(500), ctx.status(200), ctx.json(result));
    }

    // 모든 카테고리 내 단어장의 제목으로 조회
    if (title) {
      const entireVocabularyListsToHaveTitle = entireVocabularyLists.filter(
        (vocabularyList) =>
          new RegExp(`${title}`, "g").test(vocabularyList.title)
      );

      const result = getPageBasedVocabularyLists(
        entireVocabularyListsToHaveTitle,
        page,
        perPage
      );
      return res(ctx.delay(500), ctx.status(200), ctx.json(result));
    }

    // 전체 단어장 조회
    const result = getPageBasedVocabularyLists(
      entireVocabularyLists,
      page,
      perPage
    );
    return res(ctx.delay(500), ctx.status(200), ctx.json(result));
  },
  { method: "GET" }
);

export const failToGetVocabularyListsResponse = createMockResponse(
  "/vocabularies",
  (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        status: 400,
        message: "Bad Request",
      })
    );
  },
  { method: "GET" }
);

export const serverErrorForGetVocabularyListsResponse = createMockResponse(
  "/vocabularies",
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

export const successToGetDetailedVocabularyListResponse = (
  vocabularyList: DetailedVocabularyListDto
) =>
  createMockResponse(
    "/vocabularies/:id",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          ...vocabularyList,
        })
      );
    },
    { method: "GET" }
  );

export const forbidToGetDetailedVocabularyListResponse = createMockResponse(
  "/vocabularies/:id",
  (req, res, ctx) => {
    return res(
      ctx.status(403),
      ctx.json({
        status: 403,
        message: "접근할 수 없습니다.",
      })
    );
  },
  { method: "GET" }
);

export const serverErrorForGetDetailedVocabularyListResponse =
  createMockResponse(
    "/vocabularies/:id",
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

export const clientErrorForGetDetailedVocabularyListResponse =
  createMockResponse(
    "/vocabularies/:id",
    (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({
          status: 400,
          message: "단어장 조회에 실패했습니다.",
        })
      );
    },
    { method: "GET" }
  );
