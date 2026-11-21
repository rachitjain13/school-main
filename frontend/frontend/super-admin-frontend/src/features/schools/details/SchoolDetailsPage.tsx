
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  School,
  MapPin,
  MoreHorizontal,
} from "lucide-react";

import SchoolOverview from "./components/SchoolOverview";

import { initialSchools } from "../data/schools.data";

import type { School as SchoolType } from "../types/school.types";

export default function SchoolDetailsPage() {
  const { schoolId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationState = location.state as
    | { school?: SchoolType }
    | null;

  // Use the selected school when navigating from the listing.
  // Otherwise, fall back to the initial demonstration records.
  const school =
    navigationState?.school?.id === schoolId
      ? navigationState.school
      : initialSchools.find((item) => item.id === schoolId);

  if (!school) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <School size={40} className="mx-auto text-slate-300" />

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          School Not Found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          The requested school record could not be found.
        </p>

        <button
          onClick={() => navigate("/schools")}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Schools
        </button>
      </div>
    );
  }

  const statusColors = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    SUSPENDED: "bg-red-50 text-red-700",
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:text-blue-600"
        >
          Platform
        </button>

        <span>/</span>

        <button
          onClick={() => navigate("/schools")}
          className="hover:text-blue-600"
        >
          Schools
        </button>

        <span>/</span>

        <span className="text-blue-600">School Details</span>
      </div>

      {/* School header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <School size={32} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {school.name}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[school.status]}`}
                >
                  {school.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                School ID: {school.id}
              </p>

              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={15} />
                {school.city}, {school.state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/schools")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Back to Schools
            </button>

            <button
              title="More school actions will be implemented later"
              className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

        </div>
      </section>

      {/* Page content */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          School Overview
        </h2>

        <SchoolOverview school={school} />
      </div>

    </div>
  );
}
