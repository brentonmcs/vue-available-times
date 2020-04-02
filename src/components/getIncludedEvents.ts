import { Event } from './models'

export default function getIncludedEvents(
  events: {
    start: Date | number | string
    end: Date | number | string
    allDay?: boolean | undefined
  }[],
  dayStart: Date,
  dayEnd: Date
): Event[] {
  if (!events || events.length === 0) {
    return []
  }
  debugger

  return events.filter(({ start, end, allDay }) => {
    if (allDay) {
      return dayStart >= start && dayStart < end
    }
    return (
      (dayStart <= start && start < dayEnd) || (dayStart < end && end < dayEnd)
    )
  })
}
