import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Reaction } from './entities/reaction.entity';
import { ReactionsService } from './reactions.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reactions')
@Controller('reactions')
@Crud({
  model: {
    type: Reaction,
  },
  query: {
    limit: 100,
    cache: 200,
    alwaysPaginate: true,
  },
  routes: {
    only: ['getOneBase'],
  },
  params: {
    id: {
      type: 'number',
      primary: true,
      field: 'id',
    },
  },
})
export class ReactionsController implements CrudController<Reaction> {
  constructor(public service: ReactionsService) {}
}
