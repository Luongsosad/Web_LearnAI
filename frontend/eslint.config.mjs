// eslint.config.mjs
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';

export default defineConfig([
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'public/**/*',
      'static/**/*',
      'uploads/**/*',
      'coverage/**/*',
      'prisma/migrations/**/*',
      'logs/**/*',
      'tmp/**/*',
      'temp/**/*',
      '.vscode/**/*',
      '.idea/**/*',
      '.env*',
      '*.log',
      'Dockerfile*',
      'docker-compose*.yml',
      'package-lock.json',
      'yarn.lock',
      'bun.lock',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url),
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
      'react-hooks': reactHooks,
      react,
    },
    rules: {
      // Tắt tất cả rule warn/any
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // Tắt warning console
      'no-console': 'off',

      // Tắt unused vars hoặc điều chỉnh để bỏ qua biến bắt đầu bằng _
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // React hooks rules
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // Tắt prettier
      'prettier/prettier': 'off',
    },
  },
]);
