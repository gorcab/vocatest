import { Test, TestingModule } from '@nestjs/testing';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { Page } from 'src/common/dtos/Page.dto';
import {
  createCategory,
  createExample,
  createUser,
  createVocabulary,
  createVocabularyList,
} from 'src/common/mocks/utils';
import { User } from 'src/user/entities/user.entity';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
import { VocabularyListDto } from '../dtos/VocabularyList.dto';
import { Vocabulary } from '../entities/Vocabulary.entity';
import { VocabularyList } from '../entities/VocabularyList.entity';
import { VocabularyService } from '../service/vocabulary.service';
import { VocabularyController } from './vocabulary.controller';

describe('VocabularyController', () => {
  let controller: VocabularyController;
  let vocabularyService: Partial<VocabularyService>;
  let categoryService: Partial<CategoryService>;
  let user: User;
  let category: Category;
  let vocabularies: Array<Vocabulary>;
  let vocabularyList: VocabularyList;

  beforeEach(async () => {
    user = createUser();
    category = createCategory(user);
    categoryService = {
      findByUserAndId: async () => category,
    };
    vocabularies = [
      createVocabulary([createExample(), createExample()]),
      createVocabulary(),
    ];
    vocabularyList = createVocabularyList(category, vocabularies);

    vocabularyService = {
      findByCategoryIdAndTitle: async () =>
        Promise.resolve(
          VocabularyListDto.create(
            vocabularyList,
            vocabularyList.vocabularies.length,
          ),
        ),
      findByUserAndPageInfo: async (
        user: User,
        page: number,
        perPage: number,
      ) =>
        new Page(
          Array(VocabularyListDto.create(vocabularyList, vocabularies.length)),
          page,
          1,
          perPage,
        ),
      save: async () =>
        VocabularyListDto.create(vocabularyList, vocabularies.length),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabularyController],
      providers: [
        {
          provide: VocabularyService,
          useValue: vocabularyService,
        },
        {
          provide: CategoryService,
          useValue: categoryService,
        },
      ],
    }).compile();

    controller = module.get<VocabularyController>(VocabularyController);
  });

  it('정의되어야 한다.', () => {
    expect(controller).toBeDefined();
  });

  it('단어장을 생성 완료하면 VocabularyListDto를 반환한다.', async () => {
    // given
    const createVocabularyListDto: CreateVocabularyListDto = {
      categoryId: category.id,
      title: vocabularyList.title,
      vocabularies: [
        {
          english: vocabularies[0].english,
          korean: vocabularies[0].korean,
        },
        {
          english: vocabularies[1].english,
          korean: vocabularies[1].korean,
        },
      ],
    };

    // when
    const result = await controller.create(createVocabularyListDto);

    // then
    expect(result).toStrictEqual({
      id: vocabularyList.id,
      createdAt: vocabularyList.createdAt,
      category: {
        id: category.id,
        name: category.name,
      },
      title: vocabularyList.title,
      numOfVocabularies: createVocabularyListDto.vocabularies.length,
    });
  });

  it('단어장을 조회하면 Page<Array<VocabularyListDto>>를 반환한다.', async () => {
    const page = 1;
    const perPage = 10;

    const result = await controller.getPaginatedVocabularyList(
      {
        page,
        perPage,
      },
      user,
    );

    expect(result).toMatchObject({
      page,
      perPage,
      total: 1,
      totalPage: 1,
      data: [
        {
          id: expect.any(Number),
          title: vocabularyList.title,
          category: expect.any(Object),
          createdAt: expect.any(Date),
          numOfVocabularies: vocabularyList.vocabularies.length,
        },
      ],
    });
  });
});
