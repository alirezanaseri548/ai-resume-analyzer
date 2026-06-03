import api from "./api"

export async function getResumes() {
  const res = await api.get("/resumes")
  return res.data
}

export async function uploadResume(file) {
  const formData = new FormData()
  formData.append("file", file)

  const res = await api.post("/resumes/upload", formData)
  return res.data
}

export async function analyzeResume(resumeId) {
  const res = await api.post(`/resumes/${resumeId}/analyze`)
  return res.data
}

export async function getLatestAnalysis() {
  const res = await api.get("/resumes/analysis/latest")
  return res.data
}

export async function getHistory() {
  const res = await api.get("/resumes/history/all")
  return res.data
}
