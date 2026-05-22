import type { Page } from './types';

export type { BaseFilters, Page, PageData } from './types';

export function paginate<T>(data: T[], page: { limit: number; offset: number; totalCount: number }): Page<T> {
  const { limit, offset, totalCount } = page;
  const count = data.length;

  return {
    data,
    page: {
      limit,
      offset,
      count,
      totalCount,
      hasNextPage: offset + count < totalCount,
      hasPrevPage: offset > 0,
    },
  };
}
