import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { OWNER_KEY, OwnerType } from 'src/decorators/owner.decorator';
import { User } from 'src/users/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectDataSource() private manager: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const owner = this.reflector.get<OwnerType>(
      OWNER_KEY,
      context.getHandler(),
    );

    if (!owner?.table || !owner?.relation) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // get id from request
    const id = Number(request.params.id) || Number(request.query.id);

    if (!user?.id || !id) {
      throw new NotFoundException('User id or entity id not found');
    }
    const { relation, table, self, excludedRoles } = owner;

    if (excludedRoles?.includes(user.role)) {
      return true;
    }

    const repository = this.manager.getRepository(table);

    const entity = await repository
      .createQueryBuilder('entity')
      .where(`entity.id = :id`, { id })
      .select(`entity.${relation}`, 'owner')
      .getRawOne();

    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    if (self) {
      if (entity.owner === user.id) {
        throw new ForbiddenException(
          `User with id ${user.id} is not allowed to access this resource`,
        );
      } else {
        return true;
      }
    }

    if (entity.owner !== user.id) {
      throw new ForbiddenException(
        `User with id ${user.id} is not allowed to access this resource`,
      );
    } else {
      return true;
    }
  }
}
