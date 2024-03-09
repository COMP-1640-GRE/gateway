import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ListRequestDto } from 'src/utils/list.dto';
import { CreatePeriodDto } from './dto/period.dto';
import { PeriodsService } from './periods.service';

@ApiTags('Periods')
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  create(@Body() createPeriodDto: CreatePeriodDto) {
    return this.periodsService.create(createPeriodDto);
  }

  @Get()
  findAll(@Query() dto: ListRequestDto) {
    return this.periodsService.findAll(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR)
  update(@Param('id') id: string, @Body() updatePeriodDto: CreatePeriodDto) {
    return this.periodsService.update(+id, updatePeriodDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  remove(@Param('id') id: string) {
    return this.periodsService.remove(+id);
  }
}
