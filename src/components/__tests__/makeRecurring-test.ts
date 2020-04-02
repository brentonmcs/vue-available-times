import momentTimezone from 'moment-timezone'
import 'jest'
import makeRecurring from '../makeRecurring'

it('converts to minutes from start of week', () => {
  const m = momentTimezone
    .tz('Europe/Stockholm')
    .day(0)
    .hours(3)
    .minutes(0)
    .seconds(0)
    .milliseconds(0)
  const start = m.toDate()
  const end = m.add(1, 'hour').toDate()

  expect(makeRecurring({ start, end }, 'Europe/Stockholm', 'sunday')).toEqual({
    start: 180,
    end: 240,
  })

  expect(makeRecurring({ start, end }, 'Europe/Stockholm', 'monday')).toEqual({
    start: 8820,
    end: 8880,
  })
})

it('works if start and end is in a DST week', () => {
  const m = momentTimezone
    .tz(new Date('Sun Mar 26 2017 12:00:00 GMT+0200'), 'Europe/Stockholm')
    .day(0)
    .hours(4)
    .minutes(0)
    .seconds(0)
    .milliseconds(0)
  const start = m.toDate()
  const end = m.add(1, 'hour').toDate()

  expect(makeRecurring({ start, end }, 'Europe/Stockholm', 'sunday')).toEqual({
    start: 240,
    end: 300,
  })

  expect(makeRecurring({ start, end }, 'Europe/Stockholm', 'monday')).toEqual({
    start: 8880,
    end: 8940,
  })
})
