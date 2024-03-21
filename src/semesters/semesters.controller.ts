import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateSemesterDto } from './dto/semester.dto';
import { Semester } from './entities/semester.entity';
import { SemestersService } from './semesters.service';

@ApiTags('Semesters')
@Controller('semesters')
@Crud({
  model: {
    type: Semester,
  },
  dto: {
    create: CreateSemesterDto,
    update: CreateSemesterDto,
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
export class SemestersController implements CrudController<Semester> {
  constructor(public service: SemestersService) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  create(@Body() dto: CreateSemesterDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR)
  update(@Param('id') id: string, @Body() dto: CreateSemesterDto) {
    return this.service.update(+id, dto);
  }
}
