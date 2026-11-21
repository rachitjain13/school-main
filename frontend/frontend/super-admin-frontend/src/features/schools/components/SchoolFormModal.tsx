import { useState } from "react";
import {
  X,
  School,
  MapPin,
  UserRound,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import type {
  CreateSchoolInput,
  SchoolType,
  BoardingType,
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
  "Basic Information",
  "School Location",
  "Principal & Branding",
  "Review & Confirm",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

type FieldProps = {
  label: string;
  field?: keyof CreateSchoolInput;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

function Field({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: FieldProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  required?: boolean;
  onChange: (value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  required = false,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

export default function SchoolFormModal({
  onClose,
  onSubmit,
  initialData,
}: SchoolFormModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateSchoolInput>(
    initialData ?? emptyForm
  );
  const [error, setError] = useState("");

  const isEditing = Boolean(initialData);

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
        setError("Please complete all required school information.");
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(form.officialEmail)) {
        setError("Enter a valid school email address.");
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
        setError("Enter a valid Main Admin email address.");
        return false;
      }
    }

    setError("");
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, 3));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < 3) {
      handleNext();
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim(),
      state: form.state.trim(),
      officialEmail: form.officialEmail?.trim().toLowerCase(),
      adminName: form.adminName?.trim(),
      adminEmail: form.adminEmail?.trim().toLowerCase(),
    });
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto min-h-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="bg-gradient-to-br from-[#123D52] to-[#071D3B] px-6 py-9 text-white sm:px-10">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs uppercase tracking-widest">
                School Registration
              </span>

              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                {isEditing ? "Edit School" : "Register a New School"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Complete the guided steps to register your school and invite its
                Main Administrator.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-8 flex justify-between text-xs text-blue-100">
            <span>Step {step + 1} of 4</span>
            <span>{(step + 1) * 25}% Complete</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${(step + 1) * 25}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {steps.map((item, index) => {
              const Icon = [School, MapPin, UserRound, ClipboardCheck][index];

              return (
                <div
                  key={item}
                  className={`rounded-xl border p-3 ${
                    step === index
                      ? "border-emerald-400 bg-white/15"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {step > index ? (
                      <Check size={15} className="text-emerald-300" />
                    ) : (
                      <Icon size={15} className="text-blue-200" />
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-blue-200">
                      Stage {index + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold">{item}</p>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-9 sm:px-10">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 0 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Basic School Information
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Tell us about your school and its registration details.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field
                  label="School Name"
                  field="name"
                  value={form.name}
                  onChange={(value) => updateField("name", value)}
                  placeholder="ABC Public School"
                  required
                />
                <Field
                  label="School Code"
                  field="code"
                  value={form.code}
                  onChange={(value) => updateField("code", value)}
                  placeholder="SCH001"
                  required
                />

                <SelectField
                  label="School Type"
                  value={form.schoolType ?? ""}
                  onChange={(value) =>
                    updateField("schoolType", value as SchoolType)
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
                  value={form.boardingType ?? ""}
                  onChange={(value) =>
                    updateField("boardingType", value as BoardingType)
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
                  field="registrationNumber"
                  value={form.registrationNumber ?? ""}
                  onChange={(value) => updateField("registrationNumber", value)}
                  placeholder="REG-2026-001"
                />
                <Field
                  label="Official Email"
                  field="officialEmail"
                  value={form.officialEmail ?? ""}
                  onChange={(value) => updateField("officialEmail", value)}
                  type="email"
                  placeholder="school@example.com"
                  required
                />
                <Field
                  label="Contact Number"
                  field="contactNumber"
                  value={form.contactNumber ?? ""}
                  onChange={(value) => updateField("contactNumber", value)}
                  placeholder="+91 9876543210"
                  required
                />
                <Field
                  label="Established Year"
                  field="establishedYear"
                  value={form.establishedYear ?? ""}
                  onChange={(value) => updateField("establishedYear", value)}
                  placeholder="2010"
                  type="number"
                />
                <Field
                  label="Website"
                  field="website"
                  value={form.website ?? ""}
                  onChange={(value) => updateField("website", value)}
                  placeholder="https://school.com"
                />

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Subscription Plan
                  </label>
                  <select
                    value={form.plan}
                    onChange={(e) =>
                      updateField(
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
            </>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                School Location
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter the official address of the institution.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="Address Line 1"
                    field="addressLine1"
                    value={form.addressLine1 ?? ""}
                    onChange={(value) => updateField("addressLine1", value)}
                    placeholder="Main Road"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label="Address Line 2"
                    field="addressLine2"
                    value={form.addressLine2 ?? ""}
                    onChange={(value) => updateField("addressLine2", value)}
                    placeholder="Near Bus Stand (optional)"
                  />
                </div>
                <Field
                  label="Country"
                  field="country"
                  value={form.country ?? ""}
                  onChange={(value) => updateField("country", value)}
                  placeholder="India"
                  required
                />
                <Field
                  label="State"
                  field="state"
                  value={form.state}
                  onChange={(value) => updateField("state", value)}
                  placeholder="Karnataka"
                  required
                />
                <Field
                  label="City"
                  field="city"
                  value={form.city}
                  onChange={(value) => updateField("city", value)}
                  placeholder="Bengaluru"
                  required
                />
                <Field
                  label="PIN Code"
                  field="pinCode"
                  value={form.pinCode ?? ""}
                  onChange={(value) => updateField("pinCode", value)}
                  placeholder="560001"
                  required
                />
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Main Admin & Branding
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter the contact details of the school's Main Administrator.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field
                  label="Main Admin Full Name"
                  field="adminName"
                  value={form.adminName ?? ""}
                  onChange={(value) => updateField("adminName", value)}
                  placeholder="Rahul Sharma"
                  required
                />
                <Field
                  label="Main Admin Email"
                  field="adminEmail"
                  value={form.adminEmail ?? ""}
                  onChange={(value) => updateField("adminEmail", value)}
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
                <Field
                  label="Main Admin Phone"
                  field="adminPhone"
                  value={form.adminPhone ?? ""}
                  onChange={(value) => updateField("adminPhone", value)}
                  placeholder="+91 9876543210"
                  required
                />
                <Field
                  label="School Logo URL"
                  field="logo"
                  value={form.logo ?? ""}
                  onChange={(value) => updateField("logo", value)}
                  placeholder="https://example.com/logo.png"
                />

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    School Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Describe your school..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="font-bold text-emerald-900">
                  Main Admin Invitation
                </h3>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  An invitation will be sent to the Main Admin's email after
                  school registration. The Main Admin will accept the invitation
                  and create their own password. The Super Admin will not create
                  or set this password.
                </p>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Review & Confirm
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Check the information before registering this school.
              </p>

              <div className="mt-8 space-y-5">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-3 font-bold text-slate-900">
                    Section A: School Information
                  </h3>
                  <ReviewRow label="School Name" value={form.name} />
                  <ReviewRow label="School Code" value={form.code} />
                  <ReviewRow label="School Type" value={form.schoolType} />
                  <ReviewRow label="Boarding Type" value={form.boardingType} />
                  <ReviewRow
                    label="Registration Number"
                    value={form.registrationNumber}
                  />
                  <ReviewRow label="Official Email" value={form.officialEmail} />
                  <ReviewRow label="Contact Number" value={form.contactNumber} />
                  <ReviewRow
                    label="Established Year"
                    value={form.establishedYear}
                  />
                  <ReviewRow label="Website" value={form.website} />
                  <ReviewRow label="Subscription Plan" value={form.plan} />
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-3 font-bold text-slate-900">
                    Section B: School Address
                  </h3>
                  <ReviewRow label="Address" value={form.addressLine1} />
                  <ReviewRow
                    label="Address Line 2"
                    value={form.addressLine2}
                  />
                  <ReviewRow label="Country" value={form.country} />
                  <ReviewRow label="State" value={form.state} />
                  <ReviewRow label="City" value={form.city} />
                  <ReviewRow label="PIN Code" value={form.pinCode} />
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-3 font-bold text-slate-900">
                    Section C: Main Admin Details
                  </h3>
                  <ReviewRow label="Full Name" value={form.adminName} />
                  <ReviewRow label="Email" value={form.adminEmail} />
                  <ReviewRow label="Phone" value={form.adminPhone} />
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  The Main Admin will receive an invitation and set their own
                  password after accepting it.
                </div>
              </div>
            </>
          )}

          {/* FOOTER */}
          <div className="mt-10 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={
                step === 0
                  ? onClose
                  : () => {
                      setStep((current) => current - 1);
                      setError("");
                    }
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              {step === 0 ? "Cancel" : "Previous"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Check size={18} />
                {isEditing ? "Save Changes" : "Confirm & Register School"}
              </button>
            )}
          </div>
        </form>
      </div>
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
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="break-words text-sm text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}
