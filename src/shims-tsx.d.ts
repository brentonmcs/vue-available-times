/* eslint @typescript-eslint/no-unused-vars: ["off"] */
/* eslint no-unused-vars: ["off"] */
/* eslint @typescript-eslint/no-explicit-any: ["off"] */
/* eslint @typescript-eslint/no-empty-interface: ["off"] */

import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
