import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { UserStatus, UserRole } from 'src/users/entities/user.entity';

export const JwtPayload = createParamDecorator(
  (_: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as JwtPayloadType;
  },
);

export type JwtPayloadType = {
  id: number;
  username: string;
  role: UserRole;
  account_status: UserStatus;
  email?: string;
  first_name?: string;
  last_name?: string;
  faculty?: Faculty;
  avatar?: string;
};
