import { rest } from "msw";
import {
  addVocabularyList,
  createMockVocabularyListsInEachCategory,
  createVocabularies,
  deleteVocabularyListById,
  editMockVocabularyListsRecord,
  getEntireVocabularyLists,
  getPageBasedVocabularyLists,
} from "mocks/lib/vocabulary.factory";
import {
  AuthCodeRequest,
  CreateCategoryRequest,
  CreateVocabularyListDto,
  EditCategoryRequest,
  EditVocabularyListDto,
  LoginRequest,
  ResetPasswordRequest,
  SignUpRequest,
} from "../../features/api/types";
import {
  registerUser,
  unregisterUser,
  users as mockUsers,
} from "mocks/lib/user.factory";
import {
  createCategory,
  deleteCategory,
  editCategory,
  findCategoryIndex,
  mockCategories,
} from "mocks/lib/category.factory";
import { getQueryParamsFromRestRequest } from "mocks/lib/networkMockUtils.factory";

const createHandlers = () => {
  let users = mockUsers;
  let categories = mockCategories;
  let vocabularyListsRecord = createMockVocabularyListsInEachCategory();
  let entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);

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
          if (!users.find((user) => user.email === email)) {
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
        const registeredEmails = users.map((user) => user.email);
        const { email, nickname, signUpAuthCode, password } = req.body;
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
          users = registerUser(users, {
            email,
            password,
            signUpAuthCode,
            nickname,
          });

          return res(
            ctx.delay(100),
            ctx.status(201),
            ctx.json({ ...users[users.length - 1] })
          );
        }
      }
    ),

    // 로그인 핸들러
    rest.post<LoginRequest>(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      (req, res, ctx) => {
        const { email } = req.body;
        const user = users.find((user) => user.email === email);

        if (user) {
          return res(ctx.delay(500), ctx.status(201), ctx.json({ ...user }));
        }

        return res(
          ctx.status(401),
          ctx.json({
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          })
        );
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
        const user = users.find((user) => user.accessToken === accessToken);
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
        const usersLen = users.length;
        const id = req.params.id;
        users = unregisterUser(users, Number(id));
        if (usersLen !== users.length) {
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

    // 비밀번호 재설정 요청 핸들러
    rest.post<ResetPasswordRequest>(
      `${process.env.REACT_APP_API_URL}/users/password`,
      (req, res, ctx) => {
        const { resetPasswordAuthCode } = req.body;
        if (Number(resetPasswordAuthCode) === 444444) {
          return res(
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "인증 번호가 올바르지 않습니다.",
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
          ctx.status(400),
          ctx.json({
            status: 400,
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
        if (
          findCategoryIndex(
            categories,
            (category) => category.name === name
          ) !== -1
        ) {
          return res(
            ctx.delay(100),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 존재하는 카테고리명입니다.",
            })
          );
        } else {
          categories = createCategory(categories, req.body);
          vocabularyListsRecord[categories[categories.length - 1].id] = [];
          return res(
            ctx.delay(1000),
            ctx.status(201),
            ctx.json(categories[categories.length - 1])
          );
        }
      }
    ),

    // 카테고리 수정 요청 핸들러
    rest.patch<EditCategoryRequest>(
      `${process.env.REACT_APP_API_URL}/categories/:id`,
      (req, res, ctx) => {
        const { id, name } = req.body;
        const categoryIndex = findCategoryIndex(
          categories,
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

        if (
          findCategoryIndex(
            categories,
            (category) => category.name === name
          ) !== -1
        ) {
          return res(
            ctx.delay(500),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "이미 존재하는 카테고리명입니다.",
            })
          );
        }

        categories = editCategory(categories, { id, name });

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
        const categoryIndex = findCategoryIndex(
          categories,
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
        }

        categories = deleteCategory(categories, Number(id));
        delete vocabularyListsRecord[Number(id)];
        entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);

        return res(ctx.delay(500), ctx.status(201));
      }
    ),

    // 단어장 리스트 조회 핸들러
    rest.get(
      `${process.env.REACT_APP_API_URL}/vocabularies`,
      (req, res, ctx) => {
        const { page, perPage, categoryId, title } =
          getQueryParamsFromRestRequest(req);
        const isFailed = Math.random() > 0.95;

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
        vocabularyListsRecord = deleteVocabularyListById(
          vocabularyListsRecord,
          Number(id)
        );
        entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);

        return res(ctx.delay(500), ctx.status(201));
      }
    ),

    // 단어장 생성 핸들러
    rest.post<CreateVocabularyListDto>(
      `${process.env.REACT_APP_API_URL}/vocabularies`,
      (req, res, ctx) => {
        const isFailed = Math.random() > 0.9;
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
        const isAlreadyExistTitle = vocabularyListsRecord[categoryId].find(
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
        vocabularyListsRecord = addVocabularyList(vocabularyListsRecord, {
          categoryId,
          title,
          vocabularies: createdVocabularies,
        });
        const { vocabularies: newVocabularies, ...response } =
          vocabularyListsRecord[categoryId][0];

        return res(ctx.delay(500), ctx.status(201), ctx.json(response));
      }
    ),

    // 특정 단어장 조회 핸들러
    rest.get(
      `${process.env.REACT_APP_API_URL}/vocabularies/:id`,
      (req, res, ctx) => {
        const id = Number(req.params.id);
        const vocabularyList = entireVocabularyLists.find(
          (vocabularyList) => vocabularyList.id === id
        );
        if (!vocabularyList) {
          return res(
            ctx.delay(500),
            ctx.status(403),
            ctx.json({
              status: 403,
              message: "잘못된 요청입니다.",
            })
          );
        }

        return res(
          ctx.delay(500),
          ctx.status(200),
          ctx.json({
            ...vocabularyList,
          })
        );
      }
    ),

    // 단어장 수정 핸들러
    rest.put<EditVocabularyListDto>(
      `${process.env.REACT_APP_API_URL}/vocabularies/:id`,
      (req, res, ctx) => {
        const id = Number(req.params.id);
        const vocabularyListDto = req.body;
        console.log("put: ", id, vocabularyListDto);
        if (Number.isNaN(id)) {
          return res(
            ctx.delay(1000),
            ctx.status(400),
            ctx.json({
              status: 400,
              message: "Bad Request",
            })
          );
        }

        const vocabularyList = entireVocabularyLists.find(
          (vocaList) => vocaList.id === Number(id)
        );
        if (!vocabularyList) {
          return res(
            ctx.delay(1000),
            ctx.status(403),
            ctx.json({
              status: 403,
              message: "Forbidden",
            })
          );
        }

        const {
          editedVocabularyList,
          vocabularyListsRecord: newVocabularyListsRecord,
        } = editMockVocabularyListsRecord(
          vocabularyListsRecord,
          {
            vocabularyListId: id,
            ...vocabularyListDto,
          },
          categories
        );
        vocabularyListsRecord = newVocabularyListsRecord;
        console.log("newVocaListsRecord: ", vocabularyListsRecord);
        entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);

        console.log("editedVoca: ", editedVocabularyList);
        return res(
          ctx.delay(1000),
          ctx.status(201),
          ctx.json({
            ...editedVocabularyList,
          })
        );
      }
    ),
  ];

  return handlers;
};

export const handlers = createHandlers();
