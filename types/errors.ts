export const DEFAULT_ERROR = 'We were unable to perform this action. Please try again later.';

export interface BaseError {
    error: boolean;
    message: string;
    stack?: string;
}

export class ApiError<T extends BaseError> {
    error: boolean;
    message: string;
    stack?: string;
    data: Partial<T>;

    constructor(error: Error | string, data?: Partial<T>) {
        this.error = true;
        
        if (error instanceof Error) {
            this.message = error.message;
            this.stack = error.stack;
        } else {
            this.message = error;
        }

        this.data = data || {};
    }

    toJSON(): T {
        return {
            error: this.error,
            message: this.message,
            stack: this.stack,
            ...this.data
        } as T;
    }
}