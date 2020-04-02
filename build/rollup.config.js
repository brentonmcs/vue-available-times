import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript'

export default {
  input: 'src/Components/AvailableTimes.vue',
  output: {
    format: 'esm',
    file: 'dist/available-times.js',
  },
  external: ['vue', 'moment', 'moment-timezone', 'vue-property-decorator'],
  plugins: [
    typescript({
      tsconfig: false,
      experimentalDecorators: true,
      module: 'es2015',
    }),
    vue({
      defaultLang: { script: 'ts' },
    }),
  ],
}
