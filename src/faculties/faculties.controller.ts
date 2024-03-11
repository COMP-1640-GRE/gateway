import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateFacultyDto } from './dto/faculty.dto';
import { Faculty } from './entities/faculty.entity';
import { FacultiesService } from './faculties.service';

@ApiTags('Faculties')
@Controller('faculties')
@Crud({
  model: {
    type: Faculty,
  },
  dto: {
    create: CreateFacultyDto,
    update: CreateFacultyDto,
  },
  query: {
    limit: 100,
    join: {
      periods: {
        eager: true,
        required: false,
      },
    },
    cache: 200,
  },
  routes: {
    only: [
      'getManyBase',
      'createOneBase',
      'updateOneBase',
      'deleteOneBase',
      'getOneBase',
    ],
    getManyBase: {},
    createOneBase: {
      decorators: [Roles(UserRole.ADMINISTRATOR)],
    },
    updateOneBase: {
      decorators: [Roles(UserRole.ADMINISTRATOR)],
    },
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
export class FacultiesController implements CrudController<Faculty> {
  constructor(public service: FacultiesService) {}
}
