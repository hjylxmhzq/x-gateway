export interface Response<T> {
    status: number;
    data: T;
    message: string;
}
