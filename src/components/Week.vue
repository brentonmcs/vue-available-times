<template>
  <div id="week" class="week-component">
    <div class="header" :style="headerStyle">
      <div class="allDayLabel">All-day</div>
      <DayHeader
        v-for="(day, i) in filteredDays"
        :key="i"
        :availableWidth="dayHeaderWidth"
        :day="day"
        :events="dayEvents[i]"
        :hideDates="recurring"
        :available="day.available"
      />
    </div>
    <div class="daysWrapper" ref="daysWrapper">
      <div class="lines">
        <div
          v-for="(e, i) in 23"
          :key="i"
          class="hour"
          :style="daysWrapperStyle"
      /></div>
      <div class="days" ref="daysRef">
        <Ruler :timeConvention="timeConvention" />
        <Day
          v-for="(day, i) in filteredDays"
          :key="i"
          :available="day.available"
          :availableWidth="perDayWidth"
          :timeConvention="timeConvention"
          :timeZone="timeZone"
          :index="i"
          :date="day.date"
          :events="dayEvents[i]"
          :initialSelections="daySelections[i]"
          @onchange="handleDayChange"
          :hourLimits="generateHourLimits"
          :touchToDeleteSelection="touchToDeleteSelection"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import momentTimezone from 'moment-timezone'
import moment from 'moment'

import {
  HOUR_IN_PIXELS,
  RULER_WIDTH_IN_PIXELS,
  MINUTE_IN_PIXELS,
} from './Constants'
import Day from './Day.vue'
import DayHeader from './DayHeader.vue'
import Ruler from './Ruler.vue'
import getIncludedEvents from './getIncludedEvents'
import { WeekModel, Event } from './models'

function flatten(selections: Event[][]) {
  const result: Event[] = []
  selections.forEach((selectionsInDay) => {
    result.push(...selectionsInDay)
  })
  return result
}

function weekEvents({
  week,
  items,
  timeZone,
}: {
  week: WeekModel
  items: {
    start: Date | number | string
    end: Date | number | string
    allDay?: boolean | undefined
  }[]
  timeZone: string
}): Event[][] {
  const result: Event[][] = []
  week.days.forEach(({ date }: { date: Date }) => {
    const startMoment = momentTimezone.tz(date, timeZone).hour(0)
    const end = momentTimezone
      .tz(startMoment, timeZone)
      .date(startMoment.date() + 1)
      .toDate()
    const start = startMoment.toDate()
    result.push(getIncludedEvents(items || [], start, end))
  })
  return result
}

let cachedScrollbarWidth: number | undefined
function computeWidthOfAScrollbar() {
  // based on https://davidwalsh.name/detect-scrollbar-width
  if (cachedScrollbarWidth) {
    return cachedScrollbarWidth
  }
  const scrollDiv = document.createElement('div')
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'

  document.body.appendChild(scrollDiv)
  cachedScrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return cachedScrollbarWidth
}

@Component({ components: { Day, DayHeader, Ruler } })
export default class Week extends Vue {
  @Prop() timeZone!: string

  @Prop() timeConvention!: string

  @Prop({ default: true }) recurring!: boolean

  @Prop() touchToDeleteSelection!: boolean

  @Prop({ default: 10 }) availableWidth!: number

  @Prop() availableDays!: string[]

  @Prop({ default: [] }) initialSelections!: {
    start: number
    end: number
    allDay?: boolean
  }[]

  @Prop() events!: Event[]

  @Prop() week!: WeekModel

  @Prop({ default: { start: 0, end: 24 } }) availableHourRange!: {
    start: number
    end: number
  }

  dayEvents: Event[][] = []

  daySelections: Event[][] = []

  daysWidth = 10

  widthOfAScrollbar = 0

  get headerStyle() {
    return {
      'margin-left': `${RULER_WIDTH_IN_PIXELS}px`,
      'max-width': `${this.daysWidth}px`,
      'margin-right': `${this.widthOfAScrollbar}px`,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get daysWrapperStyle() {
    return { height: `${HOUR_IN_PIXELS}px` }
  }

  setDaysWidth() {
    this.daysWidth = this.$el.clientWidth
  }

  get perDayWidth() {
    return (this.availableWidth - RULER_WIDTH_IN_PIXELS) / 7
  }

  mounted() {
    window.addEventListener('resize', this.setDaysWidth)

    this.dayEvents = weekEvents({
      week: this.week,
      items: this.events,
      timeZone: this.timeZone,
    })
    this.daySelections = weekEvents({
      week: this.week,
      items: this.initialSelections,
      timeZone: this.timeZone,
    })

    // TODO: Need to check this
    if (this.$refs.daysWrapper instanceof Element) {
      this.$refs.daysWrapper.scrollTop = HOUR_IN_PIXELS * 6.5
    }

    this.setDaysWidth()
    this.widthOfAScrollbar = computeWidthOfAScrollbar()
  }

  destroyed() {
    window.removeEventListener('resize', this.setDaysWidth)
  }

  handleDayChange(dayIndex: number, selections: Event[]) {
    this.daySelections[dayIndex] = selections
    const flattened = flatten(this.daySelections)
    this.$emit('on-change', this.week, flattened)
  }

  // generate the props required for Day to block specific hours.
  get generateHourLimits() {
    const { availableHourRange } = this
    return {
      top: availableHourRange.start * HOUR_IN_PIXELS, // top blocker
      bottom: availableHourRange.end * HOUR_IN_PIXELS,
      bottomHeight: (24 - availableHourRange.end) * HOUR_IN_PIXELS, // bottom height
      difference:
        (availableHourRange.end - availableHourRange.start) * HOUR_IN_PIXELS +
        MINUTE_IN_PIXELS * 14,
    }
  }

  get dayHeaderWidth() {
    return (this.availableWidth - RULER_WIDTH_IN_PIXELS) / 7
  }

  get filteredDays() {
    return this.week.days.map((day) => {
      const updatedDay = day
      const dayNameInEnglish = moment(day.date)
        .locale('en')
        .format('dddd')
        .toLowerCase()

      updatedDay.available = this.availableDays.includes(dayNameInEnglish)

      return updatedDay
    })
  }
}
</script>

<style>
.week-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.days,
.header {
  display: flex;
  align-items: flex-start;
}

.header {
  align-items: stretch;
}

.daysWrapper {
  position: relative;
  overflow: auto;
  flex: 1 1 auto;
  -webkit-overflow-scrolling: touch;
}

.allDayLabel {
  position: absolute;
  left: -35px;
  bottom: 3px;
  font-size: 10px;
  line-height: 1;
}

.header {
  position: relative;
  flex-shrink: 0;
  border-bottom: 2px solid #d6d6d6;
}

.lines {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.hour {
  border-bottom: 1px solid #d6d6d6;
  pointer-events: none;
}
</style>
