import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountStatus, UserRole } from 'src/users/entities/user.entity';

export const JwtPayload = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as JwtPayloadType;
  },
);

export type JwtPayloadType = {
  id: number;
  username: string;
  role: UserRole;
  email?: string;
  first_name?: string;
  last_name?: string;
  account_status: AccountStatus;
};
