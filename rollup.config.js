export default {
  input: "src/index.js",
  plugins: [
    require("rollup-plugin-json")(),
    require("rollup-plugin-nodent")({
      noRuntime: true,
      wrapAwait: true,
      promises: true,
      es6target: true
    }),
    require("rollup-plugin-buble")()
  ],
  output: [
    {
      file: "dist/dav.js",
      format: "cjs",
      sourcemap: true
    },
    {
      file: "dist/dav.es.js",
      format: "es",
      sourcemap: true
    }
  ]
}
