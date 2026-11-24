
import axios from "axios";

axios.defaults.baseURL =   process.env.REACT_APP_API_URL || "http://localhost:5065";

// הוספת הטוקן לבקשות
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// טיפול בשגיאות
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/")
    ) {
      sessionStorage.removeItem("token");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

const service = {
  register: async (username, password) => {
    const response = await axios.post("/auth/register", {
      username,
      password
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await axios.post("/auth/login", {
      username,
      password
    });

    sessionStorage.setItem("token", response.data.token);
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem("token");
    window.location.replace("/login");
  },

  getTasks: async () => {
    const response = await axios.get("/items");
    return response.data;
  },

  addTask: async (name) => {
    if (!name || !name.trim()) return;

    const response = await axios.post("/items", {
      name: name.trim(),
      isComplete: false
    });

    return response.data;
  },

  setCompleted: async (id, isComplete) => {
    await axios.put(`/items/${id}`, { isComplete });
  },

  deleteTask: async (id) => {
    await axios.delete(`/items/${id}`);
  }
};

export default service;
