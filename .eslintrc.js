module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
  },
  extends: ['@metamask/eslint-config', '@metamask/eslint-config-nodejs'],
  overrides: [
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
    },
  ],
  ignorePatterns: ['!eslintrc.js', 'dist/', 'node_modules/'],
};
