import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3001/api",
})

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("API 401 Unauthorized:", error?.config?.url)
    }
    return Promise.reject(error)
  }
)

export default api
