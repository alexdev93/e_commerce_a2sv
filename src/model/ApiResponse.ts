

// ApiResponse.ts
export class ApiResponse {
  success: boolean | undefined;
  message: string | undefined;
  object: Object[] | Object | null;
  errors: string[] | null;

  constructor({
    success,
    message,
    object = null,
    errors = null,
  }: {
    success?: boolean;
    message?: string;
    object?: Object[] | Object | null;
    errors?: string[] | null;
  }) {
    this.success = success;
    this.message = message;
    this.object = object;
    this.errors = errors;
  }
}

