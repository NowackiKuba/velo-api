export interface PageData {
  limit: number;
  offset: number;
  count: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Page<T> {
  data: T[];
  page: PageData;
}

export interface BaseFilters {
  limit?: number;
  offset?: number;
  orderBy?: 'desc' | 'asc';
  orderByField?: string;
}
