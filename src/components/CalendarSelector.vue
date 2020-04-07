<template>
  <div class="component">
    <button class="button" @click="toggleOpen">
      <svg viewBox="0 0 24 24">
        {/* eslint-disable max-len */}
        <path
          d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"
        />
      </svg>
    </button>

    <div class="modal" v-if="open">
      <div class="clickTarget" @click="toggleOpen" />
      <div class="menu">
        <div v-for="calendar in calendars" :key="calendar.id">
          <label
            :key="calendar.id"
            class="calendar"
            :style="{ display: 'none' }"
          >
            <input
              class="checkbox"
              type="checkbox"
              :checked="isChecked(calendar.id)"
              :value="calendar.id"
              @change="
                () =>
                  isChecked(calendar.id)
                    ? toggleCalendar(false)
                    : toggleCalendar(true)
              "
              :style="{ display: 'none' }"
            />
            <div
              class="box"
              :style="{
                fill: calendar.foregroundColor,
                backgroundColor: calendar.backgroundColor,
              }"
            >
              <svg
                v-if="isChecked(calendar.id)"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div :title="calendar.title" class="calendarTitle">
              {{ calendar.title }}
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Calendar } from './models'

@Component({
  components: {},
})
export default class CalendarSelector extends Vue {
  @Prop() calendars!: Calendar

  @Prop() selectedCalendars!: string[]

  open = true

  isChecked(id: string) {
    return this.selectedCalendars.indexOf(id) !== -1
  }

  toggleOpen(event: Event) {
    event.stopPropagation()
    this.open = !this.open
  }

  toggleCalendar(visible: boolean, event: { target: { value: string } }) {
    if (!event || !event.target) {
      return
    }

    const result = this.selectedCalendars.slice(0)
    if (visible) {
      result.push(event.target.value)
    } else {
      result.splice(result.indexOf(event.target.value), 1)
    }

    this.$emit('on-change', result)
  }
}
</script>

<style>
.component {
  position: relative;
  line-height: 0;
  font-size: 14px;
}

.modal {
  z-index: 1;
}

.clickTarget {
  z-index: 1;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.menu {
  z-index: 1;
  background-color: #fff;
  border: 1px solid #ccc;
  width: 200px;
  min-height: 150px;
  max-height: 100vh;
  position: absolute;
  right: 0;
  top: 100%;
  text-align: left;
  overflow: auto;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 5px 0px;
  line-height: 1;
}

.calendar {
  cursor: pointer;
  display: block;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}

.checkbox {
  margin-right: 10px;
  flex-grow: 0;
}

.button {
  border: none;
  background-color: transparent;
  padding: 0;
  appearance: none;
  color: #666;
  fill: #666;
  cursor: pointer;
  line-height: 0;
}

.button svg {
  height: 19px;
}

.button:active {
  fill: #4477bd;
  color: #4477bd;
}

.button:focus {
  outline: none;
}

.box {
  flex-shrink: 0;
  border-radius: 3px;
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.calendarTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 0 1 auto;
}
</style>
