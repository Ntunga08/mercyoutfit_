import api from './axios'

export const reportsApi = {
  summary: () => api.get('summary/'),
  bestSellers: (days = 30) => api.get('best-sellers/', { params: { days } }),
  dailyTrend: (days = 14) => api.get('daily-trend/', { params: { days } }),
}
