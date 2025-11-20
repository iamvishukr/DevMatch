import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`❌ ${error.config.method?.toUpperCase()} ${error.config.url} - ${status}`);

      if (status === 401) {
        // window.location.href = "/login";
      } else {
        toast.error(data?.error || data?.message || "Something went wrong!");
      }
    } else {
      toast.error("Network error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  initiateSignup: (data) => api.post("/signup/initiate", data),
  verifyOtp: (data) => api.post("/verifyOtp", data),
  login: (data) => api.post("/login", data),
  logout: () => api.post("/logout"),
};

export const profileAPI = {
  getProfile: () => api.get("/profile/view"),
  updateProfile: (data) => api.patch("/profile/edit", data),
};

export const requestAPI = {
  sendRequest: (status, toUserId) =>
    api.post(`/request/send/${status}/${toUserId}`),
  reviewRequest: (status, requestId) =>
    api.post(`/request/review/${status}/${requestId}`),
  getReceivedRequests: () => api.get("/user/requests/received"),
};

export const userAPI = {
  getReceivedRequests: () => api.get("/user/requests/received"),
  getConnections: () => api.get("/user/connections"),
  getFeed: (page = 1, limit = 10) =>
    api.get(`/feed?page=${page}&limit=${limit}`),
};

export const chatAPI = {
  getMessages: (userId) => api.get(`/api/chats/${userId}`).then(res => res.data),
  sendMessage: (userId, text) => 
    api.post(`/api/chats/${userId}/message`, { text }).then(res => res.data),
  getChats: () => api.get(`/api/chats`).then(res => res.data),
  getChatsWithLastMessage: () => api.get(`/api/chats-with-last-message`).then(res => res.data),
  deleteMessage: (id) => api.delete(`/api/messages/${id}`).then(res => res.data),
  toggleBlock: (userId) => api.post(`/api/chats/${userId}/block`).then(res => res.data),
  unblock: (userId) => api.post(`/api/chats/${userId}/unblock`).then(res => res.data),
};

export default api;