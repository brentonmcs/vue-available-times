import momentTimezone from 'moment-timezone'

export default function inSameDay(dateA: Date, dateB: Date, timeZone: string) {
  return (
    momentTimezone.tz(dateA, timeZone).format('YYYYMMDD') ===
    momentTimezone.tz(dateB, timeZone).format('YYYYMMDD')
  )
}
