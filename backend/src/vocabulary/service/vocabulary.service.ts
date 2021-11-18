import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CategoryService } from 'src/category/service/category.service';
import { Connection, Repository } from 'typeorm';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
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
  ): Promise<VocabularyList> {
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
      for (const {
        english,
        korean,
        examples,
      } of createVocabularyListDto.vocabularies) {
        const vocabulary = vocabularyRepository.create({
          english,
          korean,
          vocabularyList,
        });
        await vocabularyRepository.save(vocabulary);

        const examplesArray: Array<Example> = [];
        if (examples) {
          for (const { sentence, translation } of examples) {
            const example = exampleRepository.create({
              sentence,
              translation,
              vocabulary,
            });
            await exampleRepository.save(example);
            examplesArray.push(example);
          }
        }

        vocabulary.examples = Promise.resolve(examplesArray);
        vocabularies.push(vocabulary);
      }

      vocabularyList.vocabularies = Promise.resolve(vocabularies);

      await queryRunner.commitTransaction();

      return vocabularyList;
    } catch (error) {
      console.dir(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  public async findByCategoryIdAndTitle(
    categoryId: number,
    title: string,
  ): Promise<VocabularyList> {
    const category = await this.categoryService.findById(categoryId);
    const vocabularyList = await this.vocabularyListRepository.findOne({
      where: {
        category,
        title,
      },
    });

    return vocabularyList;
  }
}
