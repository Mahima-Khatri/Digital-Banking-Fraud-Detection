import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8082/api"
});

export const authAPI = {
    login: (data) => API.post("/auth/login", data),
    signup: (data) => API.post("/auth/signup", data)
};

export const transactionAPI = {
    getAll: () => API.get("/transactions"),
    create: (data) => API.post("/transactions", data),
    createBatch: (data) => API.post("/transactions/batch", data),
    generate: (count) => API.post(`/transactions/generate?count=${count}`),
    clearAll: () => API.delete("/transactions")
};

export const settingsAPI = {
    getEmailAlertStatus: () => API.get("/transactions/settings/email-alerts"),
    toggleEmailAlert: (enabled) => API.post(`/transactions/settings/email-alerts?enabled=${enabled}`)
};

export const auditAPI = {
    log: (entry) => API.post("/audit/log", entry),
    getLogs: (limit = 100) => API.get(`/audit/logs?limit=${limit}`),
    clearLogs: () => API.delete("/audit/logs")
};

export const userAPI = {
    getAll: () => API.get("/users"),
    create: (data) => API.post("/users", data),
    update: (id, data) => API.put(`/users/${id}`, data),
    delete: (id) => API.delete(`/users/${id}`)
};

export const contactAPI = {
    sendRequest: (data) => API.post("/contact/request", data),
    getRequests: () => API.get("/contact/requests"),
    updateStatus: (id, status, adminResponse = null) => 
        API.put(`/contact/requests/${id}/status`, { status, adminResponse }),
    markAsRead: (id) => API.put(`/contact/requests/${id}/read`),
    delete: (id) => API.delete(`/contact/requests/${id}`)
};