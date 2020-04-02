import momentTimezone from 'moment-timezone'
import { Event, GroupEvents } from './models'
import hasOverlap from './hasOverlap'

function compareDates(a: Event, b: Event) {
  return a.start < b.start ? -1 : 1
}

function groupEvents(events: Event[]): GroupEvents[] {
  const groups: GroupEvents[] = []
  events.forEach((event) => {
    // Add all allDay events in separate groups
    if (!event.allDay) {
      return
    }
    groups.push({
      start: event.start,
      end: event.end,
      columns: [[event]],
    })
  })

  let currentGroup: GroupEvents | undefined
  events.forEach((event) => {
    if (event.allDay) {
      // ignore
      return
    }
    if (currentGroup && event.start >= currentGroup.end) {
      currentGroup = undefined
    }
    if (currentGroup) {
      const existingCol = currentGroup.columns.find((x) =>
        x.find((y) => y.end <= event.start)
      )

      if (existingCol) {
        existingCol.push(event)
      } else {
        currentGroup.columns.push([event])
      }
    }
    if (!currentGroup) {
      currentGroup = {
        start: event.start,
        end: event.end,
        columns: [[event]],
      }
      groups.push(currentGroup)
    }
    currentGroup.end =
      currentGroup.end > event.end ? currentGroup.end : event.end
  })
  return groups
}

function flattenGroups(groups: GroupEvents[]) {
  const result: Event[] = []
  groups.forEach((group) => {
    const columnsLength = group.columns.length

    group.columns.forEach((events: Event[], columnIndex: number) => {
      events.forEach((event) => {
        let colspan = 1
        // Peek ahead to see if the event fits in another column
        let j = columnIndex + 1
        while (
          j < group.columns.length &&
          !hasOverlap(group.columns[j], event.start, event.end)
        ) {
          colspan += 1
          j += 1
        }

        result.push({
          width: colspan / columnsLength,
          offset: columnIndex / columnsLength,
          ...event,
        })
      })
    })
  })
  result.sort(compareDates)
  return result
}

function normalize(events: Event[], timeZone: string): Event[] {
  return events.map((event) => ({
    ...event,
    start: momentTimezone.tz(event.start, timeZone).toDate(),
    end: momentTimezone.tz(event.end, timeZone).toDate(),
  }))
}

export default function decorateEvents(
  events: Event[],
  timeZone = ''
): Event[] {
  // Make sure events are sorted by start time
  const orderedByStartTime = normalize(events, timeZone).sort(compareDates)

  const groups = groupEvents(orderedByStartTime)

  return flattenGroups(groups)
}
