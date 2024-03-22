import { SetMetadata } from '@nestjs/common';

export const OWNER_KEY = 'owner';

export type OwnerType = {
  table: string;
  relation: string;
  self?: boolean;
};

export const Owner = (table: string, relation: string, self?: boolean) => {
  return SetMetadata(OWNER_KEY, { table, relation, self });
};
