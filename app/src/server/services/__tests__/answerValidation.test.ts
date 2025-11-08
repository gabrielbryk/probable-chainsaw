import { describe, it, expect } from 'vitest'
import { normalizeAnswer, answersMatch } from '../answerValidation.js'

describe('answerValidation', () => {
  it('normalizes casing and whitespace', () => {
    expect(normalizeAnswer('  Spiral  ')).toBe('spiral')
    expect(normalizeAnswer('\tLARIMAR\n')).toBe('larimar')
  })

  it('matches equivalent answers ignoring case/space', () => {
    expect(answersMatch(' Spiral ', 'spiral')).toBe(true)
    expect(answersMatch('larimar', 'LARIMAR')).toBe(true)
    expect(answersMatch('ocean', 'spiral')).toBe(false)
  })
})
