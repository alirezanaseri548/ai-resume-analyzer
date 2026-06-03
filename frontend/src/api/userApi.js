import api from "./api"

export async function getProfile() {
  const res = await api.get("/users/profile")
  return res.data
}

export async function updateProfile(data) {
  const res = await api.patch("/users/profile", data)
  return res.data
}
