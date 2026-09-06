import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
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
  LogOut,
  Building2,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice";
import { OfflineSyncBadge } from "./common/OfflineSyncBadge";

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

// Helper to get initials from user name
const getInitials = (name) => {
  if (!name) return "TS";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, activeWorkspace } = useSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = user?.name || "Khush Ramgaria";
  const userRole = activeWorkspace?.role || "Owner";
  const workspaceName = activeWorkspace?.name || "TeamSpace";
  const initials = getInitials(userName);

  return (
    <aside className="w-64 h-full bg-white dark:bg-[#0A0E1A] text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800/60 flex flex-col justify-between p-4 select-none shrink-0 relative transition-colors duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-5">
        {/* Logo & Offline Status Section */}
        <div className="flex flex-col gap-3 px-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 shrink-0">
                <Users className="w-4.5 h-4.5 fill-current" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {workspaceName}
                </span>
                {activeWorkspace?.name && (
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-violet-600 dark:text-violet-400 -mt-1 flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5 inline" /> Workspace
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Network Connection Badge */}
          <div className="pt-1">
            <OfflineSyncBadge />
          </div>
        </div>

        {/* Mapped Navigation Links */}
        <nav className="flex flex-col gap-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 relative" ref={menuRef}>
        {/* User Menu Dropdown Popup */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors mt-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setShowUserMenu((prev) => !prev)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-600 dark:text-violet-300 font-bold text-xs shrink-0 overflow-hidden shadow-inner">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-200 transition-colors">
                {userName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole}</span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
              showUserMenu ? "rotate-180 text-violet-600 dark:text-violet-400" : ""
            }`}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
