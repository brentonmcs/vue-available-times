declare module 'vue-available-times' {
  export interface WeekModel {
    interval: string
    days: Day[]
    start: Date
    end: Date
  }
  export interface Day {
    date: Date
    name: string
    abbreviated: string
    available?: boolean
  }
  export interface Calendar {
    id: string
    title: string
    foregroundColor: string
    backgroundColor: string
    selected: boolean
  }
  export interface Timespan {
    start: Date
    end: Date
    calendarIds: string[]
    events: Event[]
    decoratedEvents: Event[] | undefined | null
  }
  export interface Event {
    calendarId?: string
    start: Date | string | number
    end: Date | string | number
    allDay?: boolean
    width?: number
    offset?: number
  }
  export interface GroupEvents {
    start: Date | string | number
    end: Date | string | number
    columns: Event[][]
  }
}
