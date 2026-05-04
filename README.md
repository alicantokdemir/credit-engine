# Example Credit Engine

REST API that classifies customers into risk clusters, calculates credit limits, and estimates monthly income. The implementation follows DDD and Clean Architecture with rules stored as JSON configuration.

## Architecture docs

See [docs/architecture.md](docs/architecture.md) for entity vs value object decisions and layer boundaries.

## API

- `POST /customers/classify`
- `GET /health` (liveness probe)
- `GET /metrics` (Prometheus metrics)
- Swagger UI: `/docs` (enabled by default outside production, or by `ENABLE_SWAGGER=true`)

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
- Global request logging is enabled at bootstrap.
- Global exception handling logs errors and normalizes unexpected failures.
- Graceful shutdown hooks are enabled for `SIGINT`/`SIGTERM` handling.

## Todos
- [ ] Unit & e2e Tests
- [x] Logging
- [x] Monitoring
- [x] Semantic versioning
- [ ] i18n
- [x] Containerization / Docker
- [ ] Deployment script (sst, terraform, pulumi..)
- [x] Github workflows
- [x] Graceful shutdown
- [x] Error handling
- [x] Update README file