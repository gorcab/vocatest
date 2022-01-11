import { PathParams, rest, RestRequest } from "msw";
import {
  AuthCodeRequest,
  CategoryDto,
  CreateCategoryRequest,
  LoginRequest,
  PagedVocabularyListsResponse,
  ResetPasswordRequest,
  SignUpRequest,
  VocabularyListDto,
} from "../features/api/types";

export const accessToken = "accesstoken";
export const refreshToken = "refreshtoken";
const validUser = {
  email: "tester@gmail.com",
  nickname: "tester",
};
const categories: Array<CategoryDto> = [
  { id: 1, name: "토익" },
  { id: 2, name: "텝스" },
  { id: 3, name: "토플" },
];

export const getQueryParamsFromRestRequest = (
  req: RestRequest<never, PathParams>
) => {
  const page = Number(req.url.searchParams.get("page"));
  const perPage = Number(req.url.searchParams.get("perPage"));
  const categoryId = Number(req.url.searchParams.get("category"));
  const title = req.url.searchParams.get("title");

  return {
    page,
    perPage,
    categoryId,
    title,
  } as const;
};

export const createMockVocabularyListsInEachCategory = () => {
  let curId = 1;
  const result: {
    [key in typeof categories[number]["id"]]: Array<VocabularyListDto>;
  } = categories.reduce((acc, cur, categoryIndex, categories) => {
    const vocabularyLists: Array<VocabularyListDto> = Array.from({
      length: (categoryIndex + 1) * (10 + Math.floor(Math.random() * 5)),
    })
      .map((_, index) => ({
        id: curId++,
        title: `${categories[categoryIndex].name} DAY-${index + 1}`,
        createdAt: new Date(
          2021,
          12,
          1 + index,
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 60)
        ).toISOString(),
        numOfVocabularies: 10 + Math.floor(Math.random() * 20),
        category: categories[categoryIndex],
      }))
      .sort((elem1, elem2) => {
        const elem1Date = new Date(elem1.createdAt);
        const elem2Date = new Date(elem2.createdAt);
        if (elem1Date < elem2Date) return 1;
        else if (elem1Date === elem2Date) return 0;
        else return -1;
      });

    acc[cur.id] = vocabularyLists;

    return acc;
  }, {} as { [key in typeof categories[number]["id"]]: Array<VocabularyListDto> });

  return result;
};

export const createEntireVocabularyLists = (
  mockVocabularyLists: Record<string, Array<VocabularyListDto>>
) => {
  return Object.keys(mockVocabularyLists)
    .reduce(
      (acc, cur) => [...acc, ...mockVocabularyLists[Number(cur)]],
      [] as Array<VocabularyListDto>
    )
    .sort((elem1, elem2) => {
      const elem1Date = new Date(elem1.createdAt);
      const elem2Date = new Date(elem2.createdAt);
      if (elem1Date < elem2Date) return 1;
      else if (elem1Date === elem2Date) return 0;
      else return -1;
    });
};

export const getPageBasedEntireVocabularyLists = (
  entireVocabularyLists: Array<VocabularyListDto>,
  page: number,
  perPage: number
) => {
  const firstIndex = perPage * (page - 1);
  const lastIndex = firstIndex + perPage;
  const data = entireVocabularyLists.slice(firstIndex, lastIndex);
  const total = entireVocabularyLists.length;
  const totalPage = Math.ceil(total / perPage);

  const result: PagedVocabularyListsResponse = {
    page,
    perPage,
    data,
    total,
    totalPage,
  };

  return result;
};

export const getPageBasedVocabularyListsOfCategory = (
  mockVocabularyLists: Record<string, Array<VocabularyListDto>>,
  categoryId: number,
  page: number,
  perPage: number
) => {
  const firstIndex = perPage * (page - 1);
  const lastIndex = firstIndex + perPage;
  const totalData = mockVocabularyLists[categoryId];
  const data = totalData.slice(firstIndex, lastIndex);
  const total = totalData.length;
  const totalPage = Math.ceil(total / perPage);

  const result: PagedVocabularyListsResponse = {
    page,
    perPage,
    data,
    total,
    totalPage,
  };

  return result;
};

export const getPageBasedVocabularyListsOfSpecificTitle = (
  entireVocabularyLists: Array<VocabularyListDto>,
  title: string,
  page: number,
  perPage: number
) => {
  const firstIndex = perPage * (page - 1);
  const lastIndex = firstIndex + perPage;
  const totalData = entireVocabularyLists.filter((vocabularyList) =>
    vocabularyList.title.includes(title)
  );
  const data = totalData.slice(firstIndex, lastIndex);
  const total = totalData.length;
  const totalPage = Math.ceil(total / perPage);

  const result: PagedVocabularyListsResponse = {
    page,
    perPage,
    data,
    total,
    totalPage,
  };

  return result;
};

const deleteVocabularyListById = (
  mockVocabularyLists: Record<string, Array<VocabularyListDto>>,
  id: number
) => {
  for (const categoryId in mockVocabularyLists) {
    const vocabularyLists = mockVocabularyLists[categoryId];
    const delIndex = vocabularyLists.findIndex((elem) => elem.id === id);
    if (delIndex !== -1) {
      vocabularyLists.splice(delIndex, 1);
      return;
    }
  }
};

const createHandlers = () => {
  let mockVocabularyLists = createMockVocabularyListsInEachCategory();
  let entireVocabularyLists = createEntireVocabularyLists(mockVocabularyLists);

  const handlers = [
    // 인증 토큰 전송 요청 핸들러
    rest.post<AuthCodeRequest>(
      `${process.env.REACT_APP_API_URL}/auth/code`,
      (req, res, ctx) => {
        const { email, purpose } = req.body;
        if (email === "wrong@gmail.com") {
          return res(
            ctx.status(503),
            ctx.json({
              status: 503,
              message:
                "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
            })
          );
        }

        if (purpose === "SIGN_UP") {
          if (email === "already@gmail.com") {
            return res(
              ctx.status(400),
              ctx.json({
                status: 400,
                message: "이미 가입된 이메일입니다.",
              })
            );
          } else {
            return res(
              ctx.status(201),
              ctx.json({
                email,
                purpose,
                ttl: 300,
              })
            );
          }
        } else if (purpose === "RESET_PASSWORD") {
          if (email === "notexists@gmail.com") {
            return res(
              ctx.delay(500),
              ctx.status(400),
              ctx.json({
                status: 400,
                message: "가입되지 않은 이메일입니다.",
              })
            );
          } else {
            return res(
              ctx.delay(500),
              ctx.status(201),
              ctx.json({
                email,
                purpose,
                ttl: 300,
              })
            );
          }
        }
      }
    ),

    // 회원가입 핸들러
    rest.post<SignUpRequest>(
      `${process.env.REACT_APP_API_URL}/users`,
      (req, res, ctx) => {
        const { email, nickname, signUpAuthCode } = req.body;
        if (signUpAuthCode === 444444) {
          return res(
            ctx.delay(100),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "인증 번호가 올바르지 않습니다.",
            })
          );
        } else if (email === "wrong@gmail.com") {
          return res(
            ctx.delay(100),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 가입된 이메일입니다.",
            })
          );
        } else {
          return res(
            ctx.delay(100),
            ctx.status(201),
            ctx.json({
              id: 1,
              email,
              nickname,
              accessToken,
              refreshToken,
            })
          );
        }
      }
    ),

    // 로그인 핸들러
    rest.post<LoginRequest>(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      (req, res, ctx) => {
        const { email } = req.body;
        if (email === "wrong@gmail.com") {
          return res(
            ctx.status(401),
            ctx.json({
              message: "이메일 또는 비밀번호가 올바르지 않습니다.",
            })
          );
        } else {
          return res(
            ctx.delay(1000),
            ctx.status(201),
            ctx.json({
              id: 1,
              email,
              nickname: validUser.nickname,
              accessToken,
              refreshToken,
            })
          );
        }
      }
    ),

    // access token을 통한 사용자 정보 요청
    rest.get(`${process.env.REACT_APP_API_URL}/users/me`, (req, res, ctx) => {
      if (req.headers.get("Authorization") === `Bearer ${accessToken}`) {
        return res(
          ctx.status(200),
          ctx.json({
            id: 1,
            email: validUser.email,
            nickname: validUser.nickname,
          })
        );
      } else {
        return res(ctx.status(401));
      }
    }),

    // 비밀번호 재설정 인증 토큰 전송 요청 핸들러
    rest.post<ResetPasswordRequest>(
      `${process.env.REACT_APP_API_URL}/users/password`,
      (req, res, ctx) => {
        const { resetPasswordAuthCode } = req.body;
        if (resetPasswordAuthCode === 444444) {
          return res(
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "인증 번호가 올바르지 않습니다.",
            })
          );
        } else {
          return res(ctx.status(204));
        }
      }
    ),

    // 카테고리 조회 요청 핸들러
    rest.get(`${process.env.REACT_APP_API_URL}/categories`, (req, res, ctx) => {
      const isFailed = Math.random() > 0.8;
      if (isFailed) {
        return res(
          ctx.delay(1000),
          ctx.status(500),
          ctx.json({
            status: 500,
            message: "Internal Server Error",
          })
        );
      }

      return res(
        ctx.delay(1000),
        ctx.status(200),
        ctx.json({
          categories,
        })
      );
    }),

    // 카테고리 생성 요청 핸들러
    rest.post<CreateCategoryRequest>(
      `${process.env.REACT_APP_API_URL}/categories`,
      (req, res, ctx) => {
        const { name } = req.body;
        if (categories.map((category) => category.name).includes(name)) {
          return res(
            ctx.delay(100),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 존재하는 카테고리명입니다.",
            })
          );
        } else {
          const createdCategory = {
            id: categories.length + 1,
            name,
          };
          categories.push(createdCategory);
          return res(
            ctx.delay(1000),
            ctx.status(201),
            ctx.json(createdCategory)
          );
        }
      }
    ),

    // 단어장 조회 핸들러
    rest.get(
      `${process.env.REACT_APP_API_URL}/vocabularies`,
      (req, res, ctx) => {
        const { page, perPage, categoryId, title } =
          getQueryParamsFromRestRequest(req);
        const isFailed = Math.random() > 0.8;

        if (isNaN(page) || isNaN(perPage) || perPage > 20 || isFailed) {
          return res(
            ctx.delay(500),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "Bad Request",
            })
          );
        }
        // 특정 카테고리의 단어장 조회
        if (categoryId) {
          return res(
            ctx.delay(500),
            ctx.status(200),
            ctx.json({
              ...getPageBasedVocabularyListsOfCategory(
                mockVocabularyLists,
                categoryId,
                page,
                perPage
              ),
            })
          );
        }
        // 단어장의 제목으로 조회
        if (title) {
          const result = getPageBasedVocabularyListsOfSpecificTitle(
            entireVocabularyLists,
            title,
            page,
            perPage
          );
          return res(
            ctx.delay(500),
            ctx.status(200),
            ctx.json({
              ...getPageBasedVocabularyListsOfSpecificTitle(
                entireVocabularyLists,
                title,
                page,
                perPage
              ),
            })
          );
        }
        // 전체 단어장 조회
        return res(
          ctx.delay(500),
          ctx.status(200),
          ctx.json({
            ...getPageBasedEntireVocabularyLists(
              entireVocabularyLists,
              page,
              perPage
            ),
          })
        );
      }
    ),

    // 단어장 삭제 핸들러
    rest.delete(
      `${process.env.REACT_APP_API_URL}/vocabularies/:id`,
      (req, res, ctx) => {
        const isFailed = Math.random() > 0.8;
        if (isFailed) {
          return res(
            ctx.delay(500),
            ctx.status(500),
            ctx.json({
              status: 500,
              message: "Internal Server Error",
            })
          );
        }

        const { id } = req.params;
        deleteVocabularyListById(mockVocabularyLists, Number(id));
        entireVocabularyLists =
          createEntireVocabularyLists(mockVocabularyLists);

        return res(ctx.delay(500), ctx.status(201));
      }
    ),
  ];

  return handlers;
};

export const handlers = createHandlers();
