import momentTimezone from 'moment-timezone'
import moment from 'moment'

export default function dateIntervalString(
  fromDate: Date | moment.Moment,
  toDate: Date | moment.Moment,
  timeZone = ''
) {
  const from = momentTimezone.tz(fromDate, timeZone)
  const to = momentTimezone.tz(toDate, timeZone)
  if (from.month() === to.month()) {
    return [
      from.format('MMM D'),
      '–', // en dash
      to.format('D'),
    ].join(' ')
  }
  return [
    from.format('MMM D'),
    '–', // en dash
    to.format('MMM D'),
  ].join(' ')
}
