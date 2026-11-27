import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('logs successful request with colored method, status and timing', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', originalUrl: '/api/v2/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({ success: true }),
    };

    const logSpy = jest.spyOn((interceptor as any).logger, 'log').mockImplementation();

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual({ success: true });
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/test'),
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET'),
        );
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('200'),
        );
        done();
      },
    });
  });

  it('logs failed request with colored method, status and timing on error', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', originalUrl: '/api/v2/fail' }),
        getResponse: () => ({ statusCode: 500 }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => throwError(() => ({ status: 404, message: 'Not found' })),
    };

    const warnSpy = jest.spyOn((interceptor as any).logger, 'warn').mockImplementation();

    interceptor.intercept(context, next).subscribe({
      error: () => {
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/fail'),
        );
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('POST'),
        );
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('404'),
        );
        done();
      },
    });
  });
});
