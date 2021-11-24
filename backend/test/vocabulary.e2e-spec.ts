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
      sndSignUpAuthCode: (sendSignUpAuthCodeDto) => Promise.resolve(),
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

      const vocabularies: Array<CreateVocabularyDto> = [
        {
          english: 'apple',
          korean: '사과',
          examples: [
            {
              sentence: 'He ate the apple',
              translation: '그는 사과를 먹었다.',
            },
            {
              sentence: 'Sling me an apple, will you?',
              translation: '나한테 사과를 던져줄래?',
            },
          ],
        },
        {
          english: 'banana',
          korean: '바나나',
          examples: [
            {
              sentence: 'I hate banana',
              translation: '나는 바나나가 싫다.',
            },
          ],
        },
        {
          english: 'dog',
          korean: '개',
        },
      ];

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

      const vocabularies: Array<CreateVocabularyDto> = [
        {
          english: 'apple',
          korean: '사과',
          examples: [
            {
              sentence: 'He ate the apple',
              translation: '그는 사과를 먹었다.',
            },
            {
              sentence: 'Sling me an apple, will you?',
              translation: '나한테 사과를 던져줄래?',
            },
          ],
        },
        {
          english: 'banana',
          korean: '바나나',
          examples: [
            {
              sentence: 'I hate banana',
              translation: '나는 바나나가 싫다.',
            },
          ],
        },
        {
          english: 'dog',
          korean: '개',
        },
      ];

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

      const vocabularies: Array<CreateVocabularyDto> = [
        {
          english: 'apple',
          korean: '사과',
          examples: [
            {
              sentence: 'He ate the apple',
              translation: '그는 사과를 먹었다.',
            },
            {
              sentence: 'Sling me an apple, will you?',
              translation: '나한테 사과를 던져줄래?',
            },
          ],
        },
        {
          english: 'banana',
          korean: '바나나',
          examples: [
            {
              sentence: 'I hate banana',
              translation: '나는 바나나가 싫다.',
            },
          ],
        },
        {
          english: 'dog',
          korean: '개',
        },
      ];

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

      const vocaLists: Array<Array<CreateVocabularyDto>> = [
        [
          {
            english: 'apple',
            korean: '사과',
            examples: [
              {
                sentence: 'He ate the apple',
                translation: '그는 사과를 먹었다.',
              },
              {
                sentence: 'Sling me an apple, will you?',
                translation: '나한테 사과를 던져줄래?',
              },
            ],
          },
        ],
        [
          {
            english: 'banana',
            korean: '바나나',
            examples: [
              {
                sentence: 'I hate banana',
                translation: '나는 바나나가 싫다.',
              },
            ],
          },
        ],
        [
          {
            english: 'dog',
            korean: '개',
          },
        ],
        [
          {
            english: 'dictionary',
            korean: '사전',
          },
        ],
        [
          {
            english: 'word',
            korean: '단어',
          },
        ],
        [
          {
            english: 'grammar',
            korean: '문법',
          },
        ],
        [
          {
            english: 'pronounciation',
            korean: '발음',
          },
        ],
        [
          {
            english: 'confidence',
            korean: '자신감',
          },
        ],
        [
          {
            english: 'challenge',
            korean: '도전',
          },
        ],
        [
          {
            english: 'hope',
            korean: '희망',
          },
        ],
        [
          {
            english: 'future',
            korean: '미래',
          },
          {
            english: 'korea',
            korean: '대한민국',
          },
        ],
      ];

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
});
