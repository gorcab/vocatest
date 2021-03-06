import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { CreateCategoryDto } from 'src/category/dtos/CreateCategory.dto';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { EmailService } from 'src/email/services/email.service';
import { CreateUserServiceDto } from 'src/user/dtos/CreateUserService.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { CreateVocabularyDto } from 'src/vocabulary/dtos/CreateVocabulary.dto';
import { CreateVocabularyListDto } from 'src/vocabulary/dtos/CreateVocabularyList.dto';
import { Example } from 'src/vocabulary/entities/Example.entity';
import { Vocabulary } from 'src/vocabulary/entities/Vocabulary.entity';
import { VocabularyList } from 'src/vocabulary/entities/VocabularyList.entity';
import { Repository } from 'typeorm';
import { VocabularyService } from 'src/vocabulary/service/vocabulary.service';
import { VocabularyListDto } from 'src/vocabulary/dtos/VocabularyList.dto';
import {
  createCreateVocabularyDtos,
  createExample,
  createVocabulary,
  createVocabularyList,
  createVocabularyLists,
} from 'src/common/mocks/utils';
import { UpdateVocabularyListDto } from 'src/vocabulary/dtos/UpdateVocabularyList.dto';

describe('VocabularyController (e2e)', () => {
  let app: INestApplication;
  let mockEmailService: Partial<EmailService>;
  let redisStore: Cache;
  let userRepository: Repository<User>;
  let userService: UserService;
  let categoryRepository: Repository<Category>;
  let categoryService: CategoryService;
  let vocabularyListRepository: Repository<VocabularyList>;
  let vocabularyRepository: Repository<Vocabulary>;
  let exampleRepository: Repository<Example>;
  let vocabularyService: VocabularyService;
  let module: TestingModule;

  beforeEach(async () => {
    mockEmailService = {
      sendSignUpAuthCode: (sendSignUpAuthCodeDto) => Promise.resolve(),
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = module.createNestApplication();
    app.listen(3000);

    redisStore = module.get<Cache>(CACHE_MANAGER);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    categoryService = module.get<CategoryService>(CategoryService);
    vocabularyListRepository = module.get<Repository<VocabularyList>>(
      getRepositoryToken(VocabularyList),
    );
    vocabularyRepository = module.get<Repository<Vocabulary>>(
      getRepositoryToken(Vocabulary),
    );
    exampleRepository = module.get<Repository<Example>>(
      getRepositoryToken(Example),
    );
    vocabularyService = module.get<VocabularyService>(VocabularyService);

    await app.init();
  });

  afterEach(async () => {
    await redisStore.reset();
    await userRepository.delete({});
    await categoryRepository.delete({});
    await exampleRepository.delete({});
    await vocabularyRepository.delete({});
    await vocabularyListRepository.delete({});
    await app.close(); // automatically close connection.
  });

  describe('/vocabularies (POST)', () => {
    it('?????? ??????????????? ???????????? ???????????? ????????? ???????????? ???????????? ?????????.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const vocabularies: Array<CreateVocabularyDto> =
        createCreateVocabularyDtos();

      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: category.id,
        title: 'DAY 1',
        vocabularies,
      };

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      const response = await agent
        .post('/vocabularies')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(createVocabularyListDto)
        .expect(201);

      expect(response.body).toStrictEqual({
        id: expect.any(Number),
        createdAt: expect.any(String),
        title: createVocabularyListDto.title,
        category: {
          id: category.id,
          name: category.name,
        },
        numOfVocabularies: 3,
      });
    });

    it('???????????? ????????? ??????????????? ?????? ???????????? ??????????????? ????????? 401 ????????? ????????????.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const anotherCreateUserServiceDto: CreateUserServiceDto = {
        email: 'test2@gmail.com',
        password: 'test4567',
        nickname: 'tester2',
      };

      const user = await userService.save(createUserServiceDto);
      const anotherUser = await userService.save(anotherCreateUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };

      const anotherCreateCategoryDto: CreateCategoryDto = {
        name: 'teps',
      };

      const category = await categoryService.save(user, createCategoryDto);
      const anotherCategory = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );

      const vocabularies: Array<CreateVocabularyDto> =
        createCreateVocabularyDtos();

      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: anotherCategory.id,
        title: 'DAY 1',
        vocabularies,
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      return agent
        .post('/vocabularies')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(createVocabularyListDto)
        .expect(401);
    });

    it('?????? ??????????????? ????????? ????????? ???????????? ??????????????? 400 ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const vocabularies: Array<CreateVocabularyDto> =
        createCreateVocabularyDtos();

      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: category.id,
        title: 'DAY 1',
        vocabularies,
      };

      vocabularyService.save(createVocabularyListDto);

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when, then
      const response = await agent
        .post('/vocabularies')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(createVocabularyListDto)
        .expect(400);

      expect(response.body.message).toBe(
        '????????? ????????? ???????????? ???????????? ?????? ???????????????.',
      );
    });

    it('?????? ????????? ???????????? ?????? ????????? ?????? ????????? ????????? 400 ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when, then
      const response = await agent
        .post('/vocabularies')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send({
          categoryId: category.id,
          title: 'DAY 1',
          vocabularies: [
            {
              english: 'apple',
            },
            {
              english: 'banana',
            },
            {
              english: 'dog',
              korean: '???',
            },
          ],
        })
        .expect(400);

      expect(response.body.message).toStrictEqual([
        'vocabularies.0.????????? ?????? ???????????? ??????????????? ?????????.',
        'vocabularies.1.????????? ?????? ???????????? ??????????????? ?????????.',
      ]);
    });

    it('????????? ?????? ????????? ?????? ????????? ????????? 400 ????????? ????????????.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const vocabularies: Array<CreateVocabularyDto> = [];
      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: category.id,
        title: 'DAY 1',
        vocabularies,
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      const response = await agent
        .post('/vocabularies')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(createVocabularyListDto)
        .expect(400);

      expect(response.body.message[0]).toBe(
        '???????????? ?????? ????????? ???????????? ??????????????? ?????????.',
      );
    });
  });

  describe('/vocabularies?page=${number}&perPage=${number} (GET)', () => {
    it(`???????????? ?????? ????????? perPage?????? ??????????????? ???????????? ?????????.`, async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const vocaLists: Array<Array<CreateVocabularyDto>> =
        createVocabularyLists();

      let day = 1;
      const createVocabularyListDtos: Array<CreateVocabularyListDto> = [];
      for (const vocabularies of vocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: category.id,
          title: `DAY ${day}`,
          vocabularies,
        };
        day++;
        createVocabularyListDtos.push(createVocabularyListDto);

        await vocabularyService.save(createVocabularyListDto);
      }

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      const page = 1,
        perPage = 10;

      const response = await agent
        .get(`/vocabularies?page=${page}&perPage=${perPage}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toStrictEqual({
        page: 1,
        perPage: 10,
        total: 11,
        totalPage: 2,
        data: createVocabularyListDtos
          .reverse()
          .map((element, index) => ({
            id: expect.any(Number),
            title: element.title,
            category: {
              id: expect.any(Number),
              name: expect.any(String),
            },
            createdAt: expect.any(String),
            numOfVocabularies: element.vocabularies.length,
          }))
          .slice(0, 10),
      });
    });
  });

  describe('/vocabularies?category=${number}&page=${number}&perPage=${number} GET', () => {
    it('?????? ??????????????? ??????????????? ??????????????? ????????? ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const createAnotherCategoryDto: CreateCategoryDto = {
        name: 'teps',
      };
      const anotherCategory = await categoryService.save(
        user,
        createAnotherCategoryDto,
      );

      const vocaLists: Array<Array<CreateVocabularyDto>> =
        createVocabularyLists();

      let day = 1;
      const createVocabularyListDtos: Array<CreateVocabularyListDto> = [];
      for (const vocabularies of vocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: category.id,
          title: `DAY ${day}`,
          vocabularies,
        };
        day++;
        createVocabularyListDtos.push(createVocabularyListDto);

        await vocabularyService.save(createVocabularyListDto);
      }

      const anotherVocaLists: Array<Array<CreateVocabularyDto>> = [
        [{ english: 'pencil', korean: '??????' }],
        [
          { english: 'ruler', korean: '???' },
          { english: 'eraser', korean: '?????????' },
        ],
        [{ english: 'chair', korean: '??????' }],
      ];
      day = 1;
      for (const vocabularies of anotherVocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: anotherCategory.id,
          title: `DAY ${day}`,
          vocabularies,
        };
        day++;

        await vocabularyService.save(createVocabularyListDto);
      }

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });
      const page = 1,
        perPage = 10;

      // when
      const response = await agent
        .get(
          `/vocabularies?category=${anotherCategory.id}&page=${page}&perPage=${perPage}`,
        )
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(200);

      // then
      expect(response.body).toStrictEqual({
        page: 1,
        perPage: 10,
        total: 3,
        totalPage: 1,
        data: [
          {
            id: expect.any(Number),
            title: 'DAY 3',
            category: {
              id: expect.any(Number),
              name: anotherCategory.name,
            },
            createdAt: expect.any(String),
            numOfVocabularies: 1,
          },
          {
            id: expect.any(Number),
            title: 'DAY 2',
            category: {
              id: expect.any(Number),
              name: anotherCategory.name,
            },
            createdAt: expect.any(String),
            numOfVocabularies: 2,
          },
          {
            id: expect.any(Number),
            title: 'DAY 1',
            category: {
              id: expect.any(Number),
              name: anotherCategory.name,
            },
            createdAt: expect.any(String),
            numOfVocabularies: 1,
          },
        ],
      });
    });
  });

  describe('/vocabularies?title=${string}&page=${number}&perPage=${number}', () => {
    it('????????? ?????? ????????? ????????? ??????????????? ??????????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const vocaLists: Array<Array<CreateVocabularyDto>> = [
        [{ english: 'pencil', korean: '??????' }],
        [
          { english: 'ruler', korean: '???' },
          { english: 'eraser', korean: '?????????' },
        ],
        [{ english: 'chair', korean: '??????' }],
      ];
      let day = 1;
      for (const vocabularies of vocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: category.id,
          title: day < 3 ? `?????? ??? DAY ${day}` : `?????? ??? DAY ${day}`,
          vocabularies,
        };
        day++;

        await vocabularyService.save(createVocabularyListDto);
      }

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });
      const page = 1,
        perPage = 10;

      // when
      const response = await agent
        .get(
          `/vocabularies?page=${page}&perPage=${perPage}&title=${encodeURI(
            '?????? ???',
          )}`,
        )
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(200);

      // then
      expect(response.body).toStrictEqual({
        page: 1,
        perPage: 10,
        total: 2,
        totalPage: 1,
        data: [
          {
            id: expect.any(Number),
            title: '?????? ??? DAY 2',
            category: {
              id: expect.any(Number),
              name: category.name,
            },
            createdAt: expect.any(String),
            numOfVocabularies: 2,
          },
          {
            id: expect.any(Number),
            title: '?????? ??? DAY 1',
            category: {
              id: expect.any(Number),
              name: category.name,
            },
            createdAt: expect.any(String),
            numOfVocabularies: 1,
          },
        ],
      });
    });
  });

  describe('/vocabularies/:vocabularyListId', () => {
    it('?????? id??? ??????????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const vocaLists: Array<Array<CreateVocabularyDto>> =
        createVocabularyLists();

      let day = 1;
      let vocabularyListDto: VocabularyListDto;
      for (const vocabularies of vocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: category.id,
          title: `DAY ${day}`,
          vocabularies,
        };

        const result = await vocabularyService.save(createVocabularyListDto);
        if (day === 1) {
          vocabularyListDto = result;
        }

        day++;
      }

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when
      const response = await agent
        .get(`/vocabularies/${vocabularyListDto.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(200);

      // then
      expect(response.body).toStrictEqual({
        id: vocabularyListDto.id,
        title: vocabularyListDto.title,
        category: {
          id: vocabularyListDto.category.id,
          name: vocabularyListDto.category.name,
        },
        createdAt: vocabularyListDto.createdAt.toISOString(),
        vocabularies: [
          {
            id: expect.any(Number),
            english: vocaLists[0][0].english,
            korean: vocaLists[0][0].korean,
            examples: [
              {
                id: expect.any(Number),
                sentence: vocaLists[0][0].examples[0].sentence,
                translation: vocaLists[0][0].examples[0].translation,
              },
              {
                id: expect.any(Number),
                sentence: vocaLists[0][0].examples[1].sentence,
                translation: vocaLists[0][0].examples[1].translation,
              },
            ],
          },
        ],
      });
    });

    it('?????? ???????????? ???????????? ???????????? 403 ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const anotherUserServiceDto: CreateUserServiceDto = {
        email: 'test123@gmail.com',
        password: 'test1234',
        nickname: 'another',
      };
      const user = await userService.save(createUserServiceDto);
      const anotherUser = await userService.save(anotherUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const anotherCreateCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const anotherCategory = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );

      const vocaLists: Array<Array<CreateVocabularyDto>> =
        createVocabularyLists();

      const anotherVocaLists: Array<Array<CreateVocabularyDto>> =
        createVocabularyLists();

      let day = 1;
      let vocabularyListDto: VocabularyListDto;
      for (const vocabularies of vocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: category.id,
          title: `DAY ${day}`,
          vocabularies,
        };

        const result = await vocabularyService.save(createVocabularyListDto);
        if (day === 1) {
          vocabularyListDto = result;
        }

        day++;
      }

      day = 1;
      let anotherVocabularyListDto: VocabularyListDto;
      for (const vocabularies of anotherVocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: anotherCategory.id,
          title: `DAY ${day}`,
          vocabularies,
        };

        const result = await vocabularyService.save(createVocabularyListDto);
        if (day === 1) {
          anotherVocabularyListDto = result;
        }

        day++;
      }

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when
      const response = await agent
        .get(`/vocabularies/${anotherVocabularyListDto.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(403);
    });
  });

  describe('/vocabularies/:vocabularyListId (DELETE)', () => {
    it('vocabularyListId??? ????????? ?????? ???????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);

      const vocaLists: Array<Array<CreateVocabularyDto>> =
        createVocabularyLists();

      let day = 1;
      let vocabularyListDto: VocabularyListDto;
      const createVocabularyListDtos: Array<CreateVocabularyListDto> = [];
      for (const vocabularies of vocaLists) {
        const createVocabularyListDto: CreateVocabularyListDto = {
          categoryId: category.id,
          title: `DAY ${day}`,
          vocabularies,
        };
        createVocabularyListDtos.push(createVocabularyListDto);

        const result = await vocabularyService.save(createVocabularyListDto);
        if (day === 1) {
          vocabularyListDto = result;
        }

        day++;
      }

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when
      return await agent
        .delete(`/vocabularies/${vocabularyListDto.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(204);
    });

    it('?????? ???????????? ???????????? ????????? 401 ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      // user
      const user = await userService.save(createUserServiceDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const categoryDto = await categoryService.save(user, createCategoryDto);
      const vocaList = createVocabularyList(categoryDto, [createVocabulary()]);
      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: categoryDto.id,
        title: 'vocaList1',
        vocabularies: [
          {
            english: vocaList.vocabularies[0].english,
            korean: vocaList.vocabularies[0].korean,
          },
        ],
      };
      const result = await vocabularyService.save(createVocabularyListDto);

      // another user
      const createAnotherServiceDto: CreateUserServiceDto = {
        email: 'anotherTest1234@gmail.com',
        password: 'anothertest1234',
        nickname: 'anotherTester',
      };
      const anotherUser = await userService.save(createAnotherServiceDto);
      const anotherCreateCategoryDto: CreateCategoryDto = {
        name: 'teps',
      };
      const anotherCategoryDto = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );
      const anotherVocaList = createVocabularyList(anotherCategoryDto, [
        createVocabulary(),
      ]);
      const anotherCreateVocabularyListDto: CreateVocabularyListDto = {
        categoryId: anotherCategoryDto.id,
        title: 'vocaList2',
        vocabularies: [
          {
            english: anotherVocaList.vocabularies[0].english,
            korean: anotherVocaList.vocabularies[0].korean,
          },
        ],
      };
      const anotherResult = await vocabularyService.save(
        anotherCreateVocabularyListDto,
      );

      // get access token
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when, then
      return await agent
        .delete(`/vocabularies/${anotherResult.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(401);
    });
  });

  describe('/vocabularies/:vocabularyListId (PUT)', () => {
    it('??????????????? ????????? ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      // user
      const user = await userService.save(createUserServiceDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const vocaList = createVocabularyList(category, [
        createVocabulary(),
        createVocabulary([createExample(), createExample()]),
      ]);
      const examples = await vocaList.vocabularies[1].examples;
      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: category.id,
        title: 'vocaList1',
        vocabularies: [
          {
            english: vocaList.vocabularies[0].english,
            korean: vocaList.vocabularies[0].korean,
          },
          {
            english: vocaList.vocabularies[1].english,
            korean: vocaList.vocabularies[1].korean,
            examples: [
              {
                sentence: examples[0].sentence,
                translation: examples[0].translation,
              },
              {
                sentence: examples[1].sentence,
                translation: examples[1].translation,
              },
            ],
          },
        ],
      };
      const vocabularyList = await vocabularyService.save(
        createVocabularyListDto,
      );

      // get access token
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      const updateVocabularyListDto: UpdateVocabularyListDto = {
        title: createVocabularyListDto.title,
        categoryId: category.id,
        vocabularies: createVocabularyListDto.vocabularies,
      };
      updateVocabularyListDto.title = 'updatedVocaList1';
      updateVocabularyListDto.vocabularies[1].english = 'update';
      updateVocabularyListDto.vocabularies[1].korean = '????????????';
      updateVocabularyListDto.vocabularies[1].examples = [
        {
          sentence: 'I need to update the file.',
          translation: '????????? ?????? ????????? ????????? ????????????.',
        },
      ];

      const response = await agent
        .put(`/vocabularies/${vocabularyList.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(updateVocabularyListDto)
        .expect(200);

      expect(response.body).toStrictEqual({
        id: vocabularyList.id,
        title: updateVocabularyListDto.title,
        category: {
          id: category.id,
          name: category.name,
        },
        createdAt: vocabularyList.createdAt.toISOString(),
        vocabularies: [
          {
            id: expect.any(Number),
            english: updateVocabularyListDto.vocabularies[0].english,
            korean: updateVocabularyListDto.vocabularies[0].korean,
          },
          {
            id: expect.any(Number),
            english: updateVocabularyListDto.vocabularies[1].english,
            korean: updateVocabularyListDto.vocabularies[1].korean,
            examples: [
              {
                id: expect.any(Number),
                sentence:
                  updateVocabularyListDto.vocabularies[1].examples[0].sentence,
                translation:
                  updateVocabularyListDto.vocabularies[1].examples[0]
                    .translation,
              },
            ],
          },
        ],
      });
    });

    it('?????? ???????????? ???????????? ????????? ????????? ??? ??? ?????? 401 ????????? ????????????.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      // user
      const user = await userService.save(createUserServiceDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const categoryDto = await categoryService.save(user, createCategoryDto);
      const vocaList = createVocabularyList(categoryDto, [createVocabulary()]);
      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: categoryDto.id,
        title: 'vocaList1',
        vocabularies: [
          {
            english: vocaList.vocabularies[0].english,
            korean: vocaList.vocabularies[0].korean,
          },
        ],
      };
      const result = await vocabularyService.save(createVocabularyListDto);

      // another user
      const createAnotherServiceDto: CreateUserServiceDto = {
        email: 'anotherTest1234@gmail.com',
        password: 'anothertest1234',
        nickname: 'anotherTester',
      };
      const anotherUser = await userService.save(createAnotherServiceDto);
      const anotherCreateCategoryDto: CreateCategoryDto = {
        name: 'teps',
      };
      const anotherCategoryDto = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );
      const anotherVocaList = createVocabularyList(anotherCategoryDto, [
        createVocabulary(),
      ]);
      const anotherCreateVocabularyListDto: CreateVocabularyListDto = {
        categoryId: anotherCategoryDto.id,
        title: 'vocaList2',
        vocabularies: [
          {
            english: anotherVocaList.vocabularies[0].english,
            korean: anotherVocaList.vocabularies[0].korean,
          },
        ],
      };
      const anotherResult = await vocabularyService.save(
        anotherCreateVocabularyListDto,
      );

      const updateVocabularyListDto: UpdateVocabularyListDto = {
        title: createVocabularyListDto.title,
        categoryId: categoryDto.id,
        vocabularies: createVocabularyListDto.vocabularies,
      };
      updateVocabularyListDto.title = 'updatedVocabularyList';

      // get access token
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      // when, then
      return await agent
        .put(`/vocabularies/${anotherResult.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(updateVocabularyListDto)
        .expect(401);
    });
  });
});
