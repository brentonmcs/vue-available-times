<template>
  <div :class="componentClass" :style="componentStyle">
    <div class="grayed block" :style="grayBlockTopStyle" />
    <div class="grayed block" :style="grayBlockSecondStyle" />
    <div v-if="events">
      <TimeSlot
        v-for="(e, i) in nonAllDayEvents"
        :key="i"
        :timeConvention="timeConvention"
        :timeZone="timeZone"
        :date="date"
        :start="e.start"
        :end="e.end"
        :title="e.title"
        :width="e.width"
        :offset="e.offset"
        :frozen="true"
      />
    </div>

    <div
      v-if="available"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseleave="handleMouseUp"
      @mouseup="handleMouseUp"
      class="mouseTarget"
      ref="mouseTargetRef"
      :style="{
        top: hourLimits.top + 'px',
        height: hourLimits.difference + 'px',
      }"
    />
    <TimeSlot
      v-for="(e, i) in selections"
      :key="i"
      :timeConvention="timeConvention"
      :timeZone="timeZone"
      :date="date"
      :start="e.start"
      :end="e.end"
      :active="isActive"
      @on-size-change-start="
        (timeslot, e) => handleItemModification('end', timeslot, e)
      "
      @on-move-start="
        (timeslot, e) => handleItemModification('both', timeslot, e)
      "
      @on-delete="handleDelete"
      :touchToDelete="touchToDeleteSelection"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { HOUR_IN_PIXELS, MINUTE_IN_PIXELS } from './Constants'
import TimeSlot from './TimeSlot.vue'
import hasOverlap from './hasOverlap'
import inSameDay from './inSameDay'
import positionInDay from './positionInDay'
import toDate from './toDate'
import { Event as EventModel } from './models'

const ROUND_TO_NEAREST_MINS = 15

const DEFAULT_VAL = -9999
@Component({
  components: {
    TimeSlot,
  },
})
export default class DayComponent extends Vue {
  @Prop() initialSelections!: { start: Date; end: Date }[]

  @Prop() index!: number

  @Prop() timeZone!: string

  @Prop() date!: Date

  @Prop() hourLimits!: {
    top: number
    bottom: number
    bottomHeight: number
    difference: number
  }

  @Prop() events!: EventModel[]

  @Prop() available!: boolean

  @Prop({ default: 10 }) availableWidth!: number

  @Prop() timeConvention!: string

  @Prop() touchToDeleteSelection!: boolean

  edge = ''

  selections: { start: Date; end: Date }[] = []

  minLengthInMinutes = -1

  lastKnownPosition = -1

  target: { offsetTop: number; offsetHeight: number } = {
    offsetTop: DEFAULT_VAL,
    offsetHeight: DEFAULT_VAL,
  }

  stateIndex = -1

  get nonAllDayEvents() {
    return this.events.filter((x) => !x.allDay)
  }

  get isActive() {
    return this.stateIndex > -1
  }

  touch: {
    startX: number
    startY: number
    currentY?: number
    currentX?: number
  } = { startX: DEFAULT_VAL, startY: DEFAULT_VAL }

  mounted() {
    this.selections = this.initialSelections || []
  }

  onPanning(e: {
    pointerType: string
    eventType: number
    additionalEvent: string
    srcEvent: PointerEvent
  }) {
    if (e.pointerType === 'mouse') {
      console.log(`${e.additionalEvent} ${e.eventType}`)
      if (e.eventType === 1) {
        console.log('Mouse Down')
        this.handleMouseDown(e.srcEvent)
        return
      }
      if (e.eventType === 2) {
        console.log('Mouse Move')
        this.handleMouseMove(e.srcEvent)
        return
      }
      if (e.eventType === 4) {
        console.log('Mouse Up')
        this.handleMouseUp()
        return
      }
      console.log(e)
    }

    console.log('should not be here')
  }

  findSelectionAt(date: Date) {
    for (let i = 0; i < this.selections.length; i += 1) {
      const selection = this.selections[i]
      if (
        selection.start.getTime() <= date.getTime() &&
        selection.end.getTime() > date.getTime()
      ) {
        return true
      }
    }
    return undefined
  }

  relativeY(pageY: number, rounding = ROUND_TO_NEAREST_MINS) {
    if (!(this.$refs.mouseTargetRef instanceof Element)) {
      return 0
    }

    const { top } = this.$refs.mouseTargetRef.getBoundingClientRect()
    let realY =
      pageY -
      top -
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0)
    realY += this.hourLimits.top // offset top blocker
    const snapTo = (rounding / 60) * HOUR_IN_PIXELS
    return Math.floor(realY / snapTo) * snapTo
  }

  get componentClass() {
    const result = ['day-component']
    if (!this.available) {
      result.push('grayed')
    }
    if (inSameDay(this.date, new Date(), this.timeZone)) {
      result.push('today')
    }
    return result
  }

  get componentStyle() {
    return {
      height: `${HOUR_IN_PIXELS * 24}px`,
      width: `${this.availableWidth}px`,
    }
  }

  get grayBlockTopStyle() {
    return {
      height: `${this.hourLimits.top}px`,
      top: `${0}px`,
    }
  }

  get grayBlockSecondStyle() {
    return {
      height: `${this.hourLimits.bottomHeight}px`,
      top: `${this.hourLimits.bottom}px`,
    }
  }

  handleDelete({ start, end }: { start: Date; end: Date }) {
    const { selections } = this

    for (let i = 0; i < selections.length; i += 1) {
      if (selections[i].start === start && selections[i].end === end) {
        selections.splice(i, 1)
        this.$emit('on-change', this.index, selections)
        this.selections = selections
      }
    }
  }

  handleItemModification(
    edge: string,
    { start, end }: { start: Date; end: Date },
    event: {
      pageY: number
      currentTarget: { offsetTop: number; offsetHeight: number }
    }
  ) {
    const position = this.relativeY(event.pageY)

    console.log(
      `handleItemModification ${edge} ${event.currentTarget} ${position}`
    )

    const i = this.selections.findIndex(
      (x) => x.start === start && x.end === end
    )

    if (i > -1) {
      console.log(
        `handleItemModification - moving ${i} to position ${position} ${edge} ${event.currentTarget}`
      )

      this.edge = edge
      this.stateIndex = i
      this.lastKnownPosition = position
      this.minLengthInMinutes = 30
      this.target = event.currentTarget
    }
  }

  handleTouchStart(e: {
    type: string
    startX: number
    startY: number
    pageY: number
    clientX: number
    clientY: number
  }) {
    if (e.type === 'mousedown') {
      this.handleMouseDown(e)
    } else {
      this.touch = {
        startY: e.startY,
        startX: e.startX,
      }
    }
  }

  handleTouchMove(e: { type: string; pageX: number; pageY: number }) {
    if (e.type === 'mousemove') {
      this.handleMouseMove(e)
    } else {
      this.touch.currentY = e.pageX
      this.touch.currentX = e.pageY
    }
  }

  handleTouchEnd(e: { type: string }) {
    if (e.type === 'mouseup') {
      this.handleMouseUp()
      return
    }

    const { startY, currentY, startX, currentX } = this.touch
    if (
      Math.abs(startX - (currentX || startX)) < 20 &&
      Math.abs(startY - (currentY || startY)) < 20
    ) {
      this.handleMouseDown({ pageY: startY })
      setTimeout(() => {
        this.handleMouseUp()
      })
    }
    this.touch = { startY: DEFAULT_VAL, startX: DEFAULT_VAL }
  }

  handleMouseDown(e: { pageY: number }) {
    const position = this.relativeY(e.pageY, 60)
    const dateAtPosition = toDate(this.date, position, this.timeZone)

    if (this.findSelectionAt(dateAtPosition)) {
      return
    }

    let end = toDate(this.date, position + HOUR_IN_PIXELS, this.timeZone)
    end = hasOverlap(this.selections, dateAtPosition, end) || end
    if (end.getTime() - dateAtPosition.getTime() < 1800000) {
      // slot is less than 30 mins
      return
    }

    this.edge = 'end'
    this.stateIndex = this.selections.length
    this.lastKnownPosition = position
    this.minLengthInMinutes = 60

    this.selections.push({
      start: dateAtPosition,
      end,
    })
  }

  // eslint-disable-next-line class-methods-use-this
  hasReachedTop({ offsetTop }: { offsetTop: number }) {
    return offsetTop <= this.hourLimits.top
  }

  hasReachedBottom({
    offsetTop,
    offsetHeight,
  }: {
    offsetTop: number
    offsetHeight: number
  }) {
    return offsetTop + offsetHeight >= this.hourLimits.bottom
  }

  handleMouseMove({ pageY }: { pageY: number }) {
    if (this.stateIndex === -1) {
      return
    }

    if (this.target.offsetTop !== DEFAULT_VAL) {
      console.log(
        `Moving ${this.stateIndex} to ${pageY} edge ${this.edge} target top ${this.target.offsetTop}`
      )
    } else {
      console.log('Moving with undef target')
    }

    const { date, timeZone } = this
    const position = this.relativeY(pageY)
    const selection = this.selections[this.stateIndex]
    let newMinLength = this.minLengthInMinutes

    if (this.edge === 'both') {
      // move element
      const diff =
        toDate(date, position, timeZone).getTime() -
        toDate(date, this.lastKnownPosition || 0, timeZone).getTime()
      let newStart = new Date(selection.start.getTime() + diff)
      let newEnd = new Date(selection.end.getTime() + diff)

      if (hasOverlap(this.selections, newStart, newEnd, this.stateIndex)) {
        return
      }

      if (this.hasReachedTop(this.target) && diff < 0) {
        // if has reached top blocker and it is going upwards, fix the newStart.
        newStart = selection.start
      }

      if (this.hasReachedBottom(this.target) && diff > 0) {
        // if has reached bottom blocker and it is going downwards, fix.
        newEnd = selection.end
      }

      selection.start = newStart
      selection.end = newEnd
    } else {
      // stretch element
      const startPos = positionInDay(date, selection.start, timeZone)
      const minPos =
        startPos + (this.minLengthInMinutes || 0) * MINUTE_IN_PIXELS
      if (minPos < position) {
        // We've exceeded 60 mins now, allow smaller
        newMinLength = 30
      }
      const newEnd = toDate(date, Math.max(minPos, position), timeZone)
      if (
        hasOverlap(this.selections, selection.start, newEnd, this.stateIndex)
      ) {
        // Collision! Let
        return
      }
      selection.end = newEnd
    }

    this.lastKnownPosition = position
    this.minLengthInMinutes = newMinLength
  }

  handleMouseUp() {
    if (this.stateIndex === -1) {
      return
    }

    this.edge = ''
    this.stateIndex = -1
    this.lastKnownPosition = DEFAULT_VAL
    this.minLengthInMinutes = DEFAULT_VAL

    this.$emit('on-change', this.index, this.selections)
  }
}
</script>

<style>
.day-component {
  border-left: 1px solid #d6d6d6;
  position: relative;
  user-select: none;
}

.today {
  background-color: rgba(218, 228, 242, 0.2);
}

.grayed {
  background-image: linear-gradient(
    -45deg,
    #f6f6f6 25%,
    transparent 25%,
    transparent 50%,
    #f6f6f6 50%,
    #f6f6f6 75%,
    transparent 75%,
    transparent
  );
  background-size: 10px 10px;
  border-bottom: none;
}

.block {
  position: absolute;
  width: 100%;
}

.mouseTarget {
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  cursor: default;
}
</style>
