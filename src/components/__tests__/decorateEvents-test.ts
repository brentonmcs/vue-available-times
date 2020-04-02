import 'jest'
import decorateEvents from '../decorateEvents'
import { Event } from '../models'

it('does not mutate the original event', () => {
  const event = {
    start: new Date(0),
    end: new Date(100),
    allDay: false,
    calendarId: '',
  }
  const newEvent = decorateEvents([event])[0]
  expect(newEvent).not.toBe(event)
})

it('can handle dates that are ISO strings', () => {
  const events: Event[] = [
    {
      start: new Date(0).toISOString(),
      end: new Date(100).toISOString(),
      allDay: false,
      calendarId: '',
    },
  ]
  expect(decorateEvents(events)).toEqual([
    {
      allDay: false,
      calendarId: '',
      start: new Date(0),
      end: new Date(100),
      offset: 0,
      width: 1,
    },
  ])
})

it('does not add overlap hints when no overlap exists', () => {
  const overlapped = decorateEvents([
    {
      start: new Date(0),
      end: new Date(100),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(101),
      end: new Date(200),
      allDay: false,
      calendarId: '',
    },
  ])
  expect(overlapped.length).toEqual(2)
  expect(overlapped[0]).toEqual({
    start: new Date(0),
    end: new Date(100),
    offset: 0,
    width: 1,
    allDay: false,
    calendarId: '',
  })
  expect(overlapped[1]).toEqual({
    start: new Date(101),
    end: new Date(200),
    offset: 0,
    width: 1,
    allDay: false,
    calendarId: '',
  })
})

it('adds overlap hints when overlaps exist', () => {
  const overlapped = decorateEvents([
    {
      start: new Date(0),
      end: new Date(300),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(101),
      end: new Date(240),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(150),
      end: new Date(220),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(250),
      end: new Date(350),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(400),
      end: new Date(500),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(500),
      end: new Date(600),
      allDay: false,
      calendarId: '',
    },
    {
      start: new Date(500),
      end: new Date(600),
      allDay: true, // Should not be grouped
      calendarId: '',
    },
  ])

  expect(overlapped.length).toEqual(7)
  expect(overlapped[0]).toEqual({
    start: new Date(0),
    end: new Date(300),
    width: 1 / 3,
    offset: 0,
    allDay: false,
    calendarId: '',
  })
  expect(overlapped[1]).toEqual({
    start: new Date(101),
    end: new Date(240),
    width: 1 / 3,
    offset: 1 / 3,
    allDay: false,
    calendarId: '',
  })
  expect(overlapped[2]).toEqual({
    start: new Date(150),
    end: new Date(220),
    width: 1 / 3,
    offset: 2 / 3,
    allDay: false,
    calendarId: '',
  })
  expect(overlapped[3]).toEqual({
    start: new Date(250),
    end: new Date(350),
    width: 2 / 3,
    offset: 1 / 3,
    allDay: false,
    calendarId: '',
  })
  expect(overlapped[4]).toEqual({
    start: new Date(400),
    end: new Date(500),
    width: 1,
    offset: 0,
    allDay: false,
    calendarId: '',
  })
  expect(overlapped[5].offset).toEqual(0)
  expect(overlapped[5].width).toEqual(1)
})
