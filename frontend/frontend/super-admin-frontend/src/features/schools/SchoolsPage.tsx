
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  School,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import SchoolFormModal from "./components/SchoolFormModal";

import {
  createSchoolDraft,
  confirmSchoolDraft,
  getSchools,
  type BackendSchool,
  type BackendSchoolStatus,
} from "./services/school.service";

const statusLabels: Record<BackendSchoolStatus, string> = {
  provisioning: "Provisioning",
  provisioning_failed: "Provisioning Failed",
  admin_invited: "Admin Invited",
  onboarding: "Onboarding",
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
};

const statusStyles: Record<BackendSchoolStatus, string> = {
  provisioning: "bg-blue-50 text-blue-700",
  provisioning_failed: "bg-red-50 text-red-700",
  admin_invited: "bg-amber-50 text-amber-700",
  onboarding: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  archived: "bg-slate-100 text-slate-600",
};

const statusOptions: {
  label: string;
  value: BackendSchoolStatus | "all";
}[] = [
  { label: "All Status", value: "all" },
  { label: "Provisioning", value: "provisioning" },
  { label: "Provisioning Failed", value: "provisioning_failed" },
  { label: "Admin Invited", value: "admin_invited" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Archived", value: "archived" },
];

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SchoolsPage() {
  const navigate = useNavigate();

  const [schools, setSchools] = useState<BackendSchool[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<BackendSchoolStatus | "all">("all");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSchools = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const result = await getSchools({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status:
            statusFilter === "all"
              ? undefined
              : statusFilter,
          sortOrder: "desc",
        });

        setSchools(result.schools);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        console.error("School list loading failed:", err);

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
              : "Unable to load school records.")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  async function handleSaveSchool(
    data: Parameters<typeof createSchoolDraft>[0]
  ) {
    if (saving) return;

    setSaving(true);
    setError("");
    setActionMessage("");

    try {
      const draft = await createSchoolDraft(data);

      setShowModal(false);

      const shouldConfirm = window.confirm(
        `School draft saved successfully!\n\n` +
          `School: ${draft.schoolName}\n` +
          `Draft ID: ${draft._id}\n\n` +
          `Do you want to confirm this school and start database provisioning?`
      );

      if (!shouldConfirm) {
        setActionMessage(
          "Draft saved successfully. It has not been confirmed yet."
        );
        return;
      }

      const confirmedSchool = await confirmSchoolDraft(draft._id);

      setActionMessage(
        `School ${confirmedSchool.schoolId} confirmed. Provisioning has been queued.`
      );

      setPage(1);

      // Reload the current page to display the confirmed school.
      const result = await getSchools({
        page: 1,
        limit: 10,
        search: search.trim() || undefined,
        status:
          statusFilter === "all"
            ? undefined
            : statusFilter,
        sortOrder: "desc",
      });

      setSchools(result.schools);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error("School creation/confirmation failed:", err);

      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message =
        apiError.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Unable to process school registration.");

      setError(message);
      window.alert(message);
    } finally {
      setSaving(false);
    }
  }

  const startRecord = total === 0 ? 0 : (page - 1) * 10 + 1;
  const endRecord = Math.min(page * 10, total);

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Platform</span>
            <span>/</span>
            <span className="text-blue-600">Schools</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            School Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and monitor all registered schools.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setActionMessage("");
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={19} />
          Add New School
        </button>
      </div>

      {/* Success message */}
      {actionMessage && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={19} className="shrink-0" />
            <p>{actionMessage}</p>
          </div>

          <button
            onClick={() => setActionMessage("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle size={19} className="shrink-0" />
            <p>{error}</p>
          </div>

          <button
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={total}
          description="Matching registered school records"
          icon={School}
          color="blue"
        />

        <StatCard
          title="Active Schools"
          value={schools.filter((s) => s.status === "active").length}
          description="Active on this page"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Onboarding"
          value={schools.filter((s) =>
            ["provisioning", "provisioning_failed", "onboarding", "admin_invited"].includes(s.status)
          ).length}
          description="Pending on this page"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Suspended Schools"
          value={schools.filter((s) => s.status === "suspended").length}
          description="Suspended on this page"
          icon={AlertCircle}
          color="red"
        />
      </section>

      <p className="text-xs text-slate-400">
        Status cards above show the currently loaded page. The Total Schools
        card uses the backend's full matching record count.
      </p>

      {/* Registered schools */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Table controls */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Registered Schools
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {schools.length} records from {total} matching schools
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-64">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search school or ID..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Filter size={16} className="text-slate-400" />

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as BackendSchoolStatus | "all"
                  );
                  setPage(1);
                }}
                className="bg-transparent py-2.5 text-sm text-slate-600 outline-none"
                aria-label="Filter by school status"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => void loadSchools(true)}
              disabled={loading || refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* School table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">School</th>
                <th className="px-5 py-4 font-semibold">School ID</th>
                <th className="px-5 py-4 font-semibold">Main Admin</th>
                <th className="px-5 py-4 font-semibold">Location</th>
                <th className="px-5 py-4 font-semibold">Registered</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <RefreshCw
                      size={25}
                      className="mx-auto animate-spin text-blue-600"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading schools from database...
                    </p>
                  </td>
                </tr>
              ) : schools.map((school) => (
                <tr
                  key={school._id}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <School size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {school.schoolName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {school.officialEmail || "No official email"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-600">
                    {school.schoolId}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">
                      {school.mainAdmin?.fullName || "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {school.mainAdmin?.email || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {school.address?.city || "—"},{" "}
                      {school.address?.state || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(school.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                        statusStyles[school.status]
                      }`}
                    >
                      {statusLabels[school.status] || school.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      title="View school details"
                      onClick={() =>
                        navigate(`/schools/${school.schoolId}`, {
                          state: { school },
                        })
                      }
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && schools.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <School
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      No schools found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or status filter.
                    </p>

                    <button
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPage(1);
                      }}
                      className="mt-4 text-sm font-semibold text-blue-600"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <span className="text-xs text-slate-500">
            Showing {startRecord}–{endRecord} of {total} schools
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="px-2 text-sm text-slate-600">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Registration modal */}
      {showModal && (
        <SchoolFormModal
          onClose={() => {
            if (!saving) setShowModal(false);
          }}
          onSubmit={handleSaveSchool}
        />
      )}
    </div>
  );
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

      <h3 className="mt-5 text-2xl font-bold text-slate-900">
        {value.toLocaleString("en-IN")}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}
