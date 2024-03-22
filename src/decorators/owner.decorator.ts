import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export const OWNER_KEY = 'owner';

export type OwnerType = {
  table: string;
  relation: string;
  self?: boolean;
  excludedRoles?: UserRole[];
};

export const Owner = (
  table: string,
  relation: string,
  self?: boolean,
  excludedRoles?: UserRole[],
) => {
  return SetMetadata(OWNER_KEY, { table, relation, self, excludedRoles });
};
