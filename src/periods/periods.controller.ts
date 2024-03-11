import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreatePeriodDto } from './dto/period.dto';
import { Period } from './entities/period.entity';
import { PeriodsService } from './periods.service';

@ApiTags('Periods')
@Controller('periods')
@Crud({
  model: {
    type: Period,
  },
  dto: {
    create: CreatePeriodDto,
    update: CreatePeriodDto,
  },
  query: {
    limit: 100,
    join: {
      faculty: {
        eager: true,
      },
    },
    cache: 200,
  },
  routes: {
    only: ['getManyBase', 'deleteOneBase', 'getOneBase'],
    getManyBase: {},
    deleteOneBase: {
      decorators: [Roles(UserRole.ADMINISTRATOR)],
    },
    getOneBase: {},
  },
  params: {
    id: {
      type: 'number',
      primary: true,
      field: 'id',
    },
  },
})
export class PeriodsController implements CrudController<Period> {
  constructor(public service: PeriodsService) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  create(@Body() createPeriodDto: CreatePeriodDto) {
    return this.service.create(createPeriodDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR)
  update(@Param('id') id: string, @Body() updatePeriodDto: CreatePeriodDto) {
    return this.service.update(+id, updatePeriodDto);
  }
}
