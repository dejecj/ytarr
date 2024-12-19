type ObjectType = "channel" | "fs" | "video" | "hosts";

interface ISuccessResponse<D, P = undefined> {
    success: true;
    object: ObjectType;
    data: D;
    pagination?: P;
}

interface IErrorResponse<E> {
    success: false;
    object: ObjectType;
    error: E;
}

type IResponse<D, P = undefined, E = undefined> =
    | ISuccessResponse<D, P>
    | IErrorResponse<E>;

export class Response<D, P = undefined, E = undefined> {
    success: boolean;
    object: ObjectType;
    data?: D;
    pagination?: P;
    error?: E;

    constructor(
        object: ObjectType,
        data?: D,
        pagination?: P,
        error?: E,
    ) {
        this.object = object;
        if (error) {
            this.success = false;
            this.error = error;
            this.data = undefined;
            this.pagination = undefined;
        } else {
            this.success = true;
            this.data = data;
            this.error = undefined;
            this.pagination = pagination;
        }
    }

    toJSON(): IResponse<D, P, E> {
        if (this.success) {
            return {
                success: true,
                object: this.object,
                data: this.data!,
                ...(this.pagination !== undefined && { pagination: this.pagination })
            };
        } else {
            return {
                success: false,
                object: this.object,
                error: this.error!
            };
        }
    }
}