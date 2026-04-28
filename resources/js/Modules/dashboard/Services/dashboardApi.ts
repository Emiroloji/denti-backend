// src/modules/dashboard/Services/dashboardApi.ts

import { api } from '@/Services/api'
import { DashboardStats } from '../Types/dashboard.types'

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats')
}
