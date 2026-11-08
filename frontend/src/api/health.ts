import { apiGet } from './client'

export function fetchHealth() {
  return apiGet<{ status: string; version: string }>('/health')
}
