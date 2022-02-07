import { PathParams, rest, RestRequest } from "msw";
import faker from "@faker-js/faker";
import {
  AuthCodeRequest,
  CategoryDto,
  CreateCategoryRequest,
  CreatedExampleDto,
  CreatedVocabularyDto,
  CreateVocabularyDto,
  CreateVocabularyListDto,
  EditCategoryRequest,
  LoginRequest,
  PagedVocabularyListsResponse,
  ResetPasswordRequest,
  SignUpRequest,
  VocabularyListDto,
} from "../features/api/types";

const validUsers = [
  {
    email: "tester@gmail.com",
    nickname: "tester",
    id: 1,
    accessToken: "accessToken1",
    refreshToken: "refreshToken1",
  },
  {
    email: "dev@gmail.com",
    nickname: "dev",
    id: 2,
    accessToken: "accessToken2",
    refreshToken: "refreshToken2",
  },
  {
    email: "voca@gmail.com",
    nickname: "voca",
    id: 3,
    accessToken: "accessToken3",
    refreshToken: "refreshToken3",
  },
];

let nextCategoryId = 4;
export let categories: Array<CategoryDto> = [
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

export function createVocabularies(): Array<CreatedVocabularyDto>;
export function createVocabularies(
  vocabularies: Array<CreateVocabularyDto>
): Array<CreatedVocabularyDto>;
export function createVocabularies(
  vocabularies?: Array<CreateVocabularyDto>
): Array<CreatedVocabularyDto> {
  let vocabularyId = 1;
  if (vocabularies) {
    const createdVocabularies = vocabularies.map(
      ({ english, examples, korean }) => {
        let exampleId = 1;
        const createdExamples = examples.map(({ sentence, translation }) => ({
          id: exampleId++,
          sentence,
          translation,
        }));
        return {
          id: vocabularyId++,
          english,
          korean,
          examples: createdExamples,
        };
      }
    );

    return createdVocabularies;
  } else {
    const numOfVocabularies = Math.floor(Math.random() * 50);
    const vocabularies: Array<CreatedVocabularyDto> = Array.from({
      length: numOfVocabularies,
    }).map(() => {
      const createExample = Math.random() > 0.4 ? true : false;
      const examples: Array<CreatedExampleDto> = [];
      if (createExample) {
        let exampleId = 1;
        const numOfExamples = Math.floor(Math.random() * 5);
        for (let i = 0; i < numOfExamples; i++) {
          faker.setLocale("en");
          const sentence = faker.lorem.sentence();
          faker.setLocale("ko");
          const translation = faker.lorem.sentence();
          examples.push({
            id: exampleId++,
            sentence,
            translation,
          });
        }
      }
      faker.setLocale("en");
      const english = faker.word.noun();
      faker.setLocale("ko");
      const korean = faker.word.noun();
      const vocabulary: CreatedVocabularyDto = {
        id: vocabularyId++,
        english,
        korean,
        examples,
      };

      return vocabulary;
    });

    return vocabularies;
  }
}

type CategoryDetails = Array<
  VocabularyListDto & {
    vocabularies: Array<CreatedVocabularyDto>;
  }
>;

export const createMockVocabularyListsInEachCategory = () => {
  let curId = 1;
  const result: {
    [key in typeof categories[number]["id"]]: CategoryDetails;
  } = categories.reduce(
    (acc, cur, categoryIndex, categories) => {
      const vocabularyLists: CategoryDetails = Array.from({
        length: (categoryIndex + 1) * (10 + Math.floor(Math.random() * 2)),
      })
        .map((_, index) => {
          const vocabularies = createVocabularies();
          return {
            id: curId++,
            title: `${categories[categoryIndex].name} DAY-${index + 1}`,
            createdAt: new Date(
              2021,
              12,
              1 + index,
              Math.floor(Math.random() * 24),
              Math.floor(Math.random() * 60)
            ).toISOString(),
            vocabularies,
            numOfVocabularies: vocabularies.length,
            category: categories[categoryIndex],
          };
        })
        .sort((elem1, elem2) => {
          const elem1Date = new Date(elem1.createdAt);
          const elem2Date = new Date(elem2.createdAt);
          if (elem1Date < elem2Date) return 1;
          else if (elem1Date === elem2Date) return 0;
          else return -1;
        });

      acc[cur.id] = vocabularyLists;

      return acc;
    },
    {} as {
      [key in typeof categories[number]["id"]]: CategoryDetails;
    }
  );

  return result;
};

const addVocabularyListInCategory = (
  detailedCategory: CategoryDetails,
  createVocabularyListDto: Omit<CreateVocabularyListDto, "vocabularies"> & {
    vocabularies: Array<CreatedVocabularyDto>;
  }
) => {
  const lastVoccabularyList = detailedCategory[0];
  const id = lastVoccabularyList.id + 1;
  detailedCategory.unshift({
    id,
    createdAt: new Date().toISOString(),
    category: lastVoccabularyList.category,
    numOfVocabularies: createVocabularyListDto.vocabularies.length,
    title: createVocabularyListDto.title,
    vocabularies: createVocabularyListDto.vocabularies,
  });
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
          if (!validUsers.find((user) => user.email === email)) {
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
        const registeredEmails = validUsers.map((user) => user.email);
        const { email, nickname, signUpAuthCode } = req.body;
        const invalidSignUpAuthCode = 444444;

        if (signUpAuthCode === invalidSignUpAuthCode) {
          return res(
            ctx.delay(100),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "인증 번호가 올바르지 않습니다.",
            })
          );
        } else if (registeredEmails.includes(email)) {
          return res(
            ctx.delay(100),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 가입된 이메일입니다.",
            })
          );
        } else {
          const id = validUsers.length + 1;
          const accessToken = `accessToken${id}`;
          const refreshToken = `refreshToken${id}`;

          validUsers.push({
            id,
            email,
            nickname,
            accessToken,
            refreshToken,
          });

          return res(
            ctx.delay(100),
            ctx.status(201),
            ctx.json({ ...validUsers[validUsers.length - 1] })
          );
        }
      }
    ),

    // 로그인 핸들러
    rest.post<LoginRequest>(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      (req, res, ctx) => {
        const { email } = req.body;
        const normalizedObj = validUsers.reduce((acc, cur) => {
          const { id, email, nickname, accessToken, refreshToken } = cur;
          acc[email] = {
            id,
            nickname,
            accessToken,
            refreshToken,
          };
          return acc;
        }, {} as Record<string, Omit<typeof validUsers[number], "email">>);

        if (Object.keys(normalizedObj).includes(email)) {
          const { id, nickname, refreshToken, accessToken } =
            normalizedObj[email];
          return res(
            ctx.delay(500),
            ctx.status(201),
            ctx.json({
              id,
              email,
              nickname,
              accessToken,
              refreshToken,
            })
          );
        } else {
          return res(
            ctx.status(401),
            ctx.json({
              message: "이메일 또는 비밀번호가 올바르지 않습니다.",
            })
          );
        }
      }
    ),

    // access token을 통한 사용자 정보 요청
    rest.get(`${process.env.REACT_APP_API_URL}/users/me`, (req, res, ctx) => {
      const authorizationHeader = req.headers.get("Authorization");
      if (!authorizationHeader) {
        return res(ctx.status(401));
      }

      if (/Bearer accessToken(\d)/.test(authorizationHeader)) {
        const accessToken = authorizationHeader.split(" ")[1];
        const user = validUsers.find(
          (user) => user.accessToken === accessToken
        );
        if (user) {
          const { id, nickname, email } = user;
          return res(
            ctx.status(200),
            ctx.json({
              id,
              email,
              nickname,
            })
          );
        }
      }

      return res(ctx.status(401));
    }),

    // 회원 탈퇴 요청
    rest.delete(
      `${process.env.REACT_APP_API_URL}/users/:id`,
      (req, res, ctx) => {
        let { id } = req.params;
        const validUserIndex = validUsers.findIndex(
          (user) => user.id === Number(id)
        );
        if (validUserIndex !== -1) {
          validUsers.splice(validUserIndex, 1);
          return res(ctx.delay(500), ctx.status(201));
        } else {
          return res(
            ctx.delay(200),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "Bad Request",
            })
          );
        }
      }
    ),

    // 비밀번호 재설정 인증 토큰 전송 요청 핸들러
    rest.post<ResetPasswordRequest>(
      `${process.env.REACT_APP_API_URL}/users/password`,
      (req, res, ctx) => {
        const { resetPasswordAuthCode, email } = req.body;
        if (Number(resetPasswordAuthCode) === 444444) {
          return res(
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "인증 번호가 올바르지 않습니다.",
            })
          );
        } else if (email === "wrong@gmail.com") {
          return res(
            ctx.delay(500),
            ctx.status(503),
            ctx.json({
              status: 503,
              message:
                "이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.",
            })
          );
        } else {
          return res(ctx.delay(500), ctx.status(204));
        }
      }
    ),

    // 카테고리 조회 요청 핸들러
    rest.get(`${process.env.REACT_APP_API_URL}/categories`, (req, res, ctx) => {
      const isFailed = Math.random() > 0.99;
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
        if (categories.findIndex((category) => category.name === name) !== -1) {
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
            id: nextCategoryId++,
            name,
          };
          categories.push(createdCategory);
          mockVocabularyLists[createdCategory.id] = [];
          return res(
            ctx.delay(1000),
            ctx.status(201),
            ctx.json(createdCategory)
          );
        }
      }
    ),

    // 카테고리 수정 요청 핸들러
    rest.patch<EditCategoryRequest>(
      `${process.env.REACT_APP_API_URL}/categories/:id`,
      (req, res, ctx) => {
        const { id, name } = req.body;
        const categoryIndex = categories.findIndex(
          (category) => category.id === id
        );
        if (categoryIndex === -1) {
          return res(
            ctx.delay(500),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "올바르지 않은 카테고리입니다.",
            })
          );
        }

        const isAlreadyExistName =
          categories.findIndex((category) => category.name === name) !== -1;
        if (isAlreadyExistName) {
          return res(
            ctx.delay(500),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 존재하는 카테고리명입니다.",
            })
          );
        }

        categories[categoryIndex].name = name;

        return res(
          ctx.delay(500),
          ctx.status(201),
          ctx.json({
            ...categories[categoryIndex],
          })
        );
      }
    ),

    // 카테고리 삭제 핸들러
    rest.delete(
      `${process.env.REACT_APP_API_URL}/categories/:id`,
      (req, res, ctx) => {
        const { id } = req.params;
        const categoryIndex = categories.findIndex(
          (category) => category.id === Number(id)
        );
        if (categoryIndex === -1) {
          return res(
            ctx.delay(500),
            ctx.status(401),
            ctx.json({
              status: 401,
              message: "올바르지 않은 카테고리입니다.",
            })
          );
        } else {
          const { id } = categories[categoryIndex];
          categories = categories.filter((category) => category.id !== id);
          delete mockVocabularyLists[id];

          return res(ctx.delay(500), ctx.status(201));
        }
      }
    ),
    // 단어장 조회 핸들러
    rest.get(
      `${process.env.REACT_APP_API_URL}/vocabularies`,
      (req, res, ctx) => {
        const { page, perPage, categoryId, title } =
          getQueryParamsFromRestRequest(req);
        const isFailed = Math.random() > 0.9;

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
        entireVocabularyLists =
          createEntireVocabularyLists(mockVocabularyLists);

        // 특정 카테고리의 단어장 조회
        if (categoryId) {
          const vocabularyListsInCategoryResponse =
            getPageBasedVocabularyListsOfCategory(
              mockVocabularyLists,
              categoryId,
              page,
              perPage
            );

          // 해당 카테고리의 특정 제목이 들어간 단어장들만 조회
          if (title) {
            const data = vocabularyListsInCategoryResponse.data.filter((voca) =>
              new RegExp(`${title}`, "g").test(voca.title)
            );
            const total = data.length;
            const totalPage = Math.ceil(total / perPage);
            const vocabularyListToHaveTitleResponse: PagedVocabularyListsResponse =
              {
                data,
                page,
                perPage,
                total,
                totalPage,
              };
            return res(
              ctx.delay(500),
              ctx.status(200),
              ctx.json(vocabularyListToHaveTitleResponse)
            );
          }
          // 해당 카테고리의 모든 단어장 조회
          return res(
            ctx.delay(500),
            ctx.status(200),
            ctx.json(vocabularyListsInCategoryResponse)
          );
        }

        // 모든 카테고리 내 단어장의 제목으로 조회
        if (title) {
          const result = getPageBasedVocabularyListsOfSpecificTitle(
            entireVocabularyLists,
            title,
            page,
            perPage
          );
          return res(ctx.delay(500), ctx.status(200), ctx.json(result));
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

    // 단어장 생성 핸들러
    rest.post<CreateVocabularyListDto>(
      `${process.env.REACT_APP_API_URL}/vocabularies`,
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
        const { categoryId, title, vocabularies } = req.body;
        const isAlreadyExistTitle = mockVocabularyLists[categoryId].find(
          (vocabularyList) => vocabularyList.title === title
        );
        if (isAlreadyExistTitle) {
          return res(
            ctx.delay(500),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "동일한 이름의 단어장이 카테고리 내에 존재합니다.",
            })
          );
        }

        const createdVocabularies = createVocabularies(vocabularies);
        addVocabularyListInCategory(mockVocabularyLists[categoryId], {
          categoryId: req.body.categoryId,
          title: req.body.title,
          vocabularies: createdVocabularies,
        });

        const { vocabularies: newVocabularies, ...response } =
          mockVocabularyLists[categoryId][0];
        return res(ctx.delay(500), ctx.status(201), ctx.json(response));
      }
    ),
  ];

  return handlers;
};

export const handlers = createHandlers();
