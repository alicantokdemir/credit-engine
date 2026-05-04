import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('CreditEngineController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  it('POST /customers/classify returns an enriched response', async () => {
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
      .post('/customers/classify')
      .send(payload)
      .expect(201);

    expect(response.body.cluster_id).toBe('CLUSTER_B');
    expect(response.body.job_category).toBe('MID_PROFESSIONAL');
    expect(response.body.approved_limit).toBe(20000);
    expect(response.body.monthly_income).toBe(8000);
    expect(response.body.approved).toBe(true);
  });

  it('POST /customers/classify returns 400 for invalid payloads', async () => {
    await request(app.getHttpServer())
      .post('/customers/classify')
      .send({})
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
