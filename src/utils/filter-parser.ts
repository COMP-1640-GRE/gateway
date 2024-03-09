export function parseFilter(filters: string | string[]) {
  let filtersArray: string[] = [];

  if (Array.isArray(filters)) {
    filtersArray = filters;
  } else {
    filtersArray = [filters];
  }

  return filtersArray.reduce((acc, filter) => {
    const [field, operator, value] = filter.split('||');
    if (!field || !value || !operator) {
      return acc;
    }

    if (!Object.values(FilterOperator).includes(operator as FilterOperator)) {
      return acc;
    }

    return [...acc, { field, operator: operator as FilterOperator, value }];
  }, []);
}

export enum FilterOperator {
  eq = '=',
  neq = 'neq',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  like = 'like',
}
