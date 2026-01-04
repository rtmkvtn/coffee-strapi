const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const globals = require('globals')
const prettierPlugin = require('eslint-plugin-prettier')
const eslintConfigPrettier = require('eslint-config-prettier')

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = tseslint.config(
    {
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            prettier: prettierPlugin
        }
    },
    {
        ignores: ['node_modules', 'dist', 'eslint.config.js', 'coverage', '.strapi', '**/*.example.*', 'types/generated/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2020
            },
            parserOptions: {
                project: ['tsconfig.json'],
                projectService: true,
            }
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            ...prettierPlugin.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
            'prefer-const': 'error',
            'semi': ['error', 'never'],
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
        },
    }
) 