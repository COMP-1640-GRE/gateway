import { Optional } from '@nestjs/common';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class ListRequestDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @Optional()
  limit = 10;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Optional()
  offset = 0;

  @ApiProperty({
    type: Array,
    required: false,
  })
  @Optional()
  sorts: string[] = [];

  @ApiProperty({
    type: Array,
    required: false,
  })
  @Optional()
  filters: string[] = [];

  get page(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }
}

export class ListResponseDto<T> {
  @ApiResponseProperty()
  data: T[];

  @ApiResponseProperty()
  total: number;

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  count: number;

  constructor(partial: Partial<ListResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
