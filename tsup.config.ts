import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    natural: 'src/index.js',
    core: 'src/core/index.js',
    architecture: 'src/architecture/index.js',
    data: 'src/data/index.js',
    ui: 'src/ui/index.js',
    'ui-shell': 'src/ui-shell/index.js'
  },
  
  // Output formats
  format: ['cjs', 'esm', 'iife'],
  
  // Output options
  outDir: 'dist',
  clean: true,
  
  // Splitting and treeshaking
  splitting: false,
  treeshake: true,
  
  // Source maps
  sourcemap: true,
  
  // Minification (always minify IIFE format which outputs .min.js)
  minify: true,
  
  // Target
  target: 'es2015', // ES6
  
  // External dependencies
  external: ['jquery'],
  
  // Banner
  banner: {
    js: '/*! Natural-JS v2.0.0 | LGPL-2.1 | (c) Goldman Kim */'
  },
  
  // esbuild options
  esbuildOptions(options) {
    options.charset = 'utf8';
    options.legalComments = 'none';
  },
  
  // Platform
  platform: 'browser',
  
  // Watch mode
  watch: process.argv.includes('--watch'),
  
  // Output file names
  outExtension({ format }) {
    return {
      js: format === 'iife' ? '.min.js' : `.${format === 'cjs' ? 'js' : 'mjs'}`
    };
  },
  
  // Define
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
