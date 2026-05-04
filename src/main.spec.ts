import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { bootstrap, startApplication } from './main';

type Middleware = (
  request: { method: string; originalUrl: string },
  response: {
    statusCode: number;
    on: (event: string, callback: () => void) => void;
  },
  next: () => void,
) => void;

describe('main bootstrap', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.ENABLE_SWAGGER;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bootstraps app with validation and swagger', async () => {
    let middleware: Middleware | undefined;
    const app = {
      enableShutdownHooks: jest.fn(),
      enableVersioning: jest.fn(),
      use: jest.fn((handler: unknown) => {
        middleware = handler as Middleware;
      }),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      get: jest.fn().mockReturnValue({ httpAdapter: {} }),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    const createSpy = jest
      .spyOn(NestFactory, 'create')
      .mockResolvedValue(app as never);
    const createDocumentSpy = jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({} as OpenAPIObject);
    const setupSpy = jest.spyOn(SwaggerModule, 'setup').mockReturnValue();

    await bootstrap();

    expect(createSpy).toHaveBeenCalled();
    expect(app.enableShutdownHooks).toHaveBeenCalled();
    expect(app.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    expect(app.use).toHaveBeenCalled();
    expect(app.useGlobalPipes).toHaveBeenCalled();
    expect(app.useGlobalFilters).toHaveBeenCalled();
    expect(createDocumentSpy).toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalledWith('docs', app, {});
    expect(app.listen).toHaveBeenCalled();

    expect(middleware).toBeDefined();
  });

  it('logs request outcomes for success, client error, and server error', async () => {
    let middleware: Middleware | undefined;
    let finishCallback: (() => void) | undefined;
    const app = {
      enableShutdownHooks: jest.fn(),
      enableVersioning: jest.fn(),
      use: jest.fn((handler: unknown) => {
        middleware = handler as Middleware;
      }),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      get: jest.fn().mockReturnValue({ httpAdapter: {} }),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(NestFactory, 'create').mockResolvedValue(app as never);
    jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({} as OpenAPIObject);
    jest.spyOn(SwaggerModule, 'setup').mockReturnValue();

    const logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await bootstrap();

    const request = { method: 'GET', originalUrl: '/customers/classify' };
    const next = jest.fn();

    const response200 = {
      statusCode: 200,
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      }),
    };

    middleware?.(request, response200, next);
    finishCallback?.();

    const response400 = {
      statusCode: 400,
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      }),
    };

    middleware?.(request, response400, next);
    finishCallback?.();

    const response500 = {
      statusCode: 500,
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      }),
    };

    middleware?.(request, response500, next);
    finishCallback?.();

    expect(next).toHaveBeenCalledTimes(3);
    expect(
      logSpy.mock.calls.some(
        ([message]) =>
          typeof message === 'string' &&
          message.includes('GET /customers/classify 200'),
      ),
    ).toBe(true);
    expect(
      warnSpy.mock.calls.some(
        ([message]) =>
          typeof message === 'string' &&
          message.includes('GET /customers/classify 400'),
      ),
    ).toBe(true);
    expect(
      errorSpy.mock.calls.some(
        ([message]) =>
          typeof message === 'string' &&
          message.includes('GET /customers/classify 500'),
      ),
    ).toBe(true);
  });

  it('skips swagger setup in production when not explicitly enabled', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_SWAGGER;

    const app = {
      enableShutdownHooks: jest.fn(),
      enableVersioning: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      get: jest.fn().mockReturnValue({ httpAdapter: {} }),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(NestFactory, 'create').mockResolvedValue(app as never);
    const createDocumentSpy = jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({} as OpenAPIObject);
    const setupSpy = jest.spyOn(SwaggerModule, 'setup').mockReturnValue();

    await bootstrap();

    expect(createDocumentSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();
  });

  it('starts app when NODE_ENV is not test', () => {
    const start = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);

    startApplication('development', start);

    expect(start).toHaveBeenCalledTimes(1);
  });

  it('does not start app when NODE_ENV is test', () => {
    const start = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);

    startApplication('test', start);

    expect(start).not.toHaveBeenCalled();
  });

  it('handles startup failure and sets process exit code', async () => {
    const loggerSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    const start = jest
      .fn<Promise<void>, []>()
      .mockRejectedValue(new Error('boom'));

    startApplication('development', start);
    await Promise.resolve();

    expect(process.exitCode).toBe(1);
    process.exitCode = undefined;

    loggerSpy.mockRestore();
  });

  it('handles non-error startup failure and sets process exit code', async () => {
    const loggerSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    const start = jest.fn<Promise<void>, []>().mockRejectedValue('boom');

    startApplication('development', start);
    await Promise.resolve();

    expect(process.exitCode).toBe(1);
    process.exitCode = undefined;

    loggerSpy.mockRestore();
  });
});
