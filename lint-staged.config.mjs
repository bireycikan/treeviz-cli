/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*": [() => "bun run format"],
};

export default config;
