import { NestFactory } from '@nestjs/core';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { bootstrap } from './main';

describe('main bootstrap', () => {
  it('bootstraps app with validation and swagger', async () => {
    const app = {
      useGlobalPipes: jest.fn(),
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
    expect(app.useGlobalPipes).toHaveBeenCalled();
    expect(createDocumentSpy).toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalledWith('docs', app, {});
    expect(app.listen).toHaveBeenCalled();

    createSpy.mockRestore();
    createDocumentSpy.mockRestore();
    setupSpy.mockRestore();
  });
});
