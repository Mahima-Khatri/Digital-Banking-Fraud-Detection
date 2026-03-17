import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Hybrid Detection API
export const hybridAPI = {
  checkTransaction: (data) => api.post('/hybrid/check-realtime', data),
  getAnalytics: () => api.get('/hybrid/analytics'),
  healthCheck: () => api.get('/hybrid/health')
}

// Analyst API
export const analystAPI = {
  performAction: (data) => api.post('/analyst/action', data),
  getTransactions: (params) => api.get('/analyst/transactions', { params }),
  getTransactionDetails: (transactionId) => api.get(`/analyst/transaction/${transactionId}`),
  getAlerts: () => api.get('/analyst/alerts'),
  markAlertRead: (alertId, analystUsername) => 
    api.post(`/analyst/alerts/${alertId}/read`, null, { params: { analystUsername } }),
  getUserProfile: (userId) => api.get(`/analyst/profile/${userId}`),
  getMyActions: (analystUsername) => api.get(`/analyst/my-actions/${analystUsername}`),
  getConfusionMatrix: () => api.get('/analyst/confusion-matrix')
}

export default api
