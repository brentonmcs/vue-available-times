import momentTimezone from 'moment-timezone'
import 'jest'
import normalizeRecurringSelections from '../normalizeRecurringSelections'

it('converts minutes-since-week-start to static dates', () => {
  const m = momentTimezone
    .tz('Europe/Stockholm')
    .day(0)
    .hours(3)
    .minutes(0)
    .seconds(0)
    .milliseconds(0)
  const end = m.add(2, 'hour').toDate()
  const start = m.add(-1, 'hour').toDate()
  expect(
    normalizeRecurringSelections(
      [
        {
          start: 180,
          end: 240,
        },
      ],
      'Europe/Stockholm',
      'sunday'
    )
  ).toEqual([
    {
      start: start,
      end: end,
    },
  ])
})
