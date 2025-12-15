import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'natural.es5': 'src/index.js'
  },
  
  format: ['iife'],
  outDir: 'dist',
  clean: false,
  
  sourcemap: true,
  minify: true,
  
  // ES5 target
  target: 'es5',
  
  external: ['jquery'],
  globalName: 'N',
  
  banner: {
    js: '/*! Natural-JS v2.0.0 ES5 | LGPL-2.1 | (c) Goldman Kim */'
  },
  
  esbuildOptions(options) {
    options.charset = 'utf8';
  },
  
  platform: 'browser',
  
  outExtension() {
    return {
      js: '.min.js'
    };
  }
});
