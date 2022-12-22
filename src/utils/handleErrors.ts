import { HttpException, HttpStatus } from '@nestjs/common';

export const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return String(error);
};

export const reportError = ({ message }: { message: string }) => {
    console.error(message);
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
};

export const reportToSweettracker = ({ message }: { message: string }) => {
    console.log(message);
};
