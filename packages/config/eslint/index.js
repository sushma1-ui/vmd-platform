// @vmd/config/eslint — shared flat ESLint config.
// Encodes LAW 2 (public API only): importing from a package's internals
// (@vmd/ui/src/...) instead of its index is a lint error.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export const base = [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      // LAW 2 — no deep imports across package boundaries.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@vmd/*/src/*', '@vmd/*/dist/*'],
              message:
                'Import from the package public API (@vmd/<pkg>), never its internals. See ARCHITECTURE.md §4.1 LAW 2.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/.next/**', '**/.astro/**', '**/.turbo/**', '**/node_modules/**'],
  },
];

export default base;
