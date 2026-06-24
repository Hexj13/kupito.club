export default {
  'core/frontend/**/*.{ts,tsx}': (filenames) => [
    `cd core/frontend && npx eslint --fix ${filenames.join(' ')}`,
    `npx prettier --write --config core/frontend/.prettierrc ${filenames.join(' ')}`,
  ],
  'core/frontend/**/*.css': (filenames) => [
    `cd core/frontend && npx stylelint --fix --config config/stylelint.config.js ${filenames.join(' ')}`,
  ],
  'core/backend/src/**/*.ts': (filenames) => [
    `cd core/backend && npx eslint --fix ${filenames.join(' ')}`,
    `npx prettier --write --config core/backend/.prettierrc ${filenames.join(' ')}`,
  ],
  'locales/**/*.json': (filenames) => [
    `npx prettier --write --config core/frontend/.prettierrc ${filenames.join(' ')}`,
  ],
  'config/**/*.ts': (filenames) => [
    `npx prettier --write --config core/frontend/.prettierrc ${filenames.join(' ')}`,
  ],
  'theme/**/*.ts': (filenames) => [
    `npx prettier --write --config core/frontend/.prettierrc ${filenames.join(' ')}`,
  ],
};
