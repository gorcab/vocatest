import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { Page } from 'src/common/dtos/Page.dto';
import { User } from 'src/user/entities/user.entity';
import { Connection, Repository } from 'typeorm';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
import { DetailedVocabularyListDto } from '../dtos/DetailedVocabularyList.dto';
import { GetPaginatedVocabularyListServiceDto } from '../dtos/GetPaginatedVocabularyListService.dto';
import { UpdateVocabularyListDto } from '../dtos/UpdateVocabularyList.dto';
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

    const vocabularyListRepository =
      queryRunner.manager.getRepository(VocabularyList);
    const vocabularyRepository = queryRunner.manager.getRepository(Vocabulary);
    const exampleRepository = queryRunner.manager.getRepository(Example);
    const categoryRepository = queryRunner.manager.getRepository(Category);

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
      .where('vocabularyList.title= :title', { title })
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

  public async findByUserAndPageInfo({
    categoryId,
    user,
    page,
    perPage,
    title,
  }: GetPaginatedVocabularyListServiceDto): Promise<
    Page<Array<VocabularyListDto>>
  > {
    let query = this.vocabularyListRepository
      .createQueryBuilder('vocabularyList')
      .innerJoinAndSelect('vocabularyList.vocabularies', 'vocabulary');

    if (categoryId) {
      query = query.innerJoinAndSelect(
        'vocabularyList.category',
        'category',
        'category.id = :categoryId',
        { categoryId },
      );
    } else {
      query = query.innerJoinAndSelect('vocabularyList.category', 'category');
    }

    query = query.innerJoin('category.user', 'user', 'user.id = :userId', {
      userId: user.id,
    });

    if (title) {
      query = query.where('vocabularyList.title like :title', {
        title: `%${title}%`,
      });
    }

    const [vocabularyLists, total] = await query
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

  public async findByUserAndId(
    user: User,
    vocabularyListId: number,
  ): Promise<DetailedVocabularyListDto | null> {
    const vocabularyList = await this.vocabularyListRepository
      .createQueryBuilder('vocabularyList')
      .where('vocabularyList.id = :id', { id: vocabularyListId })
      .innerJoinAndSelect('vocabularyList.vocabularies', 'vocabularies')
      .innerJoinAndSelect('vocabularyList.category', 'category')
      .innerJoin('category.user', 'user', 'user.id = :userId', {
        userId: user.id,
      })
      .getOne();

    if (vocabularyList) {
      return DetailedVocabularyListDto.create(vocabularyList);
    }

    return null;
  }

  public async deleteById(vocabularyListId: number): Promise<void> {
    await this.vocabularyListRepository.delete(vocabularyListId);
  }

  public async update(
    id: number,
    updateVocabularyListDto: UpdateVocabularyListDto,
  ): Promise<DetailedVocabularyListDto> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    const vocabularyListRepository =
      queryRunner.manager.getRepository(VocabularyList);
    const vocabularyRepository = queryRunner.manager.getRepository(Vocabulary);
    const exampleRepository = queryRunner.manager.getRepository(Example);

    await queryRunner.startTransaction();

    try {
      vocabularyRepository.delete({ vocabularyListId: id });

      let vocabularyList = await vocabularyListRepository.findOne(id);
      vocabularyList.title = updateVocabularyListDto.title;
      await vocabularyListRepository.save(vocabularyList);

      const vocabularies: Array<Vocabulary> = [];
      let vocabularyId = 1;

      for (const {
        english,
        korean,
        examples,
      } of updateVocabularyListDto.vocabularies) {
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

      vocabularyList = await vocabularyListRepository.findOne(
        vocabularyList.id,
        {
          relations: ['category', 'vocabularies'],
        },
      );

      await queryRunner.commitTransaction();

      return DetailedVocabularyListDto.create(vocabularyList);
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
