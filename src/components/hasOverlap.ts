import { Event } from './models'

export default function hasOverlap(
  events: Event[],
  start: Date | string | number,
  end: Date | string | number,
  ignoreIndex = -1
): Date | undefined {
  for (let i = 0; i < events.length; i += 1) {
    if (i === ignoreIndex) {
      // eslint-disable-next-line no-continue
      continue
    }
    const selection = events[i]
    if (selection.start > start && selection.start < end) {
      // overlapping start
      return new Date(selection.start)
    }
    if (selection.end > start && selection.end < end) {
      // overlapping end
      return new Date(selection.end)
    }
    if (selection.start <= start && selection.end >= end) {
      // inside
      return new Date(selection.start)
    }
  }
  return undefined
}
