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

## Containerization

```bash
# build image
npm run docker:build

# run with Docker Compose (foreground)
docker compose run --service-ports --build credit-engine

# or run detached
npm run docker:up

# stop containers
npm run docker:down
```

Container defaults:
- Port: `3000`
- Health endpoint: `GET /health`
- Swagger in container: disabled by default (`ENABLE_SWAGGER=false`)

## Basic deployment scripts

- `scripts/deploy-image.sh`: builds versioned Docker images from `package.json` version and optionally pushes to a registry.

```bash
# optional push flow
DOCKER_REGISTRY=ghcr.io/your-org IMAGE_NAME=credit-engine PUSH_IMAGE=true npm run docker:build
```

## Semantic versioning

```bash
# validate package version is semver-compatible
npm run semver:check

# bump versions
npm run version:patch
npm run version:minor
npm run version:major
npm run version:prerelease
```

Git tags are created automatically on pushes to `main`/`master` using the current `package.json` version (format: `vX.Y.Z`).

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