#!/usr/bin/env node

const { execSync } = require('node:child_process');

const getStagedFiles = () => {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
  });

  return output
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const isSourceFile = (path) =>
  path.startsWith('src/') &&
  path.endsWith('.ts') &&
  !path.endsWith('.spec.ts') &&
  !path.endsWith('.dto.ts') &&
  !path.endsWith('.module.ts') &&
  !path.endsWith('.enum.ts');

const isTestFile = (path) =>
  path.endsWith('.spec.ts') || path.includes('/test/') || path.startsWith('test/');

try {
  const stagedFiles = getStagedFiles();

  const changedSourceFiles = stagedFiles.filter(isSourceFile);
  const changedTestFiles = stagedFiles.filter(isTestFile);

  if (changedSourceFiles.length > 0 && changedTestFiles.length === 0) {
    console.error('Commit blocked: source changes detected without staged tests.');
    console.error('Please add/update tests and stage them before committing.');
    console.error('Changed source files:');
    changedSourceFiles.forEach((file) => console.error(`- ${file}`));
    process.exit(1);
  }

  console.log('Changed files include matching tests.');
} catch (error) {
  console.error('Unable to validate staged files for test coverage.');
  console.error(error.message);
  process.exit(1);
}
