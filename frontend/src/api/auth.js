import api from "./axiosInstance";

export async function login(email, password) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const token = res.data?.access_token || res.data?.token;

  if (token) {
    localStorage.setItem("access_token", token);
    localStorage.setItem("token", token);
  }

  if (res.data?.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
}

export async function register(data) {
  const res = await api.post("/auth/register", data);
  return res.data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
