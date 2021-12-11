import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import {
  createCategory,
  createExample,
  createUser,
  createVocabulary,
  createVocabularyList,
} from 'src/common/mocks/utils';
import { User } from 'src/user/entities/user.entity';
import { Connection, DeepPartial, QueryRunner, Repository } from 'typeorm';
import { CreateVocabularyDto } from '../dtos/CreateVocabulary.dto';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
import { UpdateVocabularyListDto } from '../dtos/UpdateVocabularyList.dto';
import { Example } from '../entities/Example.entity';
import { Vocabulary } from '../entities/Vocabulary.entity';
import { VocabularyList } from '../entities/VocabularyList.entity';
import { VocabularyService } from './vocabulary.service';

describe('VocabularyService', () => {
  let service: VocabularyService;
  let connection: DeepPartial<Connection>;
  let categoryService: Partial<CategoryService>;
  let categoryRepository: DeepPartial<Repository<Category>>;
  let exampleRepository: DeepPartial<Repository<Example>>;
  let vocabularyRepository: DeepPartial<Repository<Vocabulary>>;
  let vocabularyListRepository: DeepPartial<Repository<VocabularyList>>;
  let user: User;
  let category: Category;
  let vocabularies: Array<Vocabulary>;
  let vocabularyList: VocabularyList;
  let queryRunner: DeepPartial<QueryRunner>;

  beforeEach(async () => {
    user = createUser();
    category = createCategory(user);
    vocabularies = [
      createVocabulary([createExample(), createExample()]),
      createVocabulary(),
    ];
    vocabularyList = createVocabularyList(category, vocabularies);

    categoryRepository = {
      findOne: jest.fn().mockReturnValue(category),
    };

    exampleRepository = {
      create: jest
        .fn()
        .mockReturnValueOnce(vocabularies[0].examples[0])
        .mockReturnValueOnce(vocabularies[0].examples[1]),
      save: jest.fn(),
    };

    vocabularyRepository = {
      create: jest
        .fn()
        .mockReturnValueOnce(vocabularies[0])
        .mockReturnValueOnce(vocabularies[1]),
      save: jest.fn(),
      delete: jest.fn(),
    };

    vocabularyListRepository = {
      create: jest.fn().mockReturnValueOnce(vocabularyList),
      save: jest.fn(),
      findOne: async () => vocabularyList,
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          innerJoin: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn(() =>
            Promise.resolve([[vocabularyList], 1]),
          ),
        };
      }),
    };

    queryRunner = {
      connect: jest.fn(),
      manager: {
        getRepository: jest
          .fn()
          .mockReturnValueOnce(vocabularyListRepository)
          .mockReturnValueOnce(vocabularyRepository)
          .mockReturnValueOnce(exampleRepository)
          .mockReturnValueOnce(categoryRepository),
      },
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    categoryService = {
      findById: async () => category,
    };

    connection = {
      createQueryRunner: jest.fn().mockImplementation(() => {
        return queryRunner;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyService,
        {
          provide: getConnectionToken(),
          useFactory: () => connection,
        },
        {
          provide: CategoryService,
          useValue: categoryService,
        },
        {
          provide: getRepositoryToken(VocabularyList),
          useValue: vocabularyListRepository,
        },
      ],
    }).compile();

    service = module.get<VocabularyService>(VocabularyService);
  });

  it('정의되어야 한다.', () => {
    expect(service).toBeDefined();
  });

  it('단어장을 생성하면 VocabularyListDto를 반환한다.', async () => {
    // given
    const createVocabularyDtos: Array<CreateVocabularyDto> = [];
    for (const {
      korean,
      english,
      examples,
    } of await vocabularyList.vocabularies) {
      const createVocabularyDto: CreateVocabularyDto = {
        english,
        korean,
        examples: await examples,
      };
      createVocabularyDtos.push(createVocabularyDto);
    }

    const createVocabularyListDto: CreateVocabularyListDto = {
      categoryId: category.id,
      title: vocabularyList.title,
      vocabularies: createVocabularyDtos,
    };

    // when
    const result = await service.save(createVocabularyListDto);

    // then
    expect(queryRunner.startTransaction).toBeCalled();
    expect(queryRunner.commitTransaction).toBeCalled();
    expect(result).toStrictEqual({
      id: expect.any(Number),
      title: vocabularyList.title,
      createdAt: expect.any(Date),
      category: {
        id: category.id,
        name: category.name,
      },
      numOfVocabularies: createVocabularyDtos.length,
    });
  });

  it('카테고리 내에 동일한 이름의 단어장이 있는지 여부를 반환한다.', async () => {
    const exists = false;
    vocabularyListRepository.createQueryBuilder = jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn(() => Promise.resolve(exists)),
    }));

    const result = await service.existSameTitleInCategory(1, 'DAY 10');

    expect(result).toBeFalsy();
  });

  it('카테고리 내에 있는 단어장을 VocabularyListDto로 반환한다.', async () => {
    const result = await service.findByCategoryIdAndTitle(
      category.id,
      vocabularyList.title,
    );

    expect(result).toStrictEqual({
      id: expect.any(Number),
      title: vocabularyList.title,
      category: {
        id: category.id,
        name: category.name,
      },
      createdAt: expect.any(Date),
      numOfVocabularies: vocabularyList.vocabularies.length,
    });
  });

  it('해당 사용자와 페이지 정보를 토대로 Page<Array<VocabularyListDto>>를 반환한다.', async () => {
    const page = 1,
      perPage = 10;

    const result = await service.findByUserAndPageInfo({
      user,
      page,
      perPage,
    });

    expect(result).toMatchObject({
      page,
      perPage,
      total: 1,
      totalPage: 1,
      data: [
        {
          id: expect.any(Number),
          title: vocabularyList.title,
          category: {
            id: expect.any(Number),
            name: category.name,
          },
          createdAt: expect.any(Date),
          numOfVocabularies: vocabularyList.vocabularies.length,
        },
      ],
    });
  });

  it('vocabularyListId를 토대로 DetailedVocabularyListDto를 반환한다.', async () => {
    const result = await service.findById(vocabularyList.id);

    const examples = await vocabularies[0].examples;
    expect(result).toStrictEqual({
      id: vocabularyList.id,
      title: vocabularyList.title,
      category: {
        id: category.id,
        name: category.name,
      },
      createdAt: vocabularyList.createdAt,
      vocabularies: [
        {
          id: vocabularies[0].id,
          english: vocabularies[0].english,
          korean: vocabularies[0].korean,
          examples: [
            {
              id: examples[0].id,
              sentence: examples[0].sentence,
              translation: examples[0].translation,
            },
            {
              id: examples[1].id,
              sentence: examples[1].sentence,
              translation: examples[1].translation,
            },
          ],
        },
        {
          id: vocabularies[1].id,
          english: vocabularies[1].english,
          korean: vocabularies[1].korean,
        },
      ],
    });
  });

  it('단어장을 삭제하면 Repository의 delete 메소드를 호출한다.', async () => {
    await service.deleteById(vocabularyList.id);
    expect(vocabularyListRepository.delete).toBeCalledWith(vocabularyList.id);
  });

  it('단어장을 수정하면 수정된 단어장 정보를 반환한다.', async () => {
    // given
    const updateVocabularyListDto: UpdateVocabularyListDto = {
      title: 'updatedVocabularyList',
      vocabularies: [
        {
          english: vocabularyList.vocabularies[0].english,
          korean: vocabularyList.vocabularies[0].korean,
        },
      ],
    };

    vocabularyRepository.create = jest.fn().mockReturnValueOnce({
      id: 1,
      english: updateVocabularyListDto.vocabularies[0].english,
      korean: updateVocabularyListDto.vocabularies[0].korean,
    });

    // when
    const result = await service.update(
      vocabularyList.id,
      updateVocabularyListDto,
    );

    // then
    expect(result).toStrictEqual({
      id: vocabularyList.id,
      title: updateVocabularyListDto.title,
      category: {
        id: category.id,
        name: category.name,
      },
      createdAt: vocabularyList.createdAt,
      vocabularies: [
        {
          id: 1,
          english: updateVocabularyListDto.vocabularies[0].english,
          korean: updateVocabularyListDto.vocabularies[0].korean,
        },
      ],
    });
  });
});
