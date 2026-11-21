
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  School,
  CheckCircle2,
  Clock,
  Ban,
  RefreshCw,
  MapPin,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

import {
  getDashboardData,
  type DashboardData,
  type DashboardSchool,
  type SchoolStatus,
} from "./services/dashboard.service";

const statusLabels: Record<SchoolStatus, string> = {
  provisioning: "Provisioning",
  provisioning_failed: "Provisioning Failed",
  admin_invited: "Admin Invited",
  onboarding: "Onboarding",
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
};

const statusStyles: Record<SchoolStatus, string> = {
  provisioning: "bg-blue-50 text-blue-700",
  provisioning_failed: "bg-red-50 text-red-700",
  admin_invited: "bg-amber-50 text-amber-700",
  onboarding: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  archived: "bg-slate-100 text-slate-600",
};

function formatDate(date: string) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof School;
  color: "blue" | "emerald" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value.toLocaleString("en-IN")}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function RecentSchools({
  schools,
  navigate,
}: {
  schools: DashboardSchool[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h3 className="font-bold text-slate-900">
            Recent Schools
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Latest schools registered on the platform
          </p>
        </div>

        <button
          onClick={() => navigate("/schools")}
          className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">School</th>
              <th className="px-5 py-4 font-semibold">School ID</th>
              <th className="px-5 py-4 font-semibold">Registered</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {schools.map((school) => (
              <tr
                key={school._id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {school.schoolName}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />
                    {school.address?.city || "—"},{" "}
                    {school.address?.state || "—"}
                  </p>
                </td>

                <td className="px-5 py-4 font-medium text-slate-600">
                  {school.schoolId}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {formatDate(school.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      statusStyles[school.status]
                    }`}
                  >
                    {statusLabels[school.status] || school.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button
                    onClick={() =>
                      navigate(`/schools/${school.schoolId}`)
                    }
                    title="View school"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {schools.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-slate-400"
                >
                  No registered schools found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await getDashboardData();
      setDashboard(result);
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        apiError.response?.data?.message ||
          (err instanceof Error
            ? err.message
            : "Unable to load dashboard data.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      {/* Dashboard heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor and manage your entire school management platform.
          </p>
        </div>

        <button
          onClick={() => void loadDashboard(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to load dashboard
            </p>
            <p className="mt-1">{error}</p>
          </div>

          <button
            onClick={() => void loadDashboard(true)}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={dashboard?.totalSchools ?? 0}
          description="All registered school records"
          icon={School}
          color="blue"
        />

        <StatCard
          title="Active Schools"
          value={dashboard?.activeSchools ?? 0}
          description="Schools currently active"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Onboarding"
          value={dashboard?.pendingOnboarding ?? 0}
          description="Provisioning and invitation stages"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Suspended Schools"
          value={dashboard?.suspendedSchools ?? 0}
          description="Currently suspended schools"
          icon={Ban}
          color="red"
        />
      </section>

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <RefreshCw
            size={22}
            className="mx-auto mb-3 animate-spin text-blue-600"
          />
          Loading live platform data...
        </div>
      )}

      {/* Recent schools */}
      {!loading && dashboard && (
        <section>
          <RecentSchools
            schools={dashboard.recentSchools}
            navigate={navigate}
          />
        </section>
      )}

      {/* Data source note */}
      <div className="flex items-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
        <CheckCircle2 size={15} className="text-emerald-500" />
        Dashboard statistics and recent schools are fetched from the backend.
      </div>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        EduControl Super Admin Portal · Platform Management
      </footer>
    </div>
  );
}
