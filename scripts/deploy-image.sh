#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

node scripts/check-semver.js >/dev/null

VERSION="$(node -p "require('./package.json').version")"
IMAGE_NAME="${IMAGE_NAME:-credit-engine}"
TAG="${TAG:-$VERSION}"
FULL_IMAGE="${IMAGE_NAME}:${TAG}"


echo "Building image ${FULL_IMAGE} and ${IMAGE_NAME}:latest"
docker build -t "$FULL_IMAGE" -t "${IMAGE_NAME}:latest" .

if [[ "${PUSH_IMAGE:-false}" == "true" ]]; then
  if [[ -z "${DOCKER_REGISTRY:-}" ]]; then
    echo "DOCKER_REGISTRY is required when PUSH_IMAGE=true"
    exit 1
  fi

  REMOTE_VERSION_IMAGE="${DOCKER_REGISTRY}/${FULL_IMAGE}"
  REMOTE_LATEST_IMAGE="${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"

  echo "Tagging images for registry ${DOCKER_REGISTRY}"
  docker tag "$FULL_IMAGE" "$REMOTE_VERSION_IMAGE"
  docker tag "${IMAGE_NAME}:latest" "$REMOTE_LATEST_IMAGE"

  echo "Pushing ${REMOTE_VERSION_IMAGE}"
  docker push "$REMOTE_VERSION_IMAGE"
  echo "Pushing ${REMOTE_LATEST_IMAGE}"
  docker push "$REMOTE_LATEST_IMAGE"
fi

echo "Image build complete: ${FULL_IMAGE}"
