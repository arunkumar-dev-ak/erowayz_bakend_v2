import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

// ANSI escape color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function formatMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return `${colors.bold}${colors.green}${method}${colors.reset}`;
    case 'POST':
      return `${colors.bold}${colors.yellow}${method}${colors.reset}`;
    case 'PUT':
      return `${colors.bold}${colors.blue}${method}${colors.reset}`;
    case 'PATCH':
      return `${colors.bold}${colors.cyan}${method}${colors.reset}`;
    case 'DELETE':
      return `${colors.bold}${colors.red}${method}${colors.reset}`;
    default:
      return `${colors.bold}${colors.magenta}${method}${colors.reset}`;
  }
}

function formatStatus(statusCode: number): string {
  if (statusCode >= 500) {
    return `${colors.bold}${colors.red}${statusCode}${colors.reset}`;
  }
  if (statusCode >= 400) {
    return `${colors.bold}${colors.yellow}${statusCode}${colors.reset}`;
  }
  if (statusCode >= 300) {
    return `${colors.bold}${colors.cyan}${statusCode}${colors.reset}`;
  }
  if (statusCode >= 200) {
    return `${colors.bold}${colors.green}${statusCode}${colors.reset}`;
  }
  return `${statusCode}`;
}

function formatDuration(duration: number): string {
  if (duration >= 1000) {
    return `${colors.bold}${colors.red}+${duration}ms${colors.reset}`;
  }
  if (duration >= 300) {
    return `${colors.yellow}+${duration}ms${colors.reset}`;
  }
  return `${colors.dim}+${duration}ms${colors.reset}`;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;

          this.logger.log(
            `${formatMethod(method)} ${originalUrl} ${formatStatus(statusCode)} ${formatDuration(duration)}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const statusCode = err?.status || err?.statusCode || res.statusCode || 500;

          this.logger.warn(
            `${formatMethod(method)} ${originalUrl} ${formatStatus(statusCode)} ${formatDuration(duration)}`,
          );
        },
      }),
    );
  }
}
