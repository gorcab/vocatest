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
    it('해당 카테고리에 단어장을 생성하고 생성된 단어장을 응답으로 받는다.', async () => {
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

    it('단어장을 추가할 카테고리가 해당 사용자의 카테고리가 아니면 401 에러를 반환한다.', async () => {
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

    it('해당 카테고리에 동일한 이름의 단어장이 존재한다면 400 에러를 반환한다.', async () => {
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
        '동일한 이름의 단어장이 카테고리 내에 존재합니다.',
      );
    });

    it('단어 형식이 올바르지 않은 단어장 생성 요청을 받으면 400 에러를 반환한다.', async () => {
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
              korean: '개',
            },
          ],
        })
        .expect(400);

      expect(response.body.message).toStrictEqual([
        'vocabularies.0.영단어 뜻은 문자열로 구성되어야 합니다.',
        'vocabularies.1.영단어 뜻은 문자열로 구성되어야 합니다.',
      ]);
    });

    it('단어가 없는 단어장 생성 요청을 받으면 400 에러를 반환한다.', async () => {
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
        '단어장은 하나 이상의 단어들로 구성되어야 합니다.',
      );
    });
  });

  describe('/vocabularies?page=${number}&perPage=${number} (GET)', () => {
    it(`페이지에 대한 정보와 perPage개의 영단어장을 응답으로 받는다.`, async () => {
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
        page,
        perPage,
        total: vocaLists.length,
        totalPage: Math.ceil(vocaLists.length / perPage),
        data: createVocabularyListDtos
          .reverse()
          .map((element) => ({
            id: expect.any(Number),
            title: element.title,
            category: expect.any(Object),
            createdAt: expect.any(String),
            numOfVocabularies: element.vocabularies.length,
          }))
          .slice(0, 10),
      });
    });
  });

  describe('/vocabularies/:vocabularyListId', () => {
    it('특정 id의 영단어장을 반환한다.', async () => {
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
  });

  describe('/vocabularies/:vocabularyListId (DELETE)', () => {
    it('vocabularyListId를 토대로 특정 단어장을 삭제한다.', async () => {
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

    it('해당 사용자의 단어장이 아니면 401 에러를 반환한다.', async () => {
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
      const vocaList = createVocabularyList(category, [createVocabulary()]);
      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: category.id,
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
      const anotherCategory = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );
      const anotherVocaList = createVocabularyList(anotherCategory, [
        createVocabulary(),
      ]);
      const anotherCreateVocabularyListDto: CreateVocabularyListDto = {
        categoryId: anotherCategory.id,
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
    it('업데이트된 단어장 정보를 반환한다.', async () => {
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
        vocabularies: createVocabularyListDto.vocabularies,
      };
      updateVocabularyListDto.title = 'updatedVocaList1';
      updateVocabularyListDto.vocabularies[1].english = 'update';
      updateVocabularyListDto.vocabularies[1].korean = '갱신하다';
      updateVocabularyListDto.vocabularies[1].examples = [
        {
          sentence: 'I need to update the file.',
          translation: '파일을 새로 갱신할 필요가 있겠어요.',
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

    it('해당 사용자의 단어장이 아니면 수정을 할 수 없고 401 에러를 반환한다.', async () => {
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
      const vocaList = createVocabularyList(category, [createVocabulary()]);
      const createVocabularyListDto: CreateVocabularyListDto = {
        categoryId: category.id,
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
      const anotherCategory = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );
      const anotherVocaList = createVocabularyList(anotherCategory, [
        createVocabulary(),
      ]);
      const anotherCreateVocabularyListDto: CreateVocabularyListDto = {
        categoryId: anotherCategory.id,
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
