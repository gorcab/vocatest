import { Test, TestingModule } from '@nestjs/testing';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { User } from 'src/user/entities/user.entity';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
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
    user = {
      id: 1,
      createdAt: new Date(),
      email: 'test1234@gmail.com',
      password: 'test1234',
      nickname: 'tester',
      categories: Promise.resolve([category]),
    };

    category = {
      id: 1,
      name: 'toeic',
      updateName: jest.fn(),
      user: user,
      vocabularyLists: Promise.resolve([vocabularyList]),
    };

    categoryService = {
      findByUserAndId: async () => category,
    };

    vocabularies = [
      {
        id: 1,
        english: 'apple',
        korean: '사과',
        vocabularyList,
        examples: Promise.resolve([]),
      },
      {
        id: 2,
        english: 'banana',
        korean: '바나나',
        vocabularyList,
        examples: Promise.resolve([]),
      },
    ];

    vocabularyList = {
      category,
      createdAt: new Date(),
      id: 1,
      title: 'DAY 1',
      vocabularies: Promise.resolve(vocabularies),
    };

    vocabularyService = {
      findByCategoryIdAndTitle: async () => vocabularyList,
      save: async () => vocabularyList,
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

  it('단어장을 생성 완료하면 VocabularyListResponseDto를 반환한다.', async () => {
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

    const vocabularyListResponseDto = await controller.create(
      createVocabularyListDto,
    );

    expect(vocabularyListResponseDto).toStrictEqual({
      id: vocabularyList.id,
      createdAt: vocabularyList.createdAt,
      title: vocabularyList.title,
      vocabularies: [
        {
          id: vocabularies[0].id,
          english: vocabularies[0].english,
          korean: vocabularies[0].korean,
        },
        {
          id: vocabularies[1].id,
          english: vocabularies[1].english,
          korean: vocabularies[1].korean,
        },
      ],
    });
  });
});
