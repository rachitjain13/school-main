import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router-dom";


import {
  School,
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  Ban,
  Pencil,
} from "lucide-react";

import SchoolFormModal from "./components/SchoolFormModal";

import { initialSchools } from "./data/schools.data";

import type {
  School as SchoolType,
  SchoolStatus,
  SubscriptionPlan,
  CreateSchoolInput,
} from "./types/school.types";

type StatusFilter = "ALL" | SchoolStatus;
type PlanFilter = "ALL" | SubscriptionPlan;

const statusStyles: Record<SchoolStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-700",
};

const planLabels: Record<SubscriptionPlan, string> = {
  BASIC: "Basic",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

export default function SchoolsPage() {

  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolType[]>(initialSchools);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [planFilter, setPlanFilter] =
    useState<PlanFilter>("ALL");
  const [showModal, setShowModal] = useState(false);

  const [editingSchool, setEditingSchool] =
  useState<SchoolType | null>(null);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        school.name.toLowerCase().includes(searchText) ||
        school.code.toLowerCase().includes(searchText) ||
        school.city.toLowerCase().includes(searchText) ||
        school.state.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        school.status === statusFilter;

      const matchesPlan =
        planFilter === "ALL" ||
        school.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [schools, search, statusFilter, planFilter]);

  const activeCount = schools.filter(
    (school) => school.status === "ACTIVE"
  ).length;

  const pendingCount = schools.filter(
    (school) => school.status === "PENDING"
  ).length;

  const suspendedCount = schools.filter(
    (school) => school.status === "SUSPENDED"
  ).length;

  const totalStudents = schools.reduce(
    (total, school) => total + school.students,
    0
  );

 
function handleSaveSchool(data: CreateSchoolInput) {
  const duplicate = schools.some(
    (school) =>
      school.code.toLowerCase() === data.code.toLowerCase() &&
      school.id !== editingSchool?.id
  );

  if (duplicate) {
    window.alert("A school with this code already exists.");
    return;
  }

  if (editingSchool) {
    setSchools((previous) =>
      previous.map((school) =>
        school.id === editingSchool.id
          ? {
              ...school,
              ...data,
            }
          : school
      )
    );

    setEditingSchool(null);
    setShowModal(false);
    return;
  }

  const newSchool: SchoolType = {
    ...data,
    id: `SCH-${Date.now()}`,
    students: 0,
    teachers: 0,
    status: "PENDING",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  setSchools((previous) => [newSchool, ...previous]);
  setShowModal(false);
}

  function handleStatusChange(schoolId: string) {
    setSchools((previous) =>
      previous.map((school) => {
        if (school.id !== schoolId) return school;

        const nextStatus: SchoolStatus =
          school.status === "ACTIVE" ||
          school.status === "PENDING"
            ? "SUSPENDED"
            : "ACTIVE";

        return {
          ...school,
          status: nextStatus,
        };
      })
    );
  }

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
            Manage, monitor and control all registered schools.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={19} />
          Add New School
        </button>
      </div>

      {/* Demo notice */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>Demo mode:</strong> School records are currently stored
        in frontend memory. Backend persistence will be added during
        API integration.
      </div>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Schools"
          value={schools.length.toString()}
          description="All registered schools"
          icon={Building2}
          color="blue"
        />

        <StatCard
          title="Active Schools"
          value={activeCount.toString()}
          description="Currently active"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Approval"
          value={pendingCount.toString()}
          description="Awaiting activation"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString("en-IN")}
          description={`${suspendedCount} suspended schools`}
          icon={GraduationCap}
          color="violet"
        />

      </section>

      {/* School table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="font-bold text-slate-900">
              Registered Schools
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredSchools.length} of {schools.length} schools
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-64">
              <Search size={18} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search school..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Filter size={16} className="text-slate-400" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="bg-transparent py-2.5 text-sm text-slate-600 outline-none"
                aria-label="Filter by status"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={(e) =>
                setPlanFilter(e.target.value as PlanFilter)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
              aria-label="Filter by subscription"
            >
              <option value="ALL">All Plans</option>
              <option value="BASIC">Basic</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">School</th>
                <th className="px-5 py-4 font-semibold">School ID</th>
                <th className="px-5 py-4 font-semibold">Students</th>
                <th className="px-5 py-4 font-semibold">Teachers</th>
                <th className="px-5 py-4 font-semibold">Plan</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredSchools.map((school) => (
                <tr
                  key={school.id}
                  className="transition hover:bg-slate-50/80"
                >

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <School size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {school.name}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={12} />
                          {school.city}, {school.state}
                        </p>
                      </div>

                    </div>
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-600">
                    {school.code}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {school.students.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {school.teachers.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {planLabels[school.plan]}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[school.status]}`}
                    >
                      {school.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      
<button
  title="Edit school"
  onClick={() => {
    setEditingSchool(school);
    setShowModal(true);
  }}
  className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50"
>
  <Pencil size={18} />
</button>


                      <button
                        onClick={() => handleStatusChange(school.id)}
                        title={
                          school.status === "SUSPENDED"
                            ? "Activate school"
                            : "Suspend school"
                        }
                        className={`rounded-lg p-2 transition ${
                          school.status === "SUSPENDED"
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                      >
                        {school.status === "SUSPENDED" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Ban size={18} />
                        )}
                      </button>

                      
<button
  title="View school details"
  onClick={() =>
    navigate(`/schools/${school.id}`, {
      state: { school },
    })
  }
  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
>
  <MoreHorizontal size={19} />
</button>


                    </div>
                  </td>

                </tr>
              ))}

              {filteredSchools.length === 0 && (
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
                      Try changing your search or filters.
                    </p>

                    <button
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("ALL");
                        setPlanFilter("ALL");
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

        {/* Table footer */}
        <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row">
          <span>
            Displaying {filteredSchools.length} school records
          </span>

          <span>
            Total registered schools: {schools.length}
          </span>
        </div>

      </section>

      
      {showModal && (
  <SchoolFormModal
    onClose={() => {
      setShowModal(false);
      setEditingSchool(null);
    }}
    onSubmit={handleSaveSchool}
    initialData={
      editingSchool
        ? {
            name: editingSchool.name,
            code: editingSchool.code,
            city: editingSchool.city,
            state: editingSchool.state,
            plan: editingSchool.plan,
          }
        : undefined
    }
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
  value: string;
  description: string;
  icon: ElementType;
  color: "blue" | "emerald" | "amber" | "violet";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
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
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}
