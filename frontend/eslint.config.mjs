import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks'; // 👈 Thêm dòng này
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      // Configuration files
      'eslint.config.mjs',

      'commitlint.config.js',

      // Build outputs
      'dist/**/*',
      'build/**/*',

      // Dependencies
      'node_modules/**/*',

      // Test files (uncomment the line below if you want to ignore test files)
      // 'test/**/*',

      // Database files
      'prisma/migrations/**/*',

      // Uploads and static files
      'uploads/**/*',
      'public/**/*',
      'static/**/*',

      // Logs and temporary files
      '*.log',
      'logs/**/*',
      'tmp/**/*',
      'temp/**/*',

      // Environment and config files
      '.env*',
      'docker-compose*.yml',
      'Dockerfile*',

      // Documentation
      'docs/**/*',

      // Package manager files
      'package-lock.json',
      'yarn.lock',
      'bun.lock',

      // IDE and OS files
      '.vscode/**/*',
      '.idea/**/*',
      '.DS_Store',
      'Thumbs.db',

      // Coverage reports
      'coverage/**/*',
      '.nyc_output/**/*',
    ],
    files: ['**/*.{js,ts,jsx,tsx}'],
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
      'react-hooks': reactHooks, // 👈 Thêm plugin react-hooks
    },
    rules: {
      // Tắt hết các cảnh báo liên quan đến any/unsafe
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // Tắt console warning
      'no-console': 'off',

      // Tắt unused vars (hoặc giữ lại nếu bạn muốn cảnh báo cho biến không dùng)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Nếu bạn dùng React Hooks:
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // Tắt warning từ Prettier nếu có
      'prettier/prettier': 'off',
    },
  },
]);
