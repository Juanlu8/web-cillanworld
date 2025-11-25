import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

const nextCoreWebVitals = nextPlugin.configs['core-web-vitals'];

export default [
  { ignores: ['**/node_modules/**', '**/node_modules_old/**', '**/.next/**'] },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      ...nextCoreWebVitals.rules,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-explicit-any': [
        'error',
        { fixToUnknown: true, ignoreRestArgs: false },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
    settings: nextCoreWebVitals.settings ?? {},
  },
];
