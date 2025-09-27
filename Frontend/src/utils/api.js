import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getSocialAccounts: () => api.get("/users/social-accounts"),
  deleteAccount: (password) =>
    api.delete("/users/account", { data: { password } }),
};

// Social Media API
export const socialAPI = {
  getAccounts: () => api.get("/social"),
  getTwitterAuth: () => api.get("/social/twitter/auth"),
  getLinkedInAuth: () => api.get("/social/linkedin/auth"),
  getInstagramAuth: () => api.get("/social/instagram/auth"),
  disconnectAccount: (platform) => api.delete(`/social/${platform}`),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  createConversation: (data) => api.post("/chat/conversations", data),
  updateConversation: (id, data) => api.put(`/chat/conversations/${id}`, data),
  deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
  generateContent: (data) => api.post("/chat/generate-content", data),
};

// Posts API
export const postsAPI = {
  schedulePost: (data) => api.post("/posts/schedule", data),
  getScheduledPosts: (params) => api.get("/posts/scheduled", { params }),
  getCalendarPosts: (params) => api.get("/posts/calendar", { params }),
  getScheduledPost: (id) => api.get(`/posts/scheduled/${id}`),
  updateScheduledPost: (id, data) => api.put(`/posts/scheduled/${id}`, data),
  deleteScheduledPost: (id) => api.delete(`/posts/scheduled/${id}`),
  postNow: (data) => api.post("/posts/post-now", data),
  getStats: () => api.get("/posts/stats"),
};

// Combined API object for easier imports
export const apiClient = {
  // HTTP methods
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),

  // Auth methods
  register: (userData) => authAPI.register(userData),
  login: (credentials) => authAPI.login(credentials),
  logout: () => authAPI.logout(),
  getMe: () => authAPI.getMe(),

  // User methods
  getProfile: () => usersAPI.getProfile(),
  updateProfile: (data) => usersAPI.updateProfile(data),

  // Social media methods
  getSocialAccounts: () => socialAPI.getAccounts(),
  connectSocialAccount: (platform) => socialAPI.getTwitterAuth(), // Mock for now
  disconnectSocialAccount: (accountId) =>
    socialAPI.disconnectAccount(accountId),

  // Chat methods
  chatWithAI: (message) => chatAPI.generateContent({ prompt: message }),

  // Posts methods
  getPosts: () => postsAPI.getScheduledPosts(),
  createPost: (data) => postsAPI.schedulePost(data),
  updatePost: (id, data) => postsAPI.updateScheduledPost(id, data),
  deletePost: (id) => postsAPI.deleteScheduledPost(id),
  getStats: () => postsAPI.getStats(),
};

export { apiClient as api };

export default api;
