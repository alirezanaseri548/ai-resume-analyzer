import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/user";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!summary) return <div className="p-6 text-white">Loading dashboard...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded bg-slate-800">
          <p className="text-sm text-slate-300">Total Resumes</p>
          <p className="text-2xl font-bold">{summary.totalResumes}</p>
        </div>
        <div className="p-4 rounded bg-slate-800">
          <p className="text-sm text-slate-300">Analyzed</p>
          <p className="text-2xl font-bold">{summary.analyzedResumes}</p>
        </div>
        <div className="p-4 rounded bg-slate-800">
          <p className="text-sm text-slate-300">Average ATS</p>
          <p className="text-2xl font-bold">{summary.avgAtsScore}</p>
        </div>
      </div>

      <div className="rounded bg-slate-800 p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        {summary.recentActivity?.length ? (
          <ul className="space-y-2">
            {summary.recentActivity.map((item) => (
              <li key={item.id} className="border-b border-slate-700 pb-2">
                <div className="font-medium">{item.eventType} - {item.fileName}</div>
                <div className="text-sm text-slate-400">{new Date(item.createdAt).toLocaleString()}</div>
                <div className="text-sm text-slate-300">{item.details || "-"}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    </div>
  );
}
