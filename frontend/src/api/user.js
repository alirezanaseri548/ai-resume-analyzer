const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function sendVerificationEmail() {
  const res = await fetch(`${API_BASE}/auth/send-verification-email`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to send verification email");
  return res.json();
}

export async function verifyEmail(token) {
  const res = await fetch(`${API_BASE}/auth/verify-email?token=${token}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to verify email");
  return res.json();
}

export async function getDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

export async function getMySkills() {
  const res = await fetch(`${API_BASE}/skills/my`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch skills");
  return res.json();
}

