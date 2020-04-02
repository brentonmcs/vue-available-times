import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/Components/AvailableTimes.vue',
  output: {
    format: 'esm',
    file: 'dist/available-times.js',
  },
  external: ['vue', 'moment', 'moment-timezone', 'vue-property-decorator'],
  plugins: [
    typescript({ verbosity: 2, abortOnError: false, clean: false }),
    vue({ css: true }),
  ],
}
