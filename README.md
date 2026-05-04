# Example Credit Engine

REST API that classifies customers into risk clusters, calculates credit limits, and estimates monthly income. The implementation follows DDD and Clean Architecture with rules stored as JSON configuration.

## Architecture docs

See [docs/architecture.md](docs/architecture.md) for entity vs value object decisions and layer boundaries.

## API

- `POST /customers/classify`
- Swagger UI: `/docs`

## Project setup

```bash
npm install
```

## Run the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Run tests

```bash
# unit + integration tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Notes

- Business rules live in `src/credit-engine/infrastructure/rules/rules.json`.
