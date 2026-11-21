
import {
  LayoutDashboard,
  School,
  Users,
  CreditCard,
  Wallet,
  Activity,
  BarChart3,
  Headset,
  ClipboardList,
  Settings,
  GraduationCap,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Schools", path: "/schools", icon: School },
  { name: "Administrators", path: "/administrators", icon: Users },
  { name: "Subscriptions", path: "/subscriptions", icon: CreditCard },
  { name: "Payments", path: "/payments", icon: Wallet },
  { name: "Monitoring", path: "/monitoring", icon: Activity },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Support", path: "/support", icon: Headset },
  { name: "Audit Logs", path: "/audit-logs", icon: ClipboardList },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide">
                EduControl
              </h1>
              <p className="text-xs text-slate-400">
                Platform Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        <div className="px-5 pb-2 pt-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
              SA
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold">Super Admin</p>
              <p className="text-xs text-slate-400">
                Platform Owner
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
