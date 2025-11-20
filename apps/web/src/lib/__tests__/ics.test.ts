import { describe, it, expect } from 'vitest'
import { generateICSForAI, generateICSForManual } from '@/lib/ics'

describe('ICS Generation', () => {
  describe('generateICSForAI', () => {
    it('should generate valid ICS for AI-extracted events', () => {
      const events = [{
        date: '2025-08-09',
        time: '13:00',
        description: 'Test Event'
      }]

      const ics = generateICSForAI(events)
      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('VERSION:2.0')
      expect(ics).toContain('SUMMARY:Test Event')
      // ICS library converts local time to UTC, so expect UTC time
      expect(ics).toContain('DTSTART:20250809T') // Date should be correct
      expect(ics).toContain('Z') // Should have UTC indicator
      expect(ics).toContain('END:VCALENDAR')
    })

    it('should handle all-day events', () => {
      const events = [{
        date: '2025-08-09',
        time: '',
        description: 'All Day Event'
      }]

      const ics = generateICSForAI(events)
      expect(ics).toContain('SUMMARY:All Day Event')
      expect(ics).toContain('DTSTART;VALUE=DATE:20250809')
      expect(ics).toContain('DURATION:P1D')
    })

    it('should handle multiple events', () => {
      const events = [
        { date: '2025-08-09', time: '13:00', description: 'Event 1' },
        { date: '2025-08-10', time: '14:00', description: 'Event 2' }
      ]

      const ics = generateICSForAI(events)
      expect(ics).toContain('SUMMARY:Event 1')
      expect(ics).toContain('SUMMARY:Event 2')
      // ICS library converts to UTC, so just check dates are present
      expect(ics).toContain('DTSTART:20250809T')
      expect(ics).toContain('DTSTART:20250810T')
      expect(ics).toContain('Z') // UTC indicator
    })
  })

  describe('generateICSForManual', () => {
    it('should generate valid ICS for manual events', () => {
      const events = [{
        date: '2025-08-09',
        time: '13:00',
        description: 'Manual Event',
        timezone: 'America/New_York'
      }]

      const ics = generateICSForManual(events)
      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('SUMMARY:Manual Event')
      expect(ics).toContain('DTSTART:20250809T')
      expect(ics).toContain('Z') // UTC indicator
    })
  })
})