#!/usr/bin/env node

const { version } = require('../package.json');

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

if (!semverPattern.test(version)) {
  console.error(`Invalid semantic version in package.json: ${version}`);
  process.exit(1);
}

console.log(`Semantic version is valid: ${version}`);
