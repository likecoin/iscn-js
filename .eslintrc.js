module.exports = {
  root: true,
  ignorePatterns: ['temp.js', '**/vendor/*.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'import/extensions': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
