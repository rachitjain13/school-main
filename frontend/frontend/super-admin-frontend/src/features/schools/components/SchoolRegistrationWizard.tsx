
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  School,
  MapPin,
  UserRound,
  ClipboardCheck,
  X,
  Upload,
} from "lucide-react";

import type {
  CreateSchoolInput,
  SchoolType,
  BoardingType,
  SubscriptionPlan,
} from "../types/school.types";

interface Props {
  onClose: () => void;
  onSubmit: (data: CreateSchoolInput) => void;
}

/* --------------------------------------------------
   REUSABLE COMPONENTS
   IMPORTANT: Keep these outside SchoolRegistrationWizard.
-------------------------------------------------- */

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: FieldProps) {
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: SelectFieldProps) {
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        <option value="">Select option</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 sm:grid-cols-2">
      <p className="text-sm font-semibold text-slate-600">
        {label}
      </p>

      <p className="break-words text-sm text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

/* --------------------------------------------------
   FORM INITIAL VALUES
-------------------------------------------------- */

const initialForm: CreateSchoolInput = {
  name: "",
  code: "",
  city: "",
  state: "",
  plan: "BASIC",
  schoolType: undefined,
  boardingType: undefined,
  registrationNumber: "",
  officialEmail: "",
  contactNumber: "",
  website: "",
  establishedYear: "",
  addressLine1: "",
  addressLine2: "",
  country: "India",
  pinCode: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  description: "",
  logo: "",
};

const steps = [
  { title: "Basic Information", icon: School },
  { title: "School Location", icon: MapPin },
  { title: "Principal & Branding", icon: UserRound },
  { title: "Review & Confirm", icon: ClipboardCheck },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "text-sm font-semibold text-slate-700";

/* --------------------------------------------------
   MAIN REGISTRATION WIZARD
-------------------------------------------------- */

export default function SchoolRegistrationWizard({
  onClose,
  onSubmit,
}: Props) {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<CreateSchoolInput>(
    initialForm
  );

  const [error, setError] = useState("");

  function updateField<K extends keyof CreateSchoolInput>(
    field: K,
    value: CreateSchoolInput[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  /* ---------------- VALIDATION ---------------- */

  function validateStep() {
    if (step === 0) {
      if (
        !form.name.trim() ||
        !form.code.trim() ||
        !form.schoolType ||
        !form.boardingType ||
        !form.officialEmail?.trim() ||
        !form.contactNumber?.trim()
      ) {
        setError(
          "Please complete all required school information."
        );
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(form.officialEmail)) {
        setError("Please enter a valid school email address.");
        return false;
      }
    }

    if (step === 1) {
      if (
        !form.addressLine1?.trim() ||
        !form.country?.trim() ||
        !form.state.trim() ||
        !form.city.trim() ||
        !form.pinCode?.trim()
      ) {
        setError("Please complete all required address fields.");
        return false;
      }
    }

    if (step === 2) {
      if (
        !form.adminName?.trim() ||
        !form.adminEmail?.trim() ||
        !form.adminPhone?.trim()
      ) {
        setError("Please complete all Main Admin details.");
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(form.adminEmail)) {
        setError("Please enter a valid Main Admin email address.");
        return false;
      }
    }

    setError("");
    return true;
  }

  /* ---------------- NAVIGATION ---------------- */

  function nextStep() {
    if (!validateStep()) return;

    setStep((current) => Math.min(current + 1, 3));
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  /* ---------------- SUBMISSION ---------------- */

  function handleSubmit() {
    onSubmit({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim(),
      state: form.state.trim(),
      adminName: form.adminName?.trim(),
      adminEmail: form.adminEmail?.trim().toLowerCase(),
      officialEmail: form.officialEmail?.trim().toLowerCase(),
    });
  }

  /* ---------------- REVIEW LABELS ---------------- */

  const schoolTypeLabels: Record<SchoolType, string> = {
    PRIMARY: "Primary School",
    HIGH_SCHOOL: "High School",
    INTER_COLLEGE: "Inter College",
    COLLEGE: "College",
    OTHER: "Other",
  };

  const boardingLabels: Record<BoardingType, string> = {
    DAY: "Day School",
    BOARDING: "Boarding School",
    BOTH: "Day & Boarding",
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-100">
      <div className="mx-auto min-h-screen max-w-5xl px-3 py-5 sm:px-6 sm:py-8">

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* WIZARD HEADER */}

          <div className="bg-gradient-to-br from-[#123D52] to-[#071D3B] px-5 py-8 text-white sm:px-10 sm:py-10">

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
                  <School size={13} />
                  School Registration
                </span>

                <h1 className="mt-5 text-2xl font-bold sm:text-4xl">
                  Register a New School
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                  Complete the guided steps to register the institution,
                  provide its location and invite its Main Administrator.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close registration"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-8 flex items-center justify-between text-xs font-medium text-blue-100">
              <span>Step {step + 1} of 4</span>
              <span>{(step + 1) * 25}% Complete</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${(step + 1) * 25}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {steps.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`rounded-xl border p-3 ${
                      step === index
                        ? "border-emerald-400/50 bg-white/15"
                        : step > index
                          ? "border-emerald-400/30 bg-emerald-400/10"
                          : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {step > index ? (
                        <Check size={16} className="text-emerald-300" />
                      ) : (
                        <Icon size={16} className="text-blue-200" />
                      )}

                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                        Stage {index + 1}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-white">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM CONTENT */}

          <div className="px-5 py-8 sm:px-10 sm:py-10">

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* STEP 1: BASIC INFORMATION */}

            {step === 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Basic School Information
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Tell us about the institution you want to register.
                </p>

                <div className="mt-8 grid gap-5 md:grid-cols-2">

                  <Field
                    label="School Name"
                    value={form.name}
                    onChange={(v) => updateField("name", v)}
                    placeholder="Example Academy"
                    required
                  />

                  <Field
                    label="School Code"
                    value={form.code}
                    onChange={(v) => updateField("code", v)}
                    placeholder="Example: SCH001"
                    required
                  />

                  <SelectField
                    label="School Type"
                    value={form.schoolType || ""}
                    onChange={(v) =>
                      updateField("schoolType", v as SchoolType)
                    }
                    required
                    options={[
                      { label: "Primary School", value: "PRIMARY" },
                      { label: "High School", value: "HIGH_SCHOOL" },
                      { label: "Inter College", value: "INTER_COLLEGE" },
                      { label: "College", value: "COLLEGE" },
                      { label: "Other", value: "OTHER" },
                    ]}
                  />

                  <SelectField
                    label="Boarding Type"
                    value={form.boardingType || ""}
                    onChange={(v) =>
                      updateField("boardingType", v as BoardingType)
                    }
                    required
                    options={[
                      { label: "Day School", value: "DAY" },
                      { label: "Boarding School", value: "BOARDING" },
                      { label: "Day & Boarding", value: "BOTH" },
                    ]}
                  />

                  <Field
                    label="Registration Number"
                    value={form.registrationNumber || ""}
                    onChange={(v) => updateField("registrationNumber", v)}
                    placeholder="REG-2026-001"
                  />

                  <Field
                    label="Official Email"
                    type="email"
                    value={form.officialEmail || ""}
                    onChange={(v) => updateField("officialEmail", v)}
                    placeholder="school@example.com"
                    required
                  />

                  <Field
                    label="Primary Contact Number"
                    value={form.contactNumber || ""}
                    onChange={(v) => updateField("contactNumber", v)}
                    placeholder="+91 9876543210"
                    required
                  />

                  <Field
                    label="Established Year"
                    value={form.establishedYear || ""}
                    onChange={(v) => updateField("establishedYear", v)}
                    placeholder="2010"
                    type="number"
                  />

                  <Field
                    label="Website"
                    value={form.website || ""}
                    onChange={(v) => updateField("website", v)}
                    placeholder="https://www.school.com"
                  />

                  <div>
                    <label className={labelClass}>
                      Subscription Plan
                    </label>

                    <select
                      value={form.plan}
                      onChange={(e) =>
                        updateField(
                          "plan",
                          e.target.value as SubscriptionPlan
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
              </section>
            )}

            {/* STEP 2: SCHOOL LOCATION */}

            {step === 1 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  School Location
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Enter the official registered address of the school.
                </p>

                <div className="mt-8 grid gap-5 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <Field
                      label="Address Line 1"
                      value={form.addressLine1 || ""}
                      onChange={(v) => updateField("addressLine1", v)}
                      placeholder="Building, street, main road"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Field
                      label="Address Line 2"
                      value={form.addressLine2 || ""}
                      onChange={(v) => updateField("addressLine2", v)}
                      placeholder="Area, landmark (optional)"
                    />
                  </div>

                  <Field
                    label="Country"
                    value={form.country || ""}
                    onChange={(v) => updateField("country", v)}
                    placeholder="India"
                    required
                  />

                  <Field
                    label="State"
                    value={form.state}
                    onChange={(v) => updateField("state", v)}
                    placeholder="Karnataka"
                    required
                  />

                  <Field
                    label="City"
                    value={form.city}
                    onChange={(v) => updateField("city", v)}
                    placeholder="Bengaluru"
                    required
                  />

                  <Field
                    label="PIN Code"
                    value={form.pinCode || ""}
                    onChange={(v) => updateField("pinCode", v)}
                    placeholder="560001"
                    required
                  />

                </div>
              </section>
            )}

            {/* STEP 3: MAIN ADMIN & BRANDING */}

            {step === 2 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Main Admin & Branding
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Add the person who will administer this school's account.
                </p>

                <div className="mt-8 grid gap-5 md:grid-cols-2">

                  <Field
                    label="Main Admin Full Name"
                    value={form.adminName || ""}
                    onChange={(v) => updateField("adminName", v)}
                    placeholder="Rahul Sharma"
                    required
                  />

                  <Field
                    label="Main Admin Email"
                    type="email"
                    value={form.adminEmail || ""}
                    onChange={(v) => updateField("adminEmail", v)}
                    placeholder="admin@example.com"
                    required
                  />

                  <Field
                    label="Main Admin Phone"
                    value={form.adminPhone || ""}
                    onChange={(v) => updateField("adminPhone", v)}
                    placeholder="+91 9876543210"
                    required
                  />

                  <Field
                    label="School Logo URL"
                    value={form.logo || ""}
                    onChange={(v) => updateField("logo", v)}
                    placeholder="https://example.com/logo.png"
                  />

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      School Description
                    </label>

                    <textarea
                      value={form.description || ""}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      rows={4}
                      placeholder="Brief description about the school..."
                      className={inputClass}
                    />
                  </div>

                </div>

                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-emerald-700">
                      <Upload size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-emerald-900">
                        Main Admin Invitation
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        After registration, an invitation will be sent to
                        the Main Admin's email address. They will accept
                        the invitation and set their own password. You
                        will not create or manage their password.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}

            {step === 3 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Review & Confirm
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Verify the information before registering this school.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-2 font-bold text-slate-900">
                    Section A: School Information
                  </h3>

                  <ReviewRow label="School Name" value={form.name} />
                  <ReviewRow label="School Code" value={form.code} />

                  <ReviewRow
                    label="School Type"
                    value={
                      form.schoolType
                        ? schoolTypeLabels[form.schoolType]
                        : ""
                    }
                  />

                  <ReviewRow
                    label="Boarding Type"
                    value={
                      form.boardingType
                        ? boardingLabels[form.boardingType]
                        : ""
                    }
                  />

                  <ReviewRow
                    label="Registration Number"
                    value={form.registrationNumber}
                  />

                  <ReviewRow
                    label="Official Email"
                    value={form.officialEmail}
                  />

                  <ReviewRow
                    label="Contact Number"
                    value={form.contactNumber}
                  />

                  <ReviewRow
                    label="Established Year"
                    value={form.establishedYear}
                  />

                  <ReviewRow label="Website" value={form.website} />

                  <ReviewRow
                    label="Subscription Plan"
                    value={form.plan}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-2 font-bold text-slate-900">
                    Section B: School Address
                  </h3>

                  <ReviewRow
                    label="Address Line 1"
                    value={form.addressLine1}
                  />

                  <ReviewRow
                    label="Address Line 2"
                    value={form.addressLine2}
                  />

                  <ReviewRow label="Country" value={form.country} />
                  <ReviewRow label="State" value={form.state} />
                  <ReviewRow label="City" value={form.city} />
                  <ReviewRow label="PIN Code" value={form.pinCode} />
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-2 font-bold text-slate-900">
                    Section C: Main Admin Details
                  </h3>

                  <ReviewRow
                    label="Full Name"
                    value={form.adminName}
                  />

                  <ReviewRow
                    label="Email"
                    value={form.adminEmail}
                  />

                  <ReviewRow
                    label="Phone"
                    value={form.adminPhone}
                  />

                  <ReviewRow
                    label="School Logo URL"
                    value={form.logo}
                  />

                  <ReviewRow
                    label="Description"
                    value={form.description}
                  />
                </div>

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                  <strong>Important:</strong> Confirming will register
                  the school in the demo list. The real email invitation
                  and Main Admin password setup will be connected to
                  your backend later.
                </div>
              </section>
            )}

            {/* FOOTER NAVIGATION */}

            <div className="mt-10 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">

              <button
                type="button"
                onClick={step === 0 ? onClose : previousStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                {step === 0 ? "Cancel" : "Previous"}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  <Check size={18} />
                  Confirm & Register School
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

