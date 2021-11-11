import { OmitType } from '@nestjs/mapped-types';
import { UpdateCategoryRequestDto } from './UpdateCategoryRequest.dto';

export class UpdateCategoryServiceDto extends OmitType(
  UpdateCategoryRequestDto,
  ['userId'] as const,
) {}
