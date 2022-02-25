import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { UpdateVocabularyListDto } from '../dtos/UpdateVocabularyList.dto';
import { VocabularyListDto } from '../dtos/VocabularyList.dto';
import { SameTitleVocabularyListInCategoryGuard } from '../guards/SameTitleVocabularyListInCategory.guard';
import { UsersVocabularyListGuard } from '../guards/UsersVocabularyList.guard';
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
    @Query()
    {
      page,
      perPage,
      category: categoryId,
      title,
    }: GetPaginatedVocabularyListQueryDto,
    @User() user: UserEntity,
  ): Promise<Page<Array<VocabularyListDto>>> {
    return this.vocabularyService.findByUserAndPageInfo({
      user,
      categoryId,
      page,
      perPage,
      title,
    });
  }

  @Get(':id')
  public async getOneByIdAndUser(
    @Param('id') vocabularyListId: number,
    @User() user: UserEntity,
  ): Promise<DetailedVocabularyListDto> {
    const data = await this.vocabularyService.findByUserAndId(
      user,
      vocabularyListId,
    );
    if (!data) {
      throw new ForbiddenException();
    }
    return data;
  }

  @Put(':id')
  @UseGuards(UsersVocabularyListGuard)
  @UseGuards(UsersCategoryGuard)
  public async updateOne(
    @Param('id') vocabularyListId: number,
    @Body() updateVocabularyListDto: UpdateVocabularyListDto,
  ): Promise<DetailedVocabularyListDto> {
    return this.vocabularyService.update(
      vocabularyListId,
      updateVocabularyListDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UsersVocabularyListGuard)
  public async deleteOne(@Param('id') vocabularyListId: number): Promise<void> {
    await this.vocabularyService.deleteById(vocabularyListId);
  }
}
