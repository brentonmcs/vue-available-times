<template>
  <div id="slider" class="slider-component">
    <!-- v-touch:start="handleTouchStart"
      v-touch:moving="handleTouchMove"
      v-touch:end="handleTouchEnd" -->
    <div
      v-for="(week, i) in weeks"
      :key="i"
      class="item"
      :style="getSlotStyle(i)"
    >
      <slot name="week" :week="week" :i="i" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { WeekModel } from './models'

const THRESHOLD_PERCENT = 15

@Component
export default class Slider extends Vue {
  @Prop() index!: number

  @Prop() disabled!: boolean

  @Prop() weeks!: WeekModel[]

  offsetX = 0

  width = 0

  startX: number | undefined

  getSlotStyle(i: number) {
    const translate = this.getTranslateValue(i)
    return {
      transform: `translateX(${translate}%)`,
      WebkitTransform: `translateX(${translate}%)`,
    }
  }

  mounted() {
    this.width = this.$el.clientWidth
  }

  getTranslateValue(i: number) {
    const { index } = this
    const percentage = this.percentage()
    if (i === index) {
      return percentage
    }
    if (i - index === 1) {
      // next week
      return 100 + percentage
    }
    if (index - i === 1) {
      // previous week
      return -100 + percentage
    }
    if (i - index > 0) {
      return 100
    }
    if (i - index < 0) {
      return -100
    }
    return undefined
  }

  percentage() {
    const { offsetX, width } = this
    return offsetX !== 0 ? (offsetX / width) * 100 : 0
  }

  handleTouchStart(event: TouchEvent) {
    if (this.disabled) {
      return
    }
    this.startX = event.touches[0].pageX
  }

  handleTouchMove(event: TouchEvent) {
    if (this.disabled) {
      return
    }
    const x = event.touches[0].pageX

    this.offsetX = x - (this.startX || 0)
  }

  handleTouchEnd() {
    if (this.disabled) {
      return
    }
    const percentage = this.percentage()
    if (Math.abs(percentage) > THRESHOLD_PERCENT) {
      this.$emit('on-slide', percentage < 0 ? 1 : -1)
    }
    this.offsetX = 0
    this.startX = undefined
  }
}
</script>

<style>
.slider-component {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slider-component .item {
  transition: transform 0.2s;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
