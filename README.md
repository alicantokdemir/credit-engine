# Example Credit Engine

REST API that classifies customers into risk clusters, calculates credit limits, and estimates monthly income. The implementation follows DDD and Clean Architecture with rules stored as JSON configuration.

## Architecture docs

Quick reference for layer boundaries and domain modeling decisions.

See [docs/architecture.md](docs/architecture.md) for entity vs value object decisions and layer boundaries.

## API

The API is stateless: each request is classified independently.

- `POST /v1/customers/classify`
- `GET /v1/health` (liveness probe)
- `GET /v1/metrics` (Prometheus metrics)
- Swagger UI: `/docs` (enabled by default outside production, or by `ENABLE_SWAGGER=true`)

## Project setup

Install dependencies once before running build, test, or runtime commands.

```bash
npm install
```

## Run the app

Use these commands for local development and production-like execution.

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Containerization

Run the same build artifact in containers for local and CI consistency.

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

These scripts package the app as a versioned image and optionally publish it.

- `scripts/deploy-image.sh`: builds versioned Docker images from `package.json` version and optionally pushes to a registry.

```bash
# optional push flow
DOCKER_REGISTRY=ghcr.io/your-org IMAGE_NAME=credit-engine PUSH_IMAGE=true npm run docker:build
```

## Semantic versioning

Version commands bump `package.json`; tags are created automatically in GitHub Actions on push.

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

Run all quality checks from one command, or execute e2e/coverage separately.

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
- API versioning is enabled with URI strategy and default version `v1`.
- Global request logging is enabled at bootstrap.
- Global exception handling logs errors and normalizes unexpected failures.
- Graceful shutdown hooks are enabled for `SIGINT`/`SIGTERM` handling.
- Future improvement: introduce a Money value object (or dedicated money library) for stricter currency precision and safer financial calculations.

## Future improvements

- Add optional caching for repeated classifications (keyed by request fingerprint + active rules version) to reduce repeated calculations.
- Add explicit rules versioning (version id, draft/published state, rollback) so rule updates are auditable and safely reversible.
- Expand API versioning policy for `v2+` (deprecation windows, migration guides, and backward-compatibility guarantees).
