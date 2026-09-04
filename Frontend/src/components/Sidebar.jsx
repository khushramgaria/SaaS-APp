import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FolderKanban,
  CheckSquare,
  FileText,
  MessageSquare,
  Users,
  Activity,
  Settings,
  ChevronDown,
} from "lucide-react";

// Array of navigation items to avoid repeating code
const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Documents", path: "/documents", icon: FileText },
  { name: "Chat", path: "/chat", icon: MessageSquare },
  { name: "Members", path: "/members", icon: Users },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-[#0A0E1A] text-slate-200 border-r border-slate-800/60 flex flex-col justify-between p-4 select-none shrink-0">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Users className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            TeamSpace
          </span>
        </div>

        {/* Mapped Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-violet-500/30 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden relative">
              <span className="text-violet-300 font-semibold">KR</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate group-hover:text-violet-200 transition-colors">
                Khush Ramgaria
              </span>
              <span className="text-xs text-slate-400">Owner</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-200 transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
