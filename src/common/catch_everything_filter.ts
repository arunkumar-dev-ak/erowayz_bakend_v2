import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { ResponseService } from 'src/response/response.service';
import { Response } from 'express';
import { WsException } from '@nestjs/websockets';

// type BadRequestResponse =
//   | {
//       statusCode?: number;
//       message: string | string[];
//       error?: string;
//     }
//   | {
//       message: string;
//       errors: ValidationError[];
//     };

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly responseService: ResponseService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    console.log(JSON.stringify(exception, null, 2));
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'An unexpected error occurred';
    let errors: unknown = null;

    if (exception instanceof PrismaClientKnownRequestError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = `Database Error: ${exception.message}`;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown database request error';
    } else if (exception instanceof PrismaClientRustPanicError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database panic error occurred';
    } else if (exception instanceof PrismaClientInitializationError) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database initialization error';
    } else if (exception instanceof PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid database request';
    } else if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      const response = exception.getResponse();

      if (typeof response === 'object') {
        message = 'message' in response ? response.message : 'Bad request';
        errors = 'errors' in response ? response.errors : null;
      } else {
        message = 'Bad request';
      }
    } else if (exception instanceof UnauthorizedException) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = exception.message || 'An error occurred';
    } else if (exception instanceof WsException) {
      // console.log(exception);
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message || 'An error occurred';
    }

    this.responseService.errorResponse({
      res,
      message,
      statusCode,
      errors,
    });
  }
}
