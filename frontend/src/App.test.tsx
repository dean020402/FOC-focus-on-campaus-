import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

vi.mock('./api/health', () => ({
  fetchHealth: vi.fn(() =>
    Promise.resolve({ status: 'ok', version: '0.1.0' }),
  ),
}))

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  it('shows backend: ok when health succeeds', async () => {
    renderApp()
    expect(await screen.findByText('backend: ok')).toBeInTheDocument()
  })
})
