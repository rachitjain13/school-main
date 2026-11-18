
import {
  School,
  Users,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MoreHorizontal,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  {
    title: "Total Schools",
    value: "248",
    change: "+12.5%",
    description: "Compared to last month",
    icon: School,
    positive: true,
    color: "blue",
  },
  {
    title: "Total Students",
    value: "86,420",
    change: "+8.2%",
    description: "Compared to last month",
    icon: GraduationCap,
    positive: true,
    color: "violet",
  },
  {
    title: "Total Teachers",
    value: "5,840",
    change: "+4.6%",
    description: "Compared to last month",
    icon: Users,
    positive: true,
    color: "emerald",
  },
  {
    title: "Monthly Revenue",
    value: "₹12.8L",
    change: "-2.4%",
    description: "Compared to last month",
    icon: IndianRupee,
    positive: false,
    color: "orange",
  },
];

const revenueData = [
  { month: "Jan", revenue: 5.2 },
  { month: "Feb", revenue: 6.8 },
  { month: "Mar", revenue: 5.9 },
  { month: "Apr", revenue: 8.1 },
  { month: "May", revenue: 7.4 },
  { month: "Jun", revenue: 9.2 },
  { month: "Jul", revenue: 8.6 },
  { month: "Aug", revenue: 10.5 },
  { month: "Sep", revenue: 9.8 },
  { month: "Oct", revenue: 11.4 },
  { month: "Nov", revenue: 12.8 },
];

const schools = [
  {
    name: "Delhi Public School",
    location: "New Delhi",
    students: "2,450",
    plan: "Enterprise",
    status: "Active",
  },
  {
    name: "Green Valley Academy",
    location: "Bengaluru",
    students: "1,820",
    plan: "Professional",
    status: "Active",
  },
  {
    name: "Oxford International",
    location: "Mumbai",
    students: "3,100",
    plan: "Enterprise",
    status: "Active",
  },
  {
    name: "Bright Future School",
    location: "Hyderabad",
    students: "980",
    plan: "Basic",
    status: "Pending",
  },
];

const activities = [
  {
    title: "New school registered",
    description: "Bright Future School joined the platform",
    time: "10 minutes ago",
    icon: School,
    color: "blue",
  },
  {
    title: "Subscription renewed",
    description: "Delhi Public School renewed its plan",
    time: "35 minutes ago",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    title: "Payment received",
    description: "₹45,000 payment successfully received",
    time: "1 hour ago",
    icon: IndianRupee,
    color: "violet",
  },
  {
    title: "Support request received",
    description: "A school administrator submitted a ticket",
    time: "2 hours ago",
    icon: AlertCircle,
    color: "orange",
  },
];

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  const Icon = stat.icon;

  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {stat.title}
        </p>

        <div className={`rounded-xl p-3 ${colors[stat.color]}`}>
          <Icon size={21} />
        </div>
      </div>

      <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {stat.value}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            stat.positive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {stat.positive ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          {stat.change}
        </span>

        <span className="text-xs text-slate-400">
          {stat.description}
        </span>
      </div>
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Revenue Overview
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Monthly platform revenue
          </p>
        </div>

        <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
          This year
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `₹${value}L`}
            />

            <Tooltip
              formatter={(value) => [`₹${value}L`, "Revenue"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentSchools() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h3 className="font-bold text-slate-900">
            Recent Schools
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Recently registered institutions
          </p>
        </div>

        <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">School</th>
              <th className="px-5 py-4 font-semibold">Students</th>
              <th className="px-5 py-4 font-semibold">Plan</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {schools.map((school) => (
              <tr
                key={school.name}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {school.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {school.location}
                  </p>
                </td>

                <td className="px-5 py-4 font-medium text-slate-700">
                  {school.students}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {school.plan}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      school.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {school.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`More actions for ${school.name}`}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">
            Recent Activity
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Latest platform activities
          </p>
        </div>

        <Activity size={20} className="text-slate-400" />
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          const Icon = activity.icon;

          const colorClasses: Record<string, string> = {
            blue: "bg-blue-50 text-blue-600",
            emerald: "bg-emerald-50 text-emerald-600",
            violet: "bg-violet-50 text-violet-600",
            orange: "bg-orange-50 text-orange-600",
          };

          return (
            <div key={activity.title} className="flex gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClasses[activity.color]}`}
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {activity.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {activity.description}
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-7">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor and manage your entire school management platform.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
          Platform overview
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>Demo mode:</strong> The statistics and school records below are sample data. Live platform data will be connected through your backend APIs.
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-900">
            Platform Summary
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Current demo overview
          </p>

          <div className="mt-7 space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Active Schools</span>
                <span className="font-semibold text-slate-800">220 / 248</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[88.7%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Active Subscriptions</span>
                <span className="font-semibold text-slate-800">198 / 248</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[79.8%] rounded-full bg-emerald-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Pending Approvals</span>
                <span className="font-semibold text-slate-800">12</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[25%] rounded-full bg-amber-500" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={19} />
              <span className="text-sm font-semibold">
                Platform status: Demo
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Real-time service health will be connected during backend integration.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentSchools />
        </div>

        <RecentActivity />
      </section>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        EduControl Super Admin Portal · Platform Management
      </footer>

    </div>
  );
}
