export async function syncUserProfileFromBackend() {
  try {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt");

    const apiBase =
      import.meta.env.VITE_API_URL ||
      "http://localhost:3001/api";

    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${apiBase}/user/profile`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      return null;
    }

    const profile = await res.json();

    if (profile) {
      const oldUserRaw = localStorage.getItem("user");
      let oldUser = {};

      try {
        oldUser = oldUserRaw ? JSON.parse(oldUserRaw) : {};
      } catch {
        oldUser = {};
      }

      const mergedUser = {
        ...oldUser,
        ...profile,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    }

    return null;
  } catch {
    return null;
  }
}
