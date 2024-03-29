import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountStatus, UserRole } from 'src/users/entities/user.entity';

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
  account_status: AccountStatus;
  email?: string;
  first_name?: string;
  last_name?: string;
  faculty_id?: number;
  avatar?: string;
};
