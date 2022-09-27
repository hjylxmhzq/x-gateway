export interface PaginationRequest<T> {
    page: number;
    pageSize: number;
    data: T;
}
