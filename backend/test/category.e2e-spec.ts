import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmailService } from 'src/email/services/email.service';
import { Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/entities/user.entity';
import { Cache } from 'cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { CreateUserServiceDto } from 'src/user/dtos/CreateUserService.dto';
import { CreateCategoryDto } from 'src/category/dtos/CreateCategory.dto';
import { UpdateCategoryDto } from 'src/category/dtos/UpdateCategory.dto';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let mockEmailService: Partial<EmailService>;
  let redisStore: Cache;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;
  let userService: UserService;
  let categoryService: CategoryService;
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

    await app.init();
  });

  afterEach(async () => {
    await redisStore.reset();
    await userRepository.delete({});
    await categoryRepository.delete({});
    await app.close(); // automatically close connection.
  });

  describe('/categories (POST)', () => {
    it('인증되지 않은 사용자가 카테고리 생성 요청을 보내면 401 에러를 반환한다.', async () => {
      // given
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };

      // when, then
      return request(app.getHttpServer())
        .post('/categories')
        .send(createCategoryDto)
        .expect(401);
    });

    it('해당 회원이 이미 같은 이름의 카테고리가 있다면 400 에러를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = categoryRepository.create({
        name: createCategoryDto.name,
        user: user,
      });
      await categoryRepository.save(category);
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when
      const response = await agent
        .post('/categories')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(400);

      // then
      expect(response.body.message).toBe('이미 존재하는 카테고리명입니다.');
    });

    it('카테고리 생성을 완료하면 생성한 카테고리에 대한 정보를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when
      const response = await agent
        .post('/categories')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(201);

      // then
      expect(response.body.name).toBe(createCategoryDto.name);
    });
  });

  describe('/categories (GET)', () => {
    it('해당 회원의 모든 카테고리를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDtos: Array<CreateCategoryDto> = Array.from({
        length: 10,
      }).map((_, index) => ({
        name: `toeic${index + 1}`,
        userId: user.id,
      }));
      await Promise.all(
        createCategoryDtos.map(async (createCategoryServiceDto) => {
          await categoryService.save(user, createCategoryServiceDto);
        }),
      );
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when
      const response = await agent
        .get('/categories')
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(200);

      // then
      expect(response.body.categories).toHaveLength(createCategoryDtos.length);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    it('특정 회원이 다른 회원의 카테고리 수정을 요청하면 401 에러를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const anotherCreateUserDto: CreateUserServiceDto = {
        email: 'test5678@gmail.com',
        password: 'test5678',
        nickname: 'tester2',
      };
      const user = await userService.save(createUserDto);
      const anotherUser = await userService.save(anotherCreateUserDto);
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

      const updateCategoryDto: UpdateCategoryDto = {
        id: anotherCategory.id,
        name: 'toefl',
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when, then
      return agent
        .patch(`/categories/${category.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(401);
    });

    it('해당 회원의 카테고리가 아니라면 401 에러를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const updateCategoryDto: UpdateCategoryDto = {
        id: category.id + 1,
        name: 'teps',
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when, then
      return agent
        .patch(`/categories/${category.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(401);
    });

    it('해당 회원이 동일한 이름의 카테고리를 가지고 있다면 400 에러를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const updateCategoryDto: UpdateCategoryDto = {
        id: category.id,
        name: category.name,
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when, then
      return agent
        .patch(`/categories/${category.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(400);
    });

    it('해당 회원의 카테고리이면 카테고리명을 변경하고 변경된 카테고리에 대한 정보를 반환한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const updatedName = 'teps';
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const updateCategoryDto: UpdateCategoryDto = {
        id: category.id,
        name: updatedName,
      };
      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      // when
      const response = await agent
        .patch(`/categories/${category.id}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(200);

      // then
      expect(response.body.name).toBe(updatedName);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('해당 회원의 카테고리가 아니라면 401 에러를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const anotherCreateUserDto: CreateUserServiceDto = {
        email: 'test5678@gmail.com',
        password: 'test5678',
        nickname: 'tester2',
      };
      const user = await userService.save(createUserDto);
      const anotherUser = await userService.save(anotherCreateUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const anotherCreateCategoryDto: CreateCategoryDto = {
        name: 'teps',
      };
      const category = await categoryService.save(user, createCategoryDto);
      const anotherCategoryDto = await categoryService.save(
        anotherUser,
        anotherCreateCategoryDto,
      );
      const deleteCategoryId = anotherCategoryDto.id;

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      return agent
        .delete(`/categories/${deleteCategoryId}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(401);
    });

    it('해당 회원의 카테고리이면 카테고리를 삭제한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserDto);
      const createCategoryDto: CreateCategoryDto = {
        name: 'toeic',
      };
      const categoryDto = await categoryService.save(user, createCategoryDto);

      const accessTokenResponse = await agent.post('/auth/login').send({
        email: createUserDto.email,
        password: createUserDto.password,
      });

      const deleteCategoryId = categoryDto.id;
      return agent
        .delete(`/categories/${deleteCategoryId}`)
        .auth(accessTokenResponse.body.accessToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
