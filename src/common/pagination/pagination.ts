import { PaginationResult } from './pagination.result';

export class Pagination<T> {
    public results: T[];
    public pageTotal: number;
    public total: number;

    constructor(paginationResult: PaginationResult<T>) {
        this.results = paginationResult.results;
        this.pageTotal = paginationResult.results.length;
        this.total = paginationResult.total;
    }
}