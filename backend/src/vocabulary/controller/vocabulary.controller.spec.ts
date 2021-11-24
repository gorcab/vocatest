import { BadRequestException } from '@nestjs/common';
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
import { DetailedVocabularyListDto } from '../dtos/DetailedVocabularyList.dto';
import { UpdateVocabularyListDto } from '../dtos/UpdateVocabularyList.dto';
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
      findById: async (vocabularyListId: number) =>
        DetailedVocabularyListDto.create(vocabularyList),
      deleteById: async (vocabularyListId: number) => true,
      update: async (
        vocabularyListId: number,
        updateVocabularyListDto: UpdateVocabularyListDto,
      ) => {
        const newVocabularyList: VocabularyList = { ...vocabularyList };
        newVocabularyList.title = updateVocabularyListDto.title;
        newVocabularyList.vocabularies =
          updateVocabularyListDto.vocabularies.map((vocabulary, index) => ({
            id: index + 1,
            english: vocabulary.english,
            korean: vocabulary.korean,
            vocabularyListId: vocabularyList.id,
            examples: undefined,
            vocabularyList: vocabularyList,
          }));
        return DetailedVocabularyListDto.create(newVocabularyList);
      },
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

  it('페이지 정보를 통해 단어장을 조회하면 Page<Array<VocabularyListDto>>를 반환한다.', async () => {
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
          category: {
            id: category.id,
            name: category.name,
          },
          createdAt: vocabularyList.createdAt,
          numOfVocabularies: vocabularyList.vocabularies.length,
        },
      ],
    });
  });

  it('특정 단어장의 id를 통해 단어장을 조회하면 DetailedVocabularyListDto를 반환한다.', async () => {
    const result = await controller.getOne(vocabularyList.id);

    const examples = await vocabularies[0].examples;

    expect(result).toStrictEqual({
      id: expect.any(Number),
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

  it('단어장을 수정하면 수정된 단어장 정보를 반환한다.', async () => {
    const updateVocabularyListDto: UpdateVocabularyListDto = {
      title: 'updatedVocabularyList',
      vocabularies: vocabularyList.vocabularies.map((vocabulary) => ({
        english: vocabulary.english,
        korean: vocabulary.korean,
      })),
    };
    const updatedVocabularyList: DetailedVocabularyListDto =
      await controller.updateOne(vocabularyList.id, updateVocabularyListDto);

    expect(updatedVocabularyList).toStrictEqual({
      id: vocabularyList.id,
      title: updateVocabularyListDto.title,
      category: {
        id: category.id,
        name: category.name,
      },
      createdAt: vocabularyList.createdAt,
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
        },
      ],
    });
  });

  it('단어장 삭제에 성공하면 에러를 반환하지 않는다.', async () => {
    const result = await controller.deleteOne(vocabularyList.id);

    expect(result).toBeUndefined();
  });

  it('단어장 삭제에 실패하면 BadRequest 에러를 반환한다.', async () => {
    vocabularyService.deleteById = async () => false;

    await expect(controller.deleteOne(vocabularyList.id)).rejects.toThrow(
      new BadRequestException('단어장 삭제에 실패했습니다.'),
    );
  });
});
