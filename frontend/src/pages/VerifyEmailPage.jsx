import { useEffect, useState } from "react";
import { verifyEmail } from "../api/user";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage("Missing token");
      return;
    }

    verifyEmail(token)
      .then((res) => setMessage(res.message || "Email verified"))
      .catch((e) => setMessage(e.message));
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-3">Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}
