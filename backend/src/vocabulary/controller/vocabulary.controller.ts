import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersCategoryGuard } from 'src/category/guards/UsersCategory.guard';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
import { ExampleResponse } from '../dtos/ExampleResponse.dto';
import { VocabularyListResponseDto } from '../dtos/VocabularyListResponse.dto';
import { VocabularyResponse } from '../dtos/VocabularyResponse.dto';
import { SameTitleVocabularyListInCategoryGuard } from '../guards/SameTitleVocabularyListInCategory.guard';
import { VocabularyService } from '../service/vocabulary.service';

@UseGuards(JwtAuthGuard)
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @UseGuards(SameTitleVocabularyListInCategoryGuard)
  @UseGuards(UsersCategoryGuard)
  public async create(
    @Body() createVocabularyListDto: CreateVocabularyListDto,
  ) {
    const { id, createdAt, title, vocabularies } =
      await this.vocabularyService.save(createVocabularyListDto);

    const vocabulariesResponse: Array<VocabularyResponse> = [];
    for (const { id, english, korean, examples } of await vocabularies) {
      const examplesResponse: Array<ExampleResponse> = [];
      for (const { id, translation, sentence } of await examples) {
        const exampleResponse: ExampleResponse = {
          id,
          sentence,
          translation,
        };
        examplesResponse.push(exampleResponse);
      }

      const vocabularyResponse: VocabularyResponse = {
        id,
        english,
        korean,
      };
      if (examplesResponse.length > 0) {
        vocabularyResponse.examples = examplesResponse;
      }
      vocabulariesResponse.push(vocabularyResponse);
    }

    const vocabularyListResponseDto: VocabularyListResponseDto = {
      id,
      createdAt,
      title,
      vocabularies: vocabulariesResponse,
    };

    return vocabularyListResponseDto;
  }
}
