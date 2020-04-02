import { HOUR_IN_PIXELS, MINUTE_IN_PIXELS } from '../Constants'
import positionInDay from '../positionInDay'

it('works for dates tomorrow', () => {
  const withinDay = new Date('Sun Mar 26 2017 12:00:00 GMT+0200')
  const date = new Date('Mon Mar 27 2017 12:00:00 GMT+0200')
  expect(positionInDay(withinDay, date, 'Europe/Stockholm')).toEqual(
    24 * HOUR_IN_PIXELS
  )
})

it('works for dates yesterday', () => {
  const withinDay = new Date('Mon Mar 27 2017 12:00:00 GMT+0200')
  const date = new Date('Sun Mar 26 2017 12:00:00 GMT+0200')
  expect(positionInDay(withinDay, date, 'Europe/Stockholm')).toEqual(0)
})

it('works for dates within current day', () => {
  const withinDay = new Date('Mon Mar 27 2017 12:00:00 GMT+0200')
  const date = new Date('Mon Mar 27 2017 12:30:00 GMT+0200')
  expect(positionInDay(withinDay, date, 'Europe/Stockholm')).toEqual(
    12 * HOUR_IN_PIXELS + 30 * MINUTE_IN_PIXELS
  )
})
