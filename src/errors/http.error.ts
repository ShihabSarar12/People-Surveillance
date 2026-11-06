class HttpError extends Error {
    public readonly statusCode: number;
    public readonly success: boolean;

    constructor(statusCode: number, message: string, success = false) {
        super(message);
        this.statusCode = statusCode;
        this.success = success;
        this.name = 'HttpError';
        Error.captureStackTrace?.(this, HttpError);
    }
}

export default HttpError;
