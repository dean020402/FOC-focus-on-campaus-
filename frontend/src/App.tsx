import { useHealth } from './hooks/useHealth'

export default function App() {
  const { data, isPending, isError, error } = useHealth()

  if (isPending) {
    return <main className="p-4">backend: loading</main>
  }

  if (isError) {
    return (
      <main className="p-4">
        backend: error ({error instanceof Error ? error.message : 'unknown'})
      </main>
    )
  }

  if (!data) {
    return <main className="p-4">backend: empty</main>
  }

  return <main className="p-4">backend: {data.status}</main>
}
