import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';

type RequestShape = {
  method?: string;
  url?: string;
};

const createHost = (request?: RequestShape): ArgumentsHost =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ArgumentsHost;

describe('GlobalExceptionFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs warning and delegates known client http exceptions', () => {
    const adapterHost = { httpAdapter: {} } as HttpAdapterHost;
    const filter = new GlobalExceptionFilter(adapterHost);
    const host = createHost({ method: 'POST', url: '/customers/classify' });
    const exception = new HttpException(
      'invalid payload',
      HttpStatus.BAD_REQUEST,
    );

    const baseCatchSpy = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith('HTTP 400 POST /customers/classify');
    expect(baseCatchSpy).toHaveBeenCalledWith(exception, host);
  });

  it('logs error and delegates known server http exceptions', () => {
    const adapterHost = { httpAdapter: {} } as HttpAdapterHost;
    const filter = new GlobalExceptionFilter(adapterHost);
    const host = createHost({ method: 'GET', url: '/health' });
    const exception = new HttpException(
      'boom',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const baseCatchSpy = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    filter.catch(exception, host);

    expect(errorSpy).toHaveBeenCalledWith(
      'HTTP 500 GET /health',
      expect.any(String),
    );
    expect(baseCatchSpy).toHaveBeenCalledWith(exception, host);
  });

  it('wraps unknown exceptions into internal server error response', () => {
    const adapterHost = { httpAdapter: {} } as HttpAdapterHost;
    const filter = new GlobalExceptionFilter(adapterHost);
    const host = createHost();
    const exception = new Error('unexpected');

    const baseCatchSpy = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    filter.catch(exception, host);

    expect(errorSpy).toHaveBeenCalledWith(
      'HTTP 500 UNKNOWN UNKNOWN',
      expect.any(String),
    );
    expect(baseCatchSpy).toHaveBeenCalledTimes(1);

    const [internalException, internalHost] = baseCatchSpy.mock.calls[0] as [
      HttpException,
      ArgumentsHost,
    ];
    expect(internalHost).toBe(host);
    expect(internalException.getStatus()).toBe(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(internalException.getResponse()).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Internal server error',
        path: 'UNKNOWN',
      }),
    );
  });
});
