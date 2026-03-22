import type { GlobalErrorCode } from './GlobalErrorCode';

export interface RestResponse<T> {
  data: T;
}

export class RestError extends Error {
  errorCode: GlobalErrorCode;
  errorData?: unknown;

  constructor(errorCode: GlobalErrorCode, errorData?: unknown) {
    super();
    this.errorCode = errorCode;
    this.errorData = errorData;
  }
}
