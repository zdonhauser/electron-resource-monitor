import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      prettier
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        HTMLDivElement: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React specific
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript instead
      'react/display-name': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import/Export
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never'
      }],

      // General
      'no-console': 'warn',
      'no-unused-vars': 'off', // Handled by TypeScript
      'prefer-const': 'error',
      'no-var': 'error',

      // Prettier
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['src/main/**/*.ts'],
    rules: {
      'no-console': 'off' // Allow console in main process
    }
  },
  {
    ignores: [
      'dist/**/*',
      'dist-electron/**/*',
      'node_modules/**/*',
      'out/**/*',
      '*.config.js',
      '*.config.ts'
    ]
  }
]