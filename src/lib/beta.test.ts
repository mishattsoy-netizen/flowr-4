import { describe, it, expect } from 'vitest'
import { generateInviteToken } from './beta'

describe('generateInviteToken', () => {
  it('returns a 24-character string', () => {
    const token = generateInviteToken()
    expect(token).toHaveLength(24)
  })

  it('returns only URL-safe characters', () => {
    const token = generateInviteToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('returns a different token each call', () => {
    expect(generateInviteToken()).not.toBe(generateInviteToken())
  })
})
