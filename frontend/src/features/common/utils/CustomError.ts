type CustomErrorState = {
  statusCode: number;
  message: string;
  onReset?: () => void;
};

export class CustomError extends Error {
  public statusCode: number;
  public onReset?: () => void;
  constructor(errorState: CustomErrorState) {
    super(errorState.message);
    const { statusCode, onReset } = errorState;
    this.statusCode = statusCode;
    if (onReset) {
      this.onReset = onReset;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
