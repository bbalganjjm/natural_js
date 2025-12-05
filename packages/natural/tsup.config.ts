import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  target: 'es2020',
  outDir: 'dist',
  tsconfig: 'tsconfig.build.json',
  external: [
    '@natural-js/shared',
    '@natural-js/core',
    '@natural-js/architecture',
    '@natural-js/data',
    '@natural-js/ui',
    '@natural-js/ui-shell',
    '@natural-js/template',
    '@natural-js/code',
  ],
});
