import api from './api'
const resources = ['overview', 'universities', 'majors', 'tuition', 'admissions', 'users', 'ai-data']
export async function getAdminData(resource, params, signal) {
  if (!resources.includes(resource)) throw new Error('Mục quản trị không hợp lệ')
  const { data } = await api.get(`/admin/${resource}`, { params, signal })
  return data
}
