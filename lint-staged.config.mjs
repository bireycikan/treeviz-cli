/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*.{ts,js,mjs}": ["eslint --fix", () => "bun test"],
  "*": [() => "bun run format", "git add"],
};

export default config;
