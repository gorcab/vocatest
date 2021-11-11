import { OmitType } from '@nestjs/mapped-types';
import { CreateCategoryRequestDto } from './CreateCategoryRequest.dto';

export class CreateCategoryServiceDto extends OmitType(
  CreateCategoryRequestDto,
  ['userId'] as const,
) {}
