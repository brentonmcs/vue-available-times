import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/Components/AvailableTimes.vue',
  output: {
    exports: 'named',
    name: 'AvailableTimes',
    globals: {
      moment: 'moment',
      'moment-timezone': 'momentTimezone',
      'vue-property-decorator': 'vuePropertyDecorator',
    },
  },
  external: ['vue', 'moment', 'moment-timezone', 'vue-property-decorator'],
  plugins: [
    typescript({ verbosity: 2, abortOnError: false, clean: false }),
    vue({ css: true }),
  ],
}
