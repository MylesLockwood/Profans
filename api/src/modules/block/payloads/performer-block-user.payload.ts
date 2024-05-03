import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class PerformerBlockUserPayload {
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsOptional()
  target: string;

  @IsString()
  @IsOptional()
  reason: string;
}

export class GetBlockListUserPayload extends SearchRequest {}
