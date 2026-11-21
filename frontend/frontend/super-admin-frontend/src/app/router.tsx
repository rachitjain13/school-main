
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import DashboardPage from "../features/dashboard/DashboardPage";

import SchoolsPage from "../features/schools/SchoolsPage";

import SchoolDetailsPage from "../features/schools/details/SchoolDetailsPage";

// Login Page Import
import LoginPage from "../features/authentication/pages/LoginPage";

function ModulePlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        This module will be developed in a future phase.
      </p>
    </div>
  );
}

const moduleRoutes = [
  { path: "administrators", title: "Administrator Management" },
  { path: "subscriptions", title: "Subscription Management" },
  { path: "payments", title: "Payment Management" },
  { path: "monitoring", title: "Platform Monitoring" },
  { path: "analytics", title: "Platform Analytics" },
  { path: "support", title: "Support Management" },
  { path: "audit-logs", title: "Audit Logs" },
  { path: "settings", title: "Platform Settings" },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // Login Route (Outside DashboardLayout)
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: <DashboardLayout />,

    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },

      {
        path: "schools",
        element: <SchoolsPage />,
      },

      {
        path: "schools/:schoolId",
        element: <SchoolDetailsPage />,
      },

      ...moduleRoutes.map((module) => ({
        path: module.path,
        element: <ModulePlaceholder title={module.title} />,
      })),
    ],
  },

  {
    path: "*",
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800">
          404 - Page Not Found
        </h1>
      </div>
    ),
  },
]);
