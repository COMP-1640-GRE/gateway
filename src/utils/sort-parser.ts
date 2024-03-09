export function parseSort(sorts: string | string[]) {
  let sortsArray: string[] = [];

  if (Array.isArray(sorts)) {
    sortsArray = sorts;
  } else {
    sortsArray = [sorts];
  }

  return sortsArray.reduce((acc, sort) => {
    const [field, direction] = sort.split('||');
    if (!field || !direction) {
      return acc;
    }

    if (!Object.values(['ASC', 'DESC']).includes(direction)) {
      return acc;
    }

    return [...acc, { field, direction: direction as 'ASC' | 'DESC' }];
  }, []);
}
