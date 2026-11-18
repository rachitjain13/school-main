
import {
  School,
  MapPin,
  GraduationCap,
  Users,
  CalendarDays,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

import type { School as SchoolType } from "../../types/school.types";

interface SchoolOverviewProps {
  school: SchoolType;
}

export default function SchoolOverview({
  school,
}: SchoolOverviewProps) {
  const statusColors = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    SUSPENDED: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">

      {/* School information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <School size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              School Information
            </h2>
            <p className="text-sm text-slate-500">
              Basic institution details
            </p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="School Name" value={school.name} />

          <InfoItem label="School ID" value={school.id} />

          <InfoItem label="School Code" value={school.code} />

          <InfoItem
            label="City"
            value={school.city}
            icon={<MapPin size={15} />}
          />

          <InfoItem label="State" value={school.state} />

          <InfoItem
            label="Registration Date"
            value={new Date(
              `${school.createdAt}T00:00:00`
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            icon={<CalendarDays size={15} />}
          />
        </div>
      </section>

      {/* People information */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <MetricCard
          title="Total Students"
          value={school.students.toLocaleString("en-IN")}
          description="Registered students"
          icon={<GraduationCap size={23} />}
          color="blue"
        />

        <MetricCard
          title="Total Teachers"
          value={school.teachers.toLocaleString("en-IN")}
          description="Registered teachers"
          icon={<Users size={23} />}
          color="violet"
        />
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
            <CreditCard size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Subscription Information
            </h2>
            <p className="text-sm text-slate-500">
              Current subscription configuration
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Current Plan
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-900">
              {school.plan}
            </h3>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Account Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusColors[school.status]}`}
            >
              {school.status}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Billing amount, renewal date and payment history will be
          displayed after subscription API integration.
        </p>
      </section>

      {/* Account status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={22} className="text-emerald-600" />

          <div>
            <h2 className="font-bold text-slate-900">
              Account Information
            </h2>

            <p className="text-sm text-slate-500">
              Current school account state
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <span className="text-sm text-slate-600">
            School account status
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusColors[school.status]}`}
          >
            {school.status}
          </span>
        </div>
      </section>

    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        {icon && <span className="text-slate-400">{icon}</span>}
        {value}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "violet";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}
