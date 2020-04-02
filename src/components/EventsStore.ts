import decorateEvents from './decorateEvents'
import { Calendar, Timespan, Event } from './models'

export default class EventsStore {
  selectedCalendars: string[] = []

  timeZone: string

  timespans: Timespan[]

  onEventsRequested: Function

  onChange: Function

  calendarsById: { [id: string]: Calendar } = {}

  constructor(
    calendars: Calendar[],
    timeZone: string,
    onEventsRequested: Function,
    onChange: Function
  ) {
    this.selectedCalendars = calendars
      .filter(({ selected }) => selected)
      .map(({ id }) => id)
    this.timeZone = timeZone
    calendars.forEach((calendar) => {
      this.calendarsById[calendar.id] = calendar
    })
    this.onEventsRequested = onEventsRequested
    this.onChange = onChange
    this.timespans = []
  }

  cancel() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onChange = () => {}
  }

  updateSelectedCalendars(selectedCalendars: string[]) {
    this.selectedCalendars = selectedCalendars
    this.fetchEvents()
    this.timespans.forEach((timespan) => {
      // eslint-disable-next-line no-param-reassign
      timespan.decoratedEvents = null
    })
    this.onChange()
  }

  filterVisible(events: Event[]) {
    return events.filter(
      ({ calendarId }) =>
        calendarId && this.selectedCalendars.indexOf(calendarId) !== -1
    )
  }

  get(atTime: Date) {
    for (let i = 0; i < this.timespans.length; i += 1) {
      const timespan = this.timespans[i]
      const { start, end, events, decoratedEvents } = timespan
      if (
        start.getTime() <= atTime.getTime() &&
        end.getTime() > atTime.getTime()
      ) {
        if (decoratedEvents) {
          return decoratedEvents
        }
        timespan.decoratedEvents = decorateEvents(
          this.filterVisible(events),
          this.timeZone
        )
        return timespan.decoratedEvents
      }
    }
    return []
  }

  addTimespan(start: Date, end: Date) {
    this.timespans.push({
      start,
      end,
      events: [],
      calendarIds: [],
      decoratedEvents: [],
    })
    this.fetchEvents()
  }

  fetchEvents() {
    if (!this.onEventsRequested) {
      return
    }
    this.selectedCalendars.forEach((calendarId) => {
      this.timespans.forEach((timespan) => {
        if (timespan.calendarIds.indexOf(calendarId) !== -1) {
          // already fetched for this calendar
          return
        }

        this.onEventsRequested({
          calendarId,
          start: timespan.start,
          end: timespan.end,
          callback: (events: Event[]) => {
            timespan.events.push(...events)
            // eslint-disable-next-line no-param-reassign
            timespan.decoratedEvents = null // clear cache
            this.onChange()
          },
        })
        timespan.calendarIds.push(calendarId)
      })
    })
  }
}
