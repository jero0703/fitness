import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fittrack_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry and 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid clearing/redirecting on failed login attempts
      if (!error.config?.url?.includes("/auth/login")) {
        localStorage.removeItem("fittrack_token");
        localStorage.removeItem("fittrack_user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const workoutsAPI = {
  getAll: (params) => api.get("/workouts/", { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post("/workouts/", data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
};

export const progressAPI = {
  getDaily: (target_date) => api.get("/progress/daily", { params: { target_date } }),
  getWeekly: (end_date) => api.get("/progress/weekly", { params: { end_date } }),
  getMonthly: (year, month) => api.get("/progress/monthly", { params: { year, month } }),
};

export const goalsAPI = {
  getAll: () => api.get("/goals/"),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post("/goals/", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

export const analyticsAPI = {
  getWeekly: () => api.get("/analytics/weekly"),
  getMonthly: () => api.get("/analytics/monthly"),
  getCalories: (days = 14) => api.get("/analytics/calories", { params: { days } }),
  getCategories: () => api.get("/analytics/categories"),
};

export const notificationsAPI = {
  getAll: (limit = 50) => api.get("/notifications/", { params: { limit } }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  triggerReminders: () => api.post("/notifications/trigger-reminders"),
};

export const plansAPI = {
  getAll: (params) => api.get("/workout-plans/", { params }),
  getUpcoming: (limit = 10) => api.get("/workout-plans/upcoming", { params: { limit } }),
  getById: (id) => api.get(`/workout-plans/${id}`),
  create: (data) => api.post("/workout-plans/", data),
  update: (id, data) => api.put(`/workout-plans/${id}`, data),
  delete: (id) => api.delete(`/workout-plans/${id}`),
  convert: (id, data) => api.post(`/workout-plans/${id}/convert`, data),
};

export const exercisesAPI = {
  getAll: (params) => api.get("/exercises/", { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post("/exercises/", data),
};

export const streakAPI = {
  get: () => api.get("/streak/"),
  sync: () => api.post("/streak/sync"),
};

export const badgesAPI = {
  getAll: () => api.get("/badges/"),
  check: () => api.post("/badges/check"),
};

export const comparisonAPI = {
  getWeekly: () => api.get("/comparison/weekly"),
  getMonthly: () => api.get("/comparison/monthly"),
};

export default api;
