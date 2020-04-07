<template>
  <div
    :class="componentClass"
    :style="componentStyle"
    @mousedown="handleMouseDown"
    @click="handleComponentDelete"
  >
    <div :class="title" :style="titleStyle">
      <span v-if="title">
        {{ title }}
        <br />
      </span>
      {{ timespan }}
    </div>
    <div v-if="!frozen && !touchToDelete">
      <div class="handle" @mousedown="handleResizerMouseDown">
        ...
      </div>
      <button class="delete" @click="handleDelete" @mousedown.prevent>
        ×
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import momentTimezone from 'moment-timezone'

import { Vue, Component, Prop } from 'vue-property-decorator'
import { MINUTE_IN_PIXELS } from './Constants'
import positionInDay from './positionInDay'

const BOTTOM_GAP = MINUTE_IN_PIXELS * 10

@Component
export default class TimeSlot extends Vue {
  creationTime = new Date().getTime()

  @Prop() date!: Date

  @Prop() start!: Date

  @Prop() end!: Date

  @Prop() title!: string

  @Prop() timeZone!: string

  @Prop() timeConvention!: string

  @Prop() frozen!: boolean

  @Prop() active!: boolean

  @Prop() width!: number

  @Prop() offset!: number

  @Prop({ default: false }) touchToDelete!: boolean

  handleDelete(event: Event) {
    console.log('timeslot - handleDelete')
    if (new Date().getTime() - this.creationTime < 500) {
      // Just created. Ignore this event, as it's likely coming from the same
      // click event that created it.
      return
    }
    event.stopPropagation()
    this.$emit('on-delete', { end: this.end, start: this.start }, event)
  }

  handleResizerMouseDown(event: Event) {
    console.log('timeslot - handleResizerMouseDown')
    event.stopPropagation()
    this.$emit(
      'on-size-change-start',
      { end: this.end, start: this.start },
      event
    )
  }

  handleMouseDown(event: Event) {
    if (this.frozen || this.touchToDelete === false) {
      event.stopPropagation()
      this.$emit('on-move-start', { end: this.end, start: this.start }, event)
    }
  }

  handleComponentDelete(event: Event) {
    if (this.frozen || !this.touchToDelete) {
      return
    }
    this.handleDelete(event)
  }

  get componentStyle() {
    const top = positionInDay(this.date, this.start, this.timeZone)
    const bottom = positionInDay(this.date, this.end, this.timeZone)

    const height = Math.max(bottom - top - (this.frozen ? BOTTOM_GAP : 0), 1)

    if (
      typeof this.width !== 'undefined' &&
      typeof this.offset !== 'undefined'
    ) {
      return {
        top: `${top}px`,
        height: `${height}px`,
        width: `calc(${this.width * 100}% - 5px)`,
        left: `${this.offset * 100}%`,
      }
    }
    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  get componentClass(): string[] {
    const result = ['timeslot-component']
    if (this.frozen) result.push('frozen')
    if (this.active) result.push('active')
    return result
  }

  // eslint-disable-next-line class-methods-use-this
  get titleStyle() {
    return {
      lineHeight: `${MINUTE_IN_PIXELS * 30 - BOTTOM_GAP / 2}px`,
    }
  }

  formatTime(date: Date) {
    const m = momentTimezone.tz(date, this.timeZone)
    if (this.timeConvention === '12h') {
      if (this.frozen && m.minute() === 0) {
        return m.format('ha')
      }
      return m.format('hh:mma')
    }
    if (this.frozen && m.minute() === 0) {
      return m.format('HH')
    }
    return m.format('HH:mm')
  }

  get timespan() {
    return `${this.formatTime(this.start)} - ${this.formatTime(this.end)}`
  }
}
</script>

<style>
.timeslot-component {
  background-color: rgba(40, 201, 111, 0.7);
  position: absolute;
  width: 100%;
  color: #fff;
  overflow: hidden;
  cursor: grab;
}

.timeslot-component.active {
  pointer-events: none;
}

.timeslot-component .delete {
  position: absolute;
  top: 3px;
  right: 3px;
  padding: 0 5px;
  border: none;
  background-color: #fff;
  display: none;
  font-size: 20px;
  line-height: 1;
  color: #999;
  border-radius: 3px;
  cursor: pointer;
}

.timeslot-component:hover .delete {
  display: block;
}

.timeslot-component.frozen {
  background-color: #d6dfe5;
  border-left: 1px solid #acacac;
  color: #3d464d;
  opacity: 1;
  cursor: default;
}

.timeslot-component .handle {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  text-align: center;
  cursor: ns-resize;
}

.timeslot-component .title {
  padding: 0px 5px;
  font-size: 10px;
  font-weight: 100;
  overflow: hidden;
  max-height: 100%;
  pointer-events: none;
  word-wrap: break-word;
}
</style>
