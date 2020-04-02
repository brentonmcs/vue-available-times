<template>
  <div id="app">
    <AvailableTimes
      :calendars="calendars"
      onChange="onChange"
      height="800"
      :availableDays="['monday', 'tuesday', 'wednesday', 'thursday', 'friday']"
      :availableHourRange="{ start: 9, end: 19 }"
      :recurring="true"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AvailableTimes from './components/AvailableTimes.vue'
@Component({
  components: {
    AvailableTimes,
  },
})
export default class App extends Vue {
  calendars = [
    {
      id: 'work',
      title: 'Work',
      foregroundColor: '#ff00ff',
      backgroundColor: '#f0f0f0',
      selected: true,
    },
    {
      id: 'work2',
      title: 'Work2',
      foregroundColor: '#00ff00',
      backgroundColor: '#f0f0f0',
      selected: true,
    },
  ]

  // eslint-disable-next-line class-methods-use-this
  onChange(selections: { start: Date; end: Date }[]) {
    selections.forEach(({ start, end }) => {
      console.log('Start:', start, 'End:', end)
    })
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
