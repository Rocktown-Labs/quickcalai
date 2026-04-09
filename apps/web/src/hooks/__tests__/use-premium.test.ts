import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePremium } from '@/hooks/use-premium'

// Mock Clerk
const mockHas = vi.fn()

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    has: mockHas,
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
  }),
}))

describe('usePremium', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  it('should return premium status when Clerk has premium plan', async () => {
    mockHas.mockReturnValue(true) // Has premium plan

    const { result } = renderHook(() => usePremium())

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should return free status when Clerk has no premium access', async () => {
    mockHas.mockReturnValue(false) // No premium access

    const { result } = renderHook(() => usePremium())

    await waitFor(() => {
      expect(result.current.isPremium).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle loading state', async () => {
    mockHas.mockReturnValue(false)

    const { result } = renderHook(() => usePremium())

    // Should start as loading, then complete when no user is present
    expect(result.current.isPremium).toBe(false)

    // Wait for loading to complete (should be false since no user)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should provide refresh function', () => {
    const { result } = renderHook(() => usePremium())

    expect(typeof result.current.refreshStatus).toBe('function')
  })
})
