import terser from '@rollup/plugin-terser';

export default {
  input: 'src/global.js',
  output: {
    file: 'dist/global.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    terser({
      format: {
        comments: false
      }
    })
  ]
};