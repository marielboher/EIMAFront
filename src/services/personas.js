import { http } from '../lib/http'

export async function getPersonas({ signal } = {}) {
  const res = await http.get('/api/Personas', { signal })
  return res.data
}

