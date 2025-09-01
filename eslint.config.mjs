import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['src/server/services/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@prisma/client',
              message:
                'Services must not import Prisma directly; use repositories for all DB access.',
            },
            {
              name: '@/lib/prisma',
              message:
                'Services must not import the Prisma client; use repositories for all DB access.',
            },
          ],
        },
      ],
    },
  },
  // Disable ESLint rules that conflict with Prettier formatting
  prettier,
];

export default eslintConfig;
