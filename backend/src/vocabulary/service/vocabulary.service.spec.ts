import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import {
  createCategory,
  createExample,
  createVocabulary,
  createVocabularyList,
} from 'src/common/mocks/utils';
import { Connection, DeepPartial, Repository } from 'typeorm';
import { CreateVocabularyDto } from '../dtos/CreateVocabulary.dto';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
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
  let category: Category;
  let vocabularies: Array<Vocabulary>;
  let vocabularyList: VocabularyList;

  beforeEach(async () => {
    category = createCategory();
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
        .mockReturnValue(vocabularies[1]),
      save: jest.fn(),
    };

    vocabularyListRepository = {
      create: jest.fn().mockReturnValueOnce(vocabularyList),
      save: jest.fn(),
      findOne: async () => vocabularyList,
    };

    categoryService = {
      findById: async () => category,
    };

    connection = {
      createQueryRunner: jest.fn().mockImplementation(() => {
        return {
          connect: jest.fn(),
          manager: {
            getRepository: jest
              .fn()
              .mockReturnValueOnce(categoryRepository)
              .mockReturnValueOnce(exampleRepository)
              .mockReturnValueOnce(vocabularyRepository)
              .mockReturnValueOnce(vocabularyListRepository),
          },
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        };
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

  it('영단어장을 생성하면 VocabularyList를 반환한다.', async () => {
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
    expect(result.title).toBe(createVocabularyListDto.title);
    expect(await result.vocabularies).toHaveLength(vocabularies.length);
  });

  it('카테고리 내에 있는 특정 이름의 단어장을 반환한다.', async () => {
    const result = await service.findByCategoryIdAndTitle(
      category.id,
      vocabularyList.title,
    );

    expect(result.id).toBe(vocabularyList.id);
    expect(result.title).toBe(vocabularyList.title);
    expect(await result.vocabularies).toMatchObject([
      { ...vocabularyList.vocabularies[0] },
      { ...vocabularyList.vocabularies[1] },
    ]);
  });
});
