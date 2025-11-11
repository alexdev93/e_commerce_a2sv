import { ApiResponse } from "./ApiResponse";

export class PaginatedResponse extends ApiResponse {
  pageNumber: number;
  pageSize: number;
  totalSize: number;

  constructor({
    success,
    message,
    object = [],
    pageNumber = 1,
    pageSize = 10,
    totalSize = 0,
    errors = null,
  }: {
      success?: boolean;
    message: string;
    object?: Object[];
    pageNumber?: number;
    pageSize?: number;
    totalSize?: number;
    errors?: string[] | null;
  }) {
    super({ success, message, object, errors });
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalSize = totalSize;
  }
}
