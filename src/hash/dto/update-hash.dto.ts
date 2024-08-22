import { PartialType } from '@nestjs/mapped-types';
import { CreateHashDto } from './create-hash.dto';

export class UpdateHashDto extends PartialType(CreateHashDto) {}
