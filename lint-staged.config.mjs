/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*.{ts,js,mjs}": ["eslint --fix"],
  "*": [() => "bun run format"],
};

export default config;
