export default {
  input: "src/index.js",
  plugins: [
    require("rollup-plugin-json")(),
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
