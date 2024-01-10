module.exports = {
  // ALL
  'package.json': 'prettier-package-json --write',

  // FRONTEND

  'src/**/*.{js,jsx,json,md,ts,tsx,graphql}':
    'prettier --ignore-unknown --write .',
  'src/**/*.{js,jsx,ts,tsx}': 'eslint --fix',
  'src/**/*.{ts,tsx}': () => 'tsc -p tsconfig.json --noEmit',
}
