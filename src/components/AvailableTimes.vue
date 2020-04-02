<template>
  <div id="availableTimes" class="component" :style="componentStyle">
    <div class="inner">
      <div class="main">
        <Slider
          :index="currentWeekIndex"
          @onslide="move"
          :disabled="recurring"
          :weeks="weeks"
        >
          <template v-slot:week="{ week, i }">
            <div
              v-if="
                (recurring || Math.abs(i - currentWeekIndex) > 1) && i !== 0
              "
            >
              <span :key="week.start.toDateString()" />
            </div>

            <Week
              v-else
              :time-convention="timeConvention"
              :time-zone="timeZone"
              :available-width="availableWidth"
              :availableDays="availableDays"
              :week="week"
              :available-hour-range="availableHourRange"
              :recurring="recurring"
              :events="[]"
              :initial-selections="stateSelections"
              :touchToDeleteSelection="touchToDeleteSelection"
            />
          </template>
        </Slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import momentTimezone from 'moment-timezone'
import { WEEKS_PER_TIMESPAN, DAYS_IN_WEEK } from './Constants'
import weekAt from './weekAt'
import EventStore from './EventsStore'
import { WeekModel, Calendar, Event } from './models'
import normalizeRecurringSelections from './normalizeRecurringSelections'

import Week from './Week.vue'
import Slider from './Slider.vue'
import makeRecurring from './makeRecurring'

function flatten(selections: Map<string, Event[]>) {
  const result: Event[] = []

  selections.forEach((value) => {
    result.push(...value)
  })
  return result
}

@Component({ components: { Week, Slider } })
export default class AvailableTimes extends Vue {
  @Prop({ default: 'sunday' }) weekStartsOn!: string

  @Prop({ default: momentTimezone.tz.guess() }) timeZone!: string

  @Prop({ default: '' }) height!: number | string

  @Prop({ default: '' }) width!: number | string

  @Prop() initialSelections!: { start: number; end: number }[]

  @Prop() onEventsRequested!: Function

  @Prop() calendars!: Calendar[]

  @Prop({ default: DAYS_IN_WEEK }) availableDays!: string[]

  @Prop({ default: false }) recurring!: boolean

  @Prop({ default: { start: 0, end: 24 } }) availableHourRange!: {
    start: number
    end: number
  }

  @Prop({ default: 'ontouchstart' in window }) touchToDeleteSelection!: boolean

  timeConvention = '24h'

  availableWidth = 10

  currentWeekIndex = 0

  weeks: WeekModel[] = []

  selections!: Map<string, Event[]>

  eventStore!: EventStore

  events!: Event[]

  get componentStyle() {
    return {
      width: `${this.width}px`,
      height: `${this.height}px`,
    }
  }

  get week() {
    return this.weeks[0]
  }

  stateSelections: Event[] = []

  expandWeeks(weeks: WeekModel[], weekIndex: number) {
    if (weeks.length - weekIndex > WEEKS_PER_TIMESPAN) {
      return weeks
    }

    let newWeeks = weeks
    let addedWeeks = 0
    while (addedWeeks < WEEKS_PER_TIMESPAN) {
      newWeeks = newWeeks.concat(this.getWeek(newWeeks))
      addedWeeks += 1
    }

    setTimeout(() => {
      this.eventStore.addTimespan(
        newWeeks[newWeeks.length - WEEKS_PER_TIMESPAN].start,
        newWeeks[newWeeks.length - 1].end
      )
    })
    return newWeeks
  }

  private getWeek(newWeeks: WeekModel[]) {
    function oneWeekAhead(date: Date, tz: string) {
      const m = momentTimezone.tz(date, tz)
      m.week(m.week() + 1)
      return m.toDate()
    }
    if (newWeeks.length) {
      return weekAt(
        this.weekStartsOn,
        oneWeekAhead(newWeeks[newWeeks.length - 1].days[3].date, this.timeZone),
        this.timeZone
      )
    }
    return weekAt(this.weekStartsOn, new Date(), this.timeZone)
  }

  mounted() {
    this.eventStore = new EventStore(
      this.calendars,
      this.timeZone,
      this.onEventsRequested,
      () => {
        this.events = this.eventStore.get(
          this.weeks[this.currentWeekIndex].start
        )
      }
    )

    this.weeks = this.expandWeeks(this.weeks, 0)

    this.availableWidth = this.$el.clientWidth
    window.addEventListener('resize', this.handleWindowResize)

    this.selections = new Map<string, Event[]>()
    if (this.initialSelections) {
      const normaliszedSelections = normalizeRecurringSelections(
        this.initialSelections,
        this.timeZone,
        this.weekStartsOn
      )

      this.stateSelections = normaliszedSelections

      normaliszedSelections.forEach((selection) => {
        const week = weekAt(this.weekStartsOn, selection.start, this.timeZone)
        const existing: Event[] =
          this.selections.get(week.start.toDateString()) || []
        existing.push(selection)
        this.selections.set(week.start.toDateString(), existing)
      })
    }
  }

  handleWeekChange(week: WeekModel, weekSelections: Event[]) {
    this.selections.set(week.start.toDateString(), weekSelections)
    const newSelections = this.triggerOnChange()
    this.stateSelections = newSelections
  }

  triggerOnChange() {
    const { recurring, timeZone, weekStartsOn } = this
    const newSelections = flatten(this.selections)

    if (recurring) {
      const startingFirstWeek = newSelections.filter(
        ({ start }) => start < this.weeks[0].end
      )
      this.$emit(
        'on-change',
        startingFirstWeek.map((selection) =>
          makeRecurring(selection, timeZone, weekStartsOn)
        )
      )
    } else {
      this.$emit('on-change', newSelections)
    }
    return newSelections
  }

  move(increment: number) {
    const nextIndex = this.currentWeekIndex + increment
    if (nextIndex < 0) {
      return
    }

    this.weeks = this.expandWeeks(this.weeks, nextIndex)
    this.currentWeekIndex = nextIndex
    this.events = this.eventStore.get(this.weeks[nextIndex].start)
  }

  handleWindowResize() {
    this.availableWidth = this.$el.clientWidth
  }
}
</script>
<style>
.component,
.component * {
  box-sizing: border-box;
}

.component {
  position: relative;
  width: 100%;
  height: 100vh;
  font-size: 12px;
  line-height: 1.2;
  font-family: helvetica, arial, sans-serif;
  color: #666;
}

.inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 20px 25px 15px;
  font-size: 18px;
}

.buttons {
  flex-shrink: 0;
  margin: 2px 10px -2px 0px;
}

.button {
  border-radius: 3px;
  background-color: transparent;
  border: 0;
  padding: 2px 5px;
  cursor: pointer;
  fill: #666;
  flex-shrink: 0;
}

.button:focus {
  outline: none;
}

.button:hover {
  background-color: #f6fafe;
}

.button:active {
  fill: #4477bd;
}

.interval {
  flex-shrink: 1;
  flex-basis: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  white-space: nowrap;
}

.calendarSelector {
  flex-shrink: 0;
  margin-left: 15px;
}

.home {
  transition: opacity 0.3s;
  position: absolute;
  bottom: 10px;
  left: 5px;
  border-radius: 50%;
  border: none;
  background-color: #4285f4;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  width: 40px;
  height: 40px;
  fill: #fff;
  transition: all 0.2s;
}

.homeActive {
  pointer-events: inherit;
  cursor: pointer;
  opacity: 1;
  line-height: 0;
}

.home:focus {
  outline: none;
}

.home:hover {
  background-color: #0070e0;
}
</style>
