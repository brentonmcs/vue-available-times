<template lang="html">
  <div class="dayheader-component" :style="headerStyle">
    <div class="day" :class="isAvailable" v-if="hideDates">
      <div v-if="availableWidth < 55">
        {{ day.abbreviated }}
      </div>
      <div v-else>
        {{ day.name }}
      </div>
    </div>
    <div class="day" :class="isAvailable" v-else>
      <span v-if="availableWidth < 55">
        {{ day.abbreviated }}
        <br />
        {{ dateNumber }}
      </span>
      <span v-else> {{ day.abbreviated }} {{ dateNumber }} </span>
    </div>

    <div class="events">
      <div
        v-for="(e, i) in allDayEvents"
        :key="i + e.title"
        class="event"
        :title="e.title"
      >
        {{ e.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Day, Event } from './models'

@Component
export default class DayHeader extends Vue {
  @Prop({ default: 10 }) availableWidth!: number

  @Prop() day!: Day

  @Prop() available!: boolean

  @Prop() hideDates!: boolean

  @Prop() events!: Event[]

  get headerStyle() {
    return { width: `${this.availableWidth}px` }
  }

  get isAvailable() {
    if (!this.available) return 'transparent'
    return ''
  }

  get allDayEvents() {
    if (this.events && this.events.length > 0) {
      return this.events.filter(({ allDay }) => allDay)
    }
    return []
  }

  get dateNumber() {
    return this.day.date.getDate()
  }
}
</script>

<style>
.dayheader-component {
  flex-shrink: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dayheader-component .day {
  flex-shrink: 0;
  padding: 5px;
  text-align: center;
}

.dayheader-component .transparent {
  opacity: 0.25;
}

.events {
  flex-grow: 1;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid #d6d6d6;
  min-height: 15px;
  border-left: 1px solid #d6d6d6;
}

.event {
  flex-basis: 33.3333%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex-grow: 1;
  flex-shrink: 1;
  padding: 3px;
  background-color: #d6dfe5;
  border-left: 1px solid #acacac;
  font-weight: 100;
  color: #3d464d;
  margin: 1px;
}
</style>
