<template>
  <div>
    <div class="example">
      <div v-if="!fullscreen" class="intro">
        <h1>Example #1</h1>
        <p>
          Uses the current date as the starting point.
        </p>

        <div v-if="selections.length > 0">
          <h2>Selected ({{ selections.length }})</h2>
          <ul class="selected">
            <li v-for="sel in selections" :key="sel.start">
              {{ sel.start.toString() }} - {{ sel.end.toString() }}
            </li>
          </ul>
        </div>

        <a href="/?fullscreen">
          Go full screen
        </a>
        <br />
        <br />
        <button @click="() => (recurring = true)">
          Switch to recurring
        </button>
        <br />
        <br />
        <button @click="() => (recurring = false)">
          Switch to time specific
        </button>
      </div>

      <div class="main">
        <AvailableTimes
          time-convention="24h"
          :height="fullscreen ? undefined : 600"
          :calendars="calendars"
          weekStartsOn="monday"
          @on-change="handleChange"
          :initialSelections="initialSelections"
          :onEventsRequested="handleEventsRequested"
          :recurring="recurring"
          :availableDays="[
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
          ]"
          :availableHourRange="{ start: 6, end: 20 }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import momentTimezone from 'moment-timezone'

import { Component, Vue } from 'vue-property-decorator'
import AvailableTimes from './components/AvailableTimes.vue'
import { Event } from './components/models'

function dateAt(dayInWeek: number, hours: number, minutes: number) {
  const date = new Date()
  while (date.getDay() > 0) {
    // reset to sunday
    date.setDate(date.getDate() - 1)
  }
  for (let i = 0; i < dayInWeek; i += 1) {
    date.setDate(date.getDate() + 1)
  }
  date.setHours(hours, minutes, 0, 0)
  return date
}

@Component({
  components: {
    AvailableTimes,
  },
})
export default class Test extends Vue {
  TIME_ZONE = 'America/Los_Angeles'

  recurring = false

  fullscreen = false

  calendars = [
    {
      id: 'private',
      title: 'My own private calendar with plenty of stuff in it',
      backgroundColor: '#666',
      foregroundColor: '#fff',
      selected: true,
    },
    {
      id: 'work',
      title: 'Work',
      backgroundColor: 'pink',
      foregroundColor: 'black',
      selected: true,
    },
  ]

  initialSelections = [
    {
      start: dateAt(1, 12, 15),
      end: dateAt(1, 14, 0),
    },
    {
      start: dateAt(4, 11, 0),
      end: dateAt(4, 12, 30),
    },
  ]

  selections: Event[] = []

  handleChange(selections: { start: Date; end: Date }[]) {
    this.selections = selections
  }

  // eslint-disable-next-line class-methods-use-this
  handleEventsRequested({
    start: s,
    end: e,
    calendarId,
    callback,
  }: {
    start: Date
    end: Date
    calendarId: string
    callback: Function
  }) {
    // eslint-disable-next-line no-console
    console.log(calendarId, s, e)
    const events: Event[] = []
    const date = momentTimezone.tz(s, this.TIME_ZONE)

    while (date.toDate() < e) {
      const start = date.toDate()
      const end = date.add(Math.round(Math.random() * 4), 'hour').toDate()
      if (Math.random() > 0.98) {
        const startM = momentTimezone.tz(start, this.TIME_ZONE)
        const startString = startM.format('YYYY-MM-DD')
        events.push({
          start: startString,
          end: startM.date(startM.date() + 1).format('YYYY-MM-DD'),
          title: `All day ${calendarId}`,
          allDay: true,
          calendarId,
        })
      }
      if (Math.random() > 0.7) {
        events.push({
          start: start.toISOString(),
          end: end.toISOString(),
          title: `Event ${calendarId}`,
          calendarId,
        })
      }
    }
    const latency = Math.random() * 5000
    // eslint-disable-next-line no-console
    console.log(`Simulated latency for ${calendarId}`, latency)
    setTimeout(() => {
      callback(events)
    }, latency)
  }
}
</script>

<style>
.example {
  display: flex;
  align-items: flex-start;
  font-family: helvetica, arial, sans-serif;
  font-size: 12px;
  line-height: 1.2;
  max-width: 100%;
}

.intro {
  width: 220px;
  padding: 20px;
}

.example > .main {
  flex-grow: 1;
}

.selected {
  max-height: 200px;
  overflow: auto;
  font-size: 10px;
}
</style>
