import { useEffect, useState } from "react";
import { getMe, sendVerificationEmail } from "../api/user";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((e) => setMessage(e.message));
  }, []);

  const handleVerify = async () => {
    try {
      const result = await sendVerificationEmail();
      setMessage(result.verifyLink ? `Dev link: ${result.verifyLink}` : "Verification email sent.");
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!user) return <div className="p-6 text-white">Loading settings...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-2">
        <p><strong>Full Name:</strong> {user.fullName || "N/A"}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Email Status:</strong> {user.emailVerified ? "Verified" : "Not Verified"}</p>

        {!user.emailVerified && (
          <button
            onClick={handleVerify}
            className="mt-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Verify Email
          </button>
        )}

        {message && <p className="mt-3 text-sm text-yellow-300">{message}</p>}
      </div>
    </div>
  );
}
