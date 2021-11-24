import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersCategoryGuard } from 'src/category/guards/UsersCategory.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Page } from 'src/common/dtos/Page.dto';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { CreateVocabularyListDto } from '../dtos/CreateVocabularyList.dto';
import { DetailedVocabularyListDto } from '../dtos/DetailedVocabularyList.dto';
import { GetPaginatedVocabularyListQueryDto } from '../dtos/GetPaginatedVocabularyListQuery.dto';
import { VocabularyListDto } from '../dtos/VocabularyList.dto';
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
  ): Promise<VocabularyListDto> {
    return this.vocabularyService.save(createVocabularyListDto);
  }

  @Get()
  public async getPaginatedVocabularyList(
    @Query() { page, perPage }: GetPaginatedVocabularyListQueryDto,
    @User() user: UserEntity,
  ): Promise<Page<Array<VocabularyListDto>>> {
    return this.vocabularyService.findByUserAndPageInfo(user, page, perPage);
  }

  @Get(':id')
  public async getOne(
    @Param('id') vocabularyListId: number,
  ): Promise<DetailedVocabularyListDto> {
    return this.vocabularyService.findById(vocabularyListId);
  }
}
