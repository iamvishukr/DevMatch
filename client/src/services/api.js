import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:3001"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        window.location.href = "/login";
      } else {
        toast.error(data?.message || "Something went wrong!");
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
};

export const userAPI = {
  getReceivedRequests: () => api.get("/user/requests/received"),
  getConnections: () => api.get("/user/connections"),
  getFeed: (page = 1, limit = 10) =>
    api.get(`/feed?page=${page}&limit=${limit}`),
};

export const chatAPI = {
  getMessages: (userId) => fetch(`/chat/${userId}`).then(res => res.json()),
  sendMessage: (userId, text) => fetch(`/chat/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then(res => res.json()),
  getChats: () => fetch(`/chat`).then(res => res.json()),
};


export default api;
