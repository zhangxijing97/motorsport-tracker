import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { UpstreamError } from '../data-providers/upstream-http';
@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiErrorFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const upstream = error instanceof UpstreamError;
    const status = upstream
      ? error.status === 429 || error.code === 'ACCESS_RESTRICTED'
        ? 503
        : 502
      : error instanceof HttpException
        ? error.getStatus()
        : 500;
    const codes: Record<number, string> = {
      400: 'INVALID_REQUEST',
      404: 'NOT_FOUND',
      422: 'UNSUPPORTED',
      500: 'INTERNAL_ERROR',
    };
    const code = upstream ? error.code : (codes[status] ?? 'REQUEST_FAILED');
    const message = upstream
      ? 'Racing data is temporarily unavailable.'
      : error instanceof HttpException
        ? error.message
        : 'Internal server error';
    if (status === 500)
      this.logger.error(
        error instanceof Error ? error.stack : 'Unknown internal error',
      );
    if (upstream && error.retryAfterSeconds)
      response.setHeader('Retry-After', String(error.retryAfterSeconds));
    response.status(status).json({
      error: { code, message },
      meta: {
        availability: upstream
          ? error.code === 'ACCESS_RESTRICTED'
            ? 'access_restricted'
            : 'upstream_error'
          : status === 422
            ? 'unsupported'
            : 'unknown',
      },
    });
  }
}
