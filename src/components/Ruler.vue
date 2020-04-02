<template>
  <div class="component" :style="componentStyle">
    <div v-for="hour in hourList" :key="hour" class="hour" :style="hourStyle">
      <div class="inner">
        {{ hour !== '00' && hour !== '12am' ? hour : null }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HOUR_IN_PIXELS, RULER_WIDTH_IN_PIXELS } from './Constants'
import hours from './hours'

@Component
export default class Ruler extends Vue {
  @Prop() timeConvention!: string

  get hourList() {
    return hours(this.timeConvention)
  }

  // eslint-disable-next-line class-methods-use-this
  get componentStyle() {
    return { width: `${RULER_WIDTH_IN_PIXELS}px` }
  }

  // eslint-disable-next-line class-methods-use-this
  get hourStyle() {
    return { height: `${HOUR_IN_PIXELS}px` }
  }
}
</script>

<style scoped>
.component {
  flex-shrink: 0;
  position: relative;
  background-color: #fff;
}

.hour {
  text-align: right;
  padding: 2px 5px;
}

.inner {
  transform: translateY(-70%);
}
</style>
