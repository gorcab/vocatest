import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { Page } from 'src/common/dtos/Page.dto';
import { Connection, Repository } from 'typeorm';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
import { DetailedVocabularyListDto } from '../dtos/DetailedVocabularyList.dto';
import { VocabularyListDto } from '../dtos/VocabularyList.dto';
import { Example } from '../entities/Example.entity';
import { Vocabulary } from '../entities/Vocabulary.entity';
import { VocabularyList } from '../entities/VocabularyList.entity';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly connection: Connection,
    private readonly categoryService: CategoryService,
    @InjectRepository(VocabularyList)
    private readonly vocabularyListRepository: Repository<VocabularyList>,
  ) {}

  public async save(
    createVocabularyListDto: CreateVocabularyListDto,
  ): Promise<VocabularyListDto> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    const categoryRepository = queryRunner.manager.getRepository(Category);
    const exampleRepository = queryRunner.manager.getRepository(Example);
    const vocabularyRepository = queryRunner.manager.getRepository(Vocabulary);
    const vocabularyListRepository =
      queryRunner.manager.getRepository(VocabularyList);

    await queryRunner.startTransaction();

    try {
      const category = await categoryRepository.findOne(
        createVocabularyListDto.categoryId,
      );

      const vocabularyList = vocabularyListRepository.create({
        category,
        title: createVocabularyListDto.title,
      });
      await vocabularyListRepository.save(vocabularyList);

      const vocabularies: Array<Vocabulary> = [];
      let vocabularyId = 1;
      for (const {
        english,
        korean,
        examples,
      } of createVocabularyListDto.vocabularies) {
        const vocabulary = vocabularyRepository.create({
          id: vocabularyId,
          english,
          korean,
          vocabularyList,
        });
        await vocabularyRepository.save(vocabulary);
        vocabularyId++;
        vocabularies.push(vocabulary);
        if (examples) {
          let exampleId = 1;
          const examplesArray: Array<Example> = [];
          for (const { sentence, translation } of examples) {
            const example = exampleRepository.create({
              id: exampleId,
              sentence,
              translation,
              vocabulary,
            });
            await exampleRepository.save(example);
            exampleId++;
            examplesArray.push(example);
          }
          vocabulary.examples = Promise.resolve(examplesArray);
        }
        vocabularyList.vocabularies = vocabularies;
      }

      await queryRunner.commitTransaction();

      return VocabularyListDto.create(
        vocabularyList,
        vocabularyList.vocabularies.length,
      );
    } catch (error) {
      console.dir(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  public async existSameTitleInCategory(
    categoryId: number,
    title: string,
  ): Promise<boolean> {
    const count = await this.vocabularyListRepository
      .createQueryBuilder('vocabularyList')
      .innerJoin(
        'vocabularyList.category',
        'category',
        'category.id = :categoryId',
        { categoryId },
      )
      .getCount();

    return !!count;
  }

  public async findByCategoryIdAndTitle(
    categoryId: number,
    title: string,
  ): Promise<VocabularyListDto> {
    const category = await this.categoryService.findById(categoryId);
    const vocabularyList = await this.vocabularyListRepository.findOne({
      relations: ['category', 'vocabularies'],
      where: {
        category,
        title,
      },
    });

    return VocabularyListDto.create(
      vocabularyList,
      vocabularyList.vocabularies.length,
    );
  }

  public async findByUserAndPageInfo(
    user,
    page,
    perPage,
  ): Promise<Page<Array<VocabularyListDto>>> {
    const [vocabularyLists, total] = await this.vocabularyListRepository
      .createQueryBuilder('vocabularyList')
      .innerJoinAndSelect('vocabularyList.vocabularies', 'vocabulary')
      .innerJoinAndSelect('vocabularyList.category', 'category')
      .innerJoin('category.user', 'user', 'user.id = :userId', {
        userId: user.id,
      })
      .orderBy('vocabularyList.createdAt', 'DESC')
      .skip(perPage * (page - 1))
      .take(perPage)
      .getManyAndCount();

    const vocabularyListDtos: Array<VocabularyListDto> = vocabularyLists.map(
      (vocabularyList) =>
        VocabularyListDto.create(
          vocabularyList,
          vocabularyList.vocabularies.length,
        ),
    );

    return new Page<Array<VocabularyListDto>>(
      vocabularyListDtos,
      page,
      total,
      perPage,
    );
  }

  public async findById(
    vocabularyListId: number,
  ): Promise<DetailedVocabularyListDto> {
    const vocabularyList = await this.vocabularyListRepository.findOne(
      vocabularyListId,
      {
        relations: ['category', 'vocabularies'],
      },
    );

    return DetailedVocabularyListDto.create(vocabularyList);
  }
}
