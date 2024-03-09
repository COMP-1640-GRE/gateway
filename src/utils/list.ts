import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { parseFilter } from './filter-parser';
import { ListRequestDto } from './list.dto';
import { parseSort } from './sort-parser';

export async function getList<T>(
  table: string,
  dto: ListRequestDto,
  repo: Repository<T>,
) {
  const { filters, sorts, limit, offset, page } = dto;
  const queryBuilder = repo
    .createQueryBuilder(table)
    .limit(limit)
    .offset(offset);

  if (filters) {
    parseFilter(filters).forEach(({ value, field, operator }) => {
      queryBuilder.andWhere(`${table}.${field} ${operator} :value`, {
        value,
      });
    });
  }

  if (sorts) {
    parseSort(sorts).forEach(({ field, direction }) => {
      queryBuilder.addOrderBy(`${table}.${field}`, direction);
    });
  }
  try {
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      count: data.length,
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
