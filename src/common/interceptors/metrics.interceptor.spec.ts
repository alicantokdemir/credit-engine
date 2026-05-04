import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { performance } from 'node:perf_hooks';
import { MetricsInterceptor } from './metrics.interceptor';

type RequestShape = {
  method: string;
  route?: unknown;
  path: string;
  url: string;
};

type ResponseShape = {
  statusCode: number;
};

const createContext = (
  type: 'http' | 'rpc',
  request: RequestShape,
  response: ResponseShape,
): ExecutionContext =>
  ({
    getType: () => type,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  }) as unknown as ExecutionContext;

describe('MetricsInterceptor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('skips metrics recording for non-http contexts', async () => {
    const metricsService = {
      recordHttpRequest: jest.fn(),
    };
    const interceptor = new MetricsInterceptor(metricsService as never);
    const context = createContext(
      'rpc',
      { method: 'GET', path: '/ignored', url: '/ignored' },
      { statusCode: 200 },
    );
    const handler: CallHandler = {
      handle: () => of('ok'),
    };

    const result = await interceptor.intercept(context, handler).toPromise();

    expect(result).toBe('ok');
    expect(metricsService.recordHttpRequest).not.toHaveBeenCalled();
  });

  it('records metrics using route.path when available', async () => {
    const metricsService = {
      recordHttpRequest: jest.fn(),
    };
    const interceptor = new MetricsInterceptor(metricsService as never);
    const context = createContext(
      'http',
      {
        method: 'POST',
        route: { path: '/customers/classify' },
        path: '/fallback-path',
        url: '/fallback-url',
      },
      { statusCode: 201 },
    );
    const handler: CallHandler = {
      handle: () => of('ok'),
    };

    const nowSpy = jest
      .spyOn(performance, 'now')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(30);

    await interceptor.intercept(context, handler).toPromise();

    expect(metricsService.recordHttpRequest).toHaveBeenCalledWith(
      'POST',
      '/customers/classify',
      201,
      20,
    );

    nowSpy.mockRestore();
  });

  it('falls back to request.path or request.url when route.path is not a string', async () => {
    const metricsService = {
      recordHttpRequest: jest.fn(),
    };
    const interceptor = new MetricsInterceptor(metricsService as never);
    const contextWithPath = createContext(
      'http',
      {
        method: 'GET',
        route: { path: 123 },
        path: '/from-path',
        url: '/from-url',
      },
      { statusCode: 200 },
    );
    const contextWithUrl = createContext(
      'http',
      {
        method: 'GET',
        route: null,
        path: '',
        url: '/from-url',
      },
      { statusCode: 202 },
    );
    const handler: CallHandler = {
      handle: () => of('ok'),
    };

    jest
      .spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(150)
      .mockReturnValueOnce(200)
      .mockReturnValueOnce(230);

    await interceptor.intercept(contextWithPath, handler).toPromise();
    await interceptor.intercept(contextWithUrl, handler).toPromise();

    expect(metricsService.recordHttpRequest).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/from-path',
      200,
      50,
    );
    expect(metricsService.recordHttpRequest).toHaveBeenNthCalledWith(
      2,
      'GET',
      '/from-url',
      202,
      30,
    );
  });
});
