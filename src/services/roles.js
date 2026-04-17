import { http } from '../lib/http'

export async function getRoles({ signal } = {}) {
  const res = await http.get('/api/Roles', { signal })
  return res.data
}
