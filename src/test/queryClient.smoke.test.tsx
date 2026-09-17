import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function Probe() {
  const { data } = useQuery({
    queryKey: ['probe'],
    queryFn: async () => 'ok',
  })
  return <div>status: {data ?? 'loading'}</div>
}

describe('QueryClientProvider setup', () => {
  it('lets a component call useQuery without a missing-context error', async () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <Probe />
      </QueryClientProvider>,
    )

    await waitFor(() => expect(screen.getByText('status: ok')).toBeInTheDocument())
  })
})
