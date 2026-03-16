export type DbBool = 0 | 1;

export interface Pagination {
  limit?: number;
  offset?: number;
}

export function toDbBool(value: boolean): DbBool {
  return value ? 1 : 0;
}

export function fromDbBool(value: number | null | undefined): boolean {
  return value === 1;
}

export function withPagination(query: string, pagination?: Pagination): string {
  const limit = pagination?.limit ?? 50;
  const offset = pagination?.offset ?? 0;
  return `${query} LIMIT ${limit} OFFSET ${offset}`;
}
