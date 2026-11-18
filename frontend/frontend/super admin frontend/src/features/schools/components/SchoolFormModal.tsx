
import { useState } from "react";
import { X, School } from "lucide-react";

import type {
  CreateSchoolInput,
} from "../types/school.types";

interface SchoolFormModalProps {
  onClose: () => void;
  onSubmit: (data: CreateSchoolInput) => void;
  initialData?: CreateSchoolInput;
}

const emptyForm: CreateSchoolInput = {
  name: "",
  code: "",
  city: "",
  state: "",
  plan: "BASIC",
};

export default function SchoolFormModal({
  onClose,
  onSubmit,
  initialData,
}: SchoolFormModalProps) {
  const [form, setForm] = useState<CreateSchoolInput>(
    initialData ?? emptyForm
  );

  const [error, setError] = useState("");

  function handleChange(
    field: keyof CreateSchoolInput,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim(),
      state: form.state.trim(),
    });
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="school-modal-title"
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <School size={22} />
            </div>

            <div>
              <h2
                id="school-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                {initialData ? "Edit School" : "Register New School"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {initialData
                  ? "Update the institution information."
                  : "Add a new institution to your platform."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700">
                School Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter school name"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                School Code *
              </label>
              <input
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="Example: DPS001"
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  City *
                </label>
                <input
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Enter city"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  State *
                </label>
                <input
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Enter state"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Subscription Plan *
              </label>

              <select
                value={form.plan}
                onChange={(e) =>
                  handleChange(
                    "plan",
                    e.target.value as CreateSchoolInput["plan"]
                  )
                }
                className={inputClass}
              >
                <option value="BASIC">Basic</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {initialData ? "Save Changes" : "Register School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

