class ApiError<T = any> extends Error {
    statusCode: number;
    data: T | null;
    success: boolean;
    errors: T[];
  
    constructor(
      statusCode: number,
      message: string = "Something went wrong",
      errors: T[] = [],
      stack: string = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.data = null;
      this.success = false;
      this.errors = errors;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export { ApiError };
  