import { useEffect, useState } from "react";
import { verifyEmail } from "../api/user";

export default function VerifyEmailPage() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [message, setMessage] = useState(() =>
    token ? "Verifying..." : "Missing token",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token)
      .then((res) => setMessage(res.message || "Email verified"))
      .catch((e) => setMessage(e.message));
  }, [token]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-3">Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}
