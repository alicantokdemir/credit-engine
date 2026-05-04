import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { ClassifyCustomerResponseDto } from '../src/credit-engine/interfaces/http/dto/classify-customer.response.dto';

interface ValidationErrorResponse {
  statusCode: number;
  message: string[];
  error: string;
}

describe('CreditEngineController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  it('POST /v1/customers/classify returns an enriched response', async () => {
    const payload = {
      id: 'cust_300',
      name: 'Joao Lima',
      age: 35,
      score: 650,
      has_market_debt: true,
      market_debt_types: ['credit_card'],
      location: {
        city: 'Rio de Janeiro',
        state: 'RJ',
        region: 'Sudeste',
      },
      job_title: 'Engineer',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/customers/classify')
      .send(payload)
      .expect(201);

    const body = response.body as ClassifyCustomerResponseDto;

    expect(body.id).toBe(payload.id);
    expect(body.name).toBe(payload.name);
    expect(body.age).toBe(payload.age);
    expect(body.score).toBe(payload.score);
    expect(body.has_market_debt).toBe(payload.has_market_debt);
    expect(body.market_debt_types).toEqual(payload.market_debt_types);
    expect(body.location).toEqual(payload.location);
    expect(body.job_title).toBe(payload.job_title);
    expect(body.cluster_id).toBe('CLUSTER_B');
    expect(body.cluster_name).toBe('Gold');
    expect(body.job_category).toBe('MID_PROFESSIONAL');
    expect(body.job_multiplier).toBe(1);
    expect(body.penalty_factor).toBe(1);
    expect(body.base_limit).toBe(20000);
    expect(body.cap).toBe(40000);
    expect(body.approved_limit).toBe(20000);
    expect(body.monthly_income).toBe(8000);
    expect(body.approved).toBe(true);
  });

  it('POST /v1/customers/classify returns 400 with validation error shape for missing payload fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/customers/classify')
      .send({})
      .expect(400);

    const body = response.body as ValidationErrorResponse;

    expect(body.statusCode).toBe(400);
    expect(body.error).toBe('Bad Request');
    expect(body.message).toEqual(
      expect.arrayContaining([
        'id must be a string',
        'id should not be empty',
        'name must be a string',
        'name should not be empty',
      ]),
    );
  });

  it('POST /v1/customers/classify returns 400 for out-of-range score', async () => {
    const payload = {
      id: 'cust_400',
      name: 'Invalid Score',
      age: 35,
      score: 1001,
      has_market_debt: false,
      location: {
        city: 'Sao Paulo',
        state: 'SP',
        region: 'Sudeste',
      },
      job_title: 'Engineer',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/customers/classify')
      .send(payload)
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.error).toBe('Bad Request');
    expect(body.message).toEqual(
      expect.arrayContaining(['score must not be greater than 1000']),
    );
  });

  it('POST /v1/customers/classify returns 400 for unknown fields', async () => {
    const payload = {
      id: 'cust_401',
      name: 'Unknown Field',
      age: 30,
      score: 700,
      has_market_debt: false,
      location: {
        city: 'Sao Paulo',
        state: 'SP',
        region: 'Sudeste',
      },
      job_title: 'Engineer',
      unexpected_field: 'should fail',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/customers/classify')
      .send(payload)
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.error).toBe('Bad Request');
    expect(body.message).toEqual(
      expect.arrayContaining(['property unexpected_field should not exist']),
    );
  });

  afterEach(async () => {
    await app.close();
  });
});
