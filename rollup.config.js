const base = {
  plugins: [
    require('rollup-plugin-json')(),
    require('rollup-plugin-nodent')({
      noRuntime: true,
      wrapAwait: true,
      promises: true,
      es6target: true
    }),
    require('rollup-plugin-buble')()
  ],
};

const dist = {
  ...base,
  input: 'src/index.js',
  output: [
    {
      file: 'dist/dav.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/dav.es.js',
      format: 'es',
      sourcemap: true
    }
  ]
};

const test = {
  ...base,
  input: 'src/test.js',
  output: {
    file: 'dist_test/dav.js',
    format: 'cjs',
    sourcemap: true
  }
};

export default [dist, test];
