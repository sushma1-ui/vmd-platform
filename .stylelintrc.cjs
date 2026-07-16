// Enforces "no duplicated styles": a literal hex or px means someone bypassed the
// token system. Use var(--token) instead. The gold-never-text guarantee is enforced
// upstream at token-build time; this rule stops raw values leaking into CSS.
module.exports = {
  rules: {
    'declaration-property-value-disallowed-list': {
      '/color|background|border|fill|stroke|shadow/': [
        '/#[0-9a-fA-F]{3,8}/',
        '/rgb|hsl/',
      ],
      // Spacing must ride the 8px grid via tokens. Physical hairlines
      // (border/outline) and logical sizing (inline-size/block-size) are exempt.
      '/^(margin|padding|gap|inset|top|right|bottom|left)/': ['/[0-9]+px/'],
    },
  },
  ignoreFiles: [
    '**/dist/**',
    'packages/tokens/**', // the token source is where raw values are ALLOWED to exist
    '**/node_modules/**',
  ],
};
