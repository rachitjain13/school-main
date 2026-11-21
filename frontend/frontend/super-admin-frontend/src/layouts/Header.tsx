
import {
  Menu,
  Bell,
  Search,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {

  // Navigation
  const navigate = useNavigate();

  // Logout Function
  function handleLogout() {
    sessionStorage.removeItem("demo_super_admin");

    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Overview
          </h2>

          <p className="hidden text-xs text-slate-500 sm:block">
            Manage your education platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search size={17} className="text-slate-400" />

          <input
            type="search"
            placeholder="Search..."
            className="w-36 bg-transparent text-sm outline-none lg:w-48"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile and Logout */}
        <div className="flex items-center gap-3">

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              SA
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Super Admin
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={17} />

            <span className="hidden sm:inline">
              Logout
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}
