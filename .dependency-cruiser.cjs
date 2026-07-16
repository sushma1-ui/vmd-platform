/**
 * The three laws, as build failures (ARCHITECTURE.md §4.1–4.2):
 *  - packages must never import apps
 *  - the leaf `config` and `tokens`/`schema` must not import "up"
 *  - no deep imports across package boundaries
 */
module.exports = {
  forbidden: [
    {
      name: 'no-packages-to-apps',
      comment: 'A shared package must not depend on an application. Dependencies point one way.',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'config-depends-on-nothing',
      comment: 'config is the foundation; it imports no other @vmd package.',
      severity: 'error',
      from: { path: '^packages/config/' },
      to: { path: '^packages/(?!config)' },
    },
    {
      name: 'tokens-only-config',
      comment: 'tokens may depend only on config.',
      severity: 'error',
      from: { path: '^packages/tokens/' },
      to: { path: '^packages/(?!tokens|config)' },
    },
    {
      name: 'schema-only-config',
      comment: 'schema may depend only on config.',
      severity: 'error',
      from: { path: '^packages/schema/' },
      to: { path: '^packages/(?!schema|config)' },
    },
    {
      name: 'ui-only-tokens',
      comment: 'ui composes tokens; it must not reach into other feature packages.',
      severity: 'error',
      from: { path: '^packages/ui/' },
      to: { path: '^packages/(?!ui|tokens|config)' },
    },
    {
      name: 'no-circular',
      comment: 'No cyclic dependencies.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'packages/config/tsconfig.base.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.astro', '.js', '.mjs'] },
  },
};
